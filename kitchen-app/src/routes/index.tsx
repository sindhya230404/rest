import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChefHat,
  Check,
  Sparkles,
  UtensilsCrossed,
  TrendingUp,
  Users,
  ClipboardList,
  QrCode,
  Flame,
  Wallet,
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
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const store = remember ? window.localStorage : window.sessionStorage;
        store.setItem(
          "savora.auth",
          JSON.stringify({ email: email.trim().toLowerCase(), redirect: entry.redirect }),
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
        <section className="animate-rise flex flex-col justify-between">
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl shadow-[var(--shadow-elegant)]" style={{ backgroundImage: "var(--gradient-brand)" }}>
                <UtensilsCrossed className="h-6 w-6 text-white" strokeWidth={2.2} />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-white/40" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold tracking-tight">Savora ERP</div>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Restaurant Suite</div>
              </div>
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.7_0.2_35)]" />
              Premium SaaS
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12">
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

                <div className="flex items-center justify-between pt-1">
                  <label className="group flex cursor-pointer items-center gap-2.5 select-none">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-md border transition-all ${
                        remember
                          ? "border-transparent shadow-[0_4px_14px_-4px_oklch(0.7_0.2_35/0.6)]"
                          : "border-border bg-white group-hover:border-[oklch(0.7_0.2_35)]"
                      }`}
                      style={remember ? { backgroundImage: "var(--gradient-brand)" } : undefined}
                      onClick={() => setRemember((v) => !v)}
                      role="checkbox"
                      aria-checked={remember}
                      tabIndex={0}
                    >
                      <Check className={`h-3.5 w-3.5 text-white transition-all ${remember ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} strokeWidth={3} />
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">Remember me</span>
                    <input type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  </label>

                  <a href="#" className="text-sm font-medium text-[oklch(0.62_0.22_30)] transition-colors hover:text-[oklch(0.52_0.24_28)]">
                    Forgot password?
                  </a>
                </div>

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

                <div className="relative py-1 text-center">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  <span className="relative bg-white/70 px-3 text-xs uppercase tracking-widest text-muted-foreground">or</span>
                </div>

                <a
                  href="/"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white/60 px-6 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  Back to Website
                </a>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need help? <a href="#" className="font-medium text-foreground underline-offset-4 hover:underline">Contact Administrator</a>
            </p>
          </div>

          <footer className="flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2026 Savora ERP · All rights reserved</span>
            <div className="hidden gap-5 sm:flex">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Status</a>
            </div>
          </footer>
        </section>

        {/* Right — Illustration panel (hidden on tablet/mobile) */}
        <aside className="animate-rise relative hidden lg:block" style={{ animationDelay: "120ms" }}>
          <div className="relative h-full min-h-[720px] w-full overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-[oklch(0.98_0.02_60)] via-white to-[oklch(0.96_0.04_35)] p-10 shadow-[var(--shadow-soft)]">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[oklch(0.78_0.19_35)] opacity-30 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[oklch(0.85_0.12_60)] opacity-40 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.2_140)]" /> Live dashboard preview
              </div>

              <h2 className="mt-4 max-w-md text-[2rem] font-bold leading-[1.1] tracking-tight">
                Run every table, order and kitchen ticket — beautifully.
              </h2>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                <StatCard icon={<ClipboardList className="h-4 w-4" />} label="Orders" value="1,284" trend="+12%" />
                <StatCard icon={<Wallet className="h-4 w-4" />} label="Revenue" value="₹48.9k" trend="+8.4%" />
                <StatCard icon={<Users className="h-4 w-4" />} label="Tables" value="86%" trend="Live" />
              </div>

              {/* Chart card */}
              <div className="relative mt-5 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weekly Revenue</div>
                    <div className="mt-1 text-2xl font-bold">₹312,480</div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[oklch(0.95_0.06_140)] px-2.5 py-1 text-xs font-semibold text-[oklch(0.45_0.15_150)]">
                    <TrendingUp className="h-3.5 w-3.5" /> +18.2%
                  </div>
                </div>
                <MiniChart />
              </div>

              {/* Floating feature cards */}
              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <FeatureCard icon={<QrCode className="h-4 w-4" />} title="QR Ordering" sub="24 tables active" />
                <FeatureCard icon={<Flame className="h-4 w-4" />} title="Kitchen Screen" sub="7 tickets in queue" />
                <FeatureCard icon={<ChefHat className="h-4 w-4" />} title="Chef Board" sub="3 chefs on shift" />
                <FeatureCard icon={<ClipboardList className="h-4 w-4" />} title="Inventory" sub="Auto-restock on" />
              </div>

              <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                <div className="flex -space-x-2">
                  {["oklch(0.75_0.15_40)", "oklch(0.7_0.18_30)", "oklch(0.8_0.12_60)"].map((c, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Trusted by 4,200+ restaurants</div>
                  <div className="text-xs text-muted-foreground">From cafés to Michelin kitchens</div>
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

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[oklch(0.97_0.03_40)] text-[oklch(0.6_0.2_30)]">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.55_0.15_150)]">{trend}</span>
      </div>
      <div className="mt-2 text-lg font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-3.5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundImage: "var(--gradient-brand)" }}>
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
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
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.21 30)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.72 0.21 30)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path d={path} fill="none" stroke="oklch(0.65 0.22 28)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}