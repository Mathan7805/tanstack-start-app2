import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SCHEMA = {
  name: "extract_invoice",
  description: "Extract structured invoice header fields.",
  parameters: {
    type: "object",
    properties: {
      invoice_number: { type: "string" },
      invoice_date: { type: "string", description: "ISO date if possible" },
      party_name: { type: "string", description: "Vendor (for AP) or Client (for AR)" },
      party_gstin: { type: "string" },
      currency: { type: "string" },
      amount: { type: "number", description: "Total invoice amount (incl. tax)" },
      taxable_amount: { type: "number" },
      gst_amount: { type: "number" },
      status: { type: "string", description: "billed|unbilled|paid|unpaid|unknown" },
      cost_center: { type: "string" },
      line_summary: { type: "string", description: "1-line summary of what was billed" },
    },
    required: ["party_name", "amount"],
    additionalProperties: false,
  },
};

const Input = z.object({
  filename: z.string().min(1).max(255),
  mime: z.string().min(1).max(120),
  dataBase64: z.string().min(10),
  kind: z.enum(["client_issued", "client_billing", "vendor_received"]),
});

export const extractInvoice = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const systemByKind: Record<typeof data.kind, string> = {
      client_issued: "You are extracting a CLIENT INVOICE raised BY our company. 'party_name' is the customer/client.",
      client_billing: "You are extracting a billing/contract Excel-or-PDF for a client. 'party_name' is the customer/client.",
      vendor_received: "You are extracting a VENDOR INVOICE issued TO our company. 'party_name' is the vendor/supplier.",
    };

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `${systemByKind[data.kind]} Always call the extract_invoice tool. If a field is unknown, omit it.` },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract invoice fields from this document: ${data.filename}` },
            { type: "image_url", image_url: { url: `data:${data.mime};base64,${data.dataBase64}` } },
          ],
        },
      ],
      tools: [{ type: "function", function: SCHEMA }],
      tool_choice: { type: "function", function: { name: "extract_invoice" } },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("AI rate limit hit — please try again in a minute.");
      if (res.status === 402) throw new Error("AI credits exhausted — top up in Workspace settings.");
      throw new Error(`AI extraction failed [${res.status}]: ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) return { ok: false as const, fields: {} };
    try {
      return { ok: true as const, fields: JSON.parse(call.function.arguments) };
    } catch {
      return { ok: false as const, fields: {} };
    }
  });
