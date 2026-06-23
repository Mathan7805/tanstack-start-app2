import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles } from "lucide-react";
import { PERSONAS, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppShell({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const persona = PERSONAS[user.persona];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--gradient-emerald)] grid place-items-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">FInsightZ</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{persona.label} Suite</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                to={n.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{persona.title}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">{eyebrow}</div>}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent?: "emerald" | "gold" | "default" }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-elevated">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-display font-bold ${accent === "emerald" ? "text-gradient-emerald" : accent === "gold" ? "text-gradient-gold" : "text-foreground"}`}>
        {value}
      </div>
      {delta && <div className="mt-1 text-xs text-success">{delta}</div>}
    </div>
  );
}
