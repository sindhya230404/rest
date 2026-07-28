import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  TrendingUp,
  Users,
  ClipboardList,
  QrCode,
  Flame,
  Wallet,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: LoginPage,
});

type Role = "reception" | "kitchen" | "admin";

const CREDENTIALS: Record<string, { password: string; redirect: `/${Role}` }> = {
  "reception@restaurant.com": { password: "Reception@123", redirect: "/reception" },
  "kitchen@restaurant.com": { password: "Kitchen@123", redirect: "/kitchen" },
  "admin@restaurant.com": { password: "Admin@123", redirect: "/admin" },
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live simulation states for continuous live activity preview
  const [liveOrders, setLiveOrders] = useState(1284);
  const [liveRevenue, setLiveRevenue] = useState(48920);
  const [liveTables, setLiveTables] = useState(86);
  const [recentActivity, setRecentActivity] = useState<string>(
    "Table 4 ordered 2x Butter Chicken • Just now"
  );
  const [tickerIndex, setTickerIndex] = useState(0);

  const activities = [
    "Table 4 ordered 2x Butter Chicken • Just now",
    "Kitchen finished Order #1042 • 2s ago",
    "Table 12 bill generated ₹2,450 • 5s ago",
    "New QR Order from Table 7 • 8s ago",
    "Table 3 requested waiter • 12s ago",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOrders((prev) => prev + Math.floor(Math.random() * 2));
      setLiveRevenue((prev) => prev + Math.floor(Math.random() * 150));
      setLiveTables((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1);
        return next > 95 ? 92 : next < 75 ? 80 : next;
      });
      setTickerIndex((prev) => (prev + 1) % activities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setRecentActivity(activities[tickerIndex]);
  }, [tickerIndex]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const entry = CREDENTIALS[email.trim().toLowerCase()];
    if (!entry || entry.password !== password) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "savora.auth",
          JSON.stringify({ email: email.trim().toLowerCase(), redirect: entry.redirect })
        );
      }
    } catch {
      // storage unavailable — ignore
    }

    navigate({ to: entry.redirect });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.97_0.04_60)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.05_30)_0%,transparent_55%)]" />
        <div className="animate-float-slow absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-[oklch(0.78_0.18_35)] opacity-30 blur-3xl" />
        <div className="animate-float-slower absolute top-1/2 -right-40 h-[520px] w-[520px] rounded-full bg-[oklch(0.72_0.2_25)] opacity-25 blur-3xl" />
        <div className="animate-float-slow absolute -bottom-40 left-1/3 h-[380px] w-[380px] rounded-full bg-[oklch(0.85_0.12_65)] opacity-30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      <main className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-12 lg:py-14 xl:px-20">
        {/* Left — Form */}
        <section className="animate-rise flex flex-col justify-center">
          <header className="flex items-center justify-between gap-4 mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl shadow-[var(--shadow-elegant)]" style={{ backgroundImage: "var(--gradient-brand)" }}>
                <UtensilsCrossed className="h-6 w-6 text-white" strokeWidth={2.2} />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/40" />
              </div>
              <div className="leading-tight">
                <div className="text-xl font-bold tracking-tight text-foreground">ScanDine</div>
              </div>
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.7_0.2_35)]" />
              Premium SaaS
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-6">
            <div className="mb-8">
              <h1 className="text-[2.15rem] font-bold tracking-tight leading-[1.1] sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Sign in to manage your restaurant — orders, tables, kitchen and revenue in one place.
              </p>
            </div>

            <div className="relative rounded-[28px] border border-white/60 bg-white/70 p-7 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-9">
              {/* Glass reflection */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Field
                  id="email"
                  label="Email or Phone"
                  type="text"
                  placeholder="you@restaurant.com"
                  icon={<Mail className="h-4.5 w-4.5" />}
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  icon={<Lock className="h-4.5 w-4.5" />}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="block transition-transform duration-300" style={{ transform: showPassword ? "rotate(180deg)" : "rotate(0)" }}>
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </span>
                    </button>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-20px_oklch(0.65_0.22_25/0.55)] active:translate-y-0 disabled:opacity-80"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                >
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.35)_50%,transparent_80%)] bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:[animation:shimmer_1.6s_linear_infinite]" />
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Right — Illustration panel (hidden on tablet/mobile) */}
        <aside className="animate-rise relative hidden lg:block" style={{ animationDelay: "120ms" }}>
          <div className="relative h-full min-h-[720px] w-full overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-[oklch(0.98_0.02_60)] via-white to-[oklch(0.96_0.04_35)] p-10 shadow-[var(--shadow-soft)]">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[oklch(0.78_0.19_35)] opacity-30 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[oklch(0.85_0.12_60)] opacity-40 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  Live dashboard preview
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <Activity className="h-3 w-3 animate-pulse text-emerald-600" /> Continuous Live Feed
                </span>
              </div>

              <h2 className="mt-4 max-w-md text-[2rem] font-bold leading-[1.1] tracking-tight">
                Run every table, order and kitchen ticket — beautifully.
              </h2>

              {/* Stats row with live values */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                <StatCard icon={<ClipboardList className="h-4 w-4" />} label="Orders" value={liveOrders.toLocaleString()} trend="+12%" isLive />
                <StatCard icon={<Wallet className="h-4 w-4" />} label="Revenue" value={`₹${(liveRevenue / 1000).toFixed(1)}k`} trend="+8.4%" isLive />
                <StatCard icon={<Users className="h-4 w-4" />} label="Tables" value={`${liveTables}%`} trend="Live" isLive />
              </div>

              {/* Live Chart card */}
              <div className="relative mt-5 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weekly Revenue</div>
                    <div className="mt-1 text-2xl font-bold">₹{liveRevenue.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[oklch(0.95_0.06_140)] px-2.5 py-1 text-xs font-semibold text-[oklch(0.45_0.15_150)] shadow-xs">
                    <TrendingUp className="h-3.5 w-3.5 animate-bounce" /> +18.2%
                  </div>
                </div>
                <MiniChart />
              </div>

              {/* Floating feature cards with live status indicators */}
              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <FeatureCard icon={<QrCode className="h-4 w-4" />} title="QR Ordering" sub="24 tables active" active />
                <FeatureCard icon={<Flame className="h-4 w-4" />} title="Kitchen Screen" sub="7 tickets in queue" active />
                <FeatureCard icon={<ChefHat className="h-4 w-4" />} title="Chef Board" sub="3 chefs on shift" active />
                <FeatureCard icon={<ClipboardList className="h-4 w-4" />} title="Inventory" sub="Auto-restock on" active />
              </div>

              {/* Live Activity Feed Component */}
              <div className="mt-auto flex items-center gap-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm backdrop-blur transition-all">
                <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 border border-white" />
                  </span>
                </div>
                <div className="overflow-hidden text-sm">
                  <div className="flex items-center gap-2 font-semibold text-emerald-950">
                    <span>Live Activity Stream</span>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Active</span>
                  </div>
                  <div className="truncate text-xs font-medium text-emerald-800/90 transition-all duration-300">
                    {recentActivity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({
  id, label, type, placeholder, icon, trailing, autoComplete, value, onChange, required,
}: {
  id: string; label: string; type: string; placeholder: string;
  icon: React.ReactNode; trailing?: React.ReactNode; autoComplete?: string;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="group">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground/80">
        {label}
      </label>
      <div className="relative flex items-center rounded-2xl border border-border bg-white/80 transition-all duration-300 focus-within:border-[oklch(0.7_0.2_35)] focus-within:shadow-[0_0_0_4px_oklch(0.75_0.18_35/0.15)] hover:border-[oklch(0.82_0.1_50)]">
        <span className="pl-4 text-muted-foreground transition-colors group-focus-within:text-[oklch(0.62_0.22_30)]">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          className="flex-1 bg-transparent px-3 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {trailing && <span className="pr-2">{trailing}</span>}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, isLive }: { icon: React.ReactNode; label: string; value: string; trend: string; isLive?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5">
      {isLive && (
        <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[oklch(0.97_0.03_40)] text-[oklch(0.6_0.2_30)]">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.55_0.15_150)]">{trend}</span>
      </div>
      <div className="mt-2 text-lg font-bold tracking-tight transition-all">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, sub, active }: { icon: React.ReactNode; title: string; sub: string; active?: boolean }) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-3.5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundImage: "var(--gradient-brand)" }}>
        {icon}
        {active && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
        )}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          {sub}
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [22, 34, 28, 46, 38, 58, 52, 66, 60, 78, 70, 88];
  const max = Math.max(...points);
  const w = 100, h = 40;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div className="relative overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-24 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.21 30)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.72 0.21 30)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#g)" />
        <path
          d={path}
          fill="none"
          stroke="oklch(0.65 0.22 28)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />
      </svg>
      {/* Live animated data glow point */}
      <span className="absolute bottom-[88%] right-[2%] h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-md ring-4 ring-[oklch(0.65_0.22_28/0.3)]">
        <span className="absolute inset-0 rounded-full bg-[oklch(0.65_0.22_28)] animate-ping" />
      </span>
    </div>
  );
}