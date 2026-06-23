import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Persona = "ceo" | "cfo" | "finance" | "it" | "operations" | "facilities";

export const PERSONAS: Record<Persona, { label: string; title: string; route: string; tagline: string }> = {
  ceo: { label: "CEO / CXO", title: "Chief Executive Officer", route: "/ceo", tagline: "Enterprise pulse & strategic KPIs" },
  cfo: { label: "CFO", title: "Chief Financial Officer", route: "/cfo", tagline: "Profitability, MIS & Publish" },
  finance: { label: "Finance", title: "Finance Team Lead", route: "/finance", tagline: "Upload, validate, reconcile" },
  it: { label: "IT / Admin", title: "IT / Admin Head", route: "/it", tagline: "Infra, seats & software costs" },
  operations: { label: "Operations", title: "Operations Head", route: "/operations", tagline: "Process metrics & utilization" },
  facilities: { label: "Facilities", title: "Facilities Head", route: "/facilities", tagline: "Building, utilities & expenses" },
};

type User = { persona: Persona; name: string; email: string };
const KEY = "finsightz.user";

type Ctx = {
  user: User | null;
  login: (persona: Persona, email: string) => User;
  logout: () => void;
  ready: boolean;
};
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login = (persona: Persona, email: string) => {
    const name = email.split("@")[0] || PERSONAS[persona].label;
    const u: User = { persona, email, name: name.charAt(0).toUpperCase() + name.slice(1) };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, ready }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
