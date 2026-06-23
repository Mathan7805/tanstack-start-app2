import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

export function StubPage({
  nav,
  eyebrow,
  title,
  subtitle,
  stats,
  sections,
}: {
  nav: NavItem[];
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string; delta?: string; accent?: "emerald" | "gold" | "default" }[];
  sections: { title: string; items: { name: string; meta: string; tag?: string }[] }[];
}) {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <div key={sec.title} className="glass rounded-2xl p-6 shadow-elevated">
              <h3 className="font-display font-semibold text-lg mb-4">{sec.title}</h3>
              <div className="space-y-3">
                {sec.items.map((i) => (
                  <div
                    key={i.name}
                    className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.meta}</div>
                    </div>
                    {i.tag && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        {i.tag}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
