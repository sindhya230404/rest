
## Goal

One TanStack Start app that:
- Shows the Login page at `/` (unchanged, byte-for-byte from the Login project).
- After a successful sign-in, sends the user to a new `/page-id` screen instead of the old dashboard.
- Routes based on the entered Page ID to the Reception, Kitchen, or Admin app.
- Keeps every Reception/Kitchen/Admin page 100% visually and functionally identical.

## Verified from the uploaded zips

- All four projects use the same base (TanStack Start + React 19 + Tailwind v4 + shadcn) with identical dependency lists (Login adds `@supabase/supabase-js`).
- Each project defines its own `__root.tsx`, `_app.tsx` layout, sidebar, `styles.css` design tokens, and dozens of routes/components. There are name collisions (`AppSidebar`, `PageHeader`, `StatCard`, `_app.dashboard.tsx`, `_app.orders.live.tsx`, etc.).
- Login already contains role-based redirects to `/reservations`, `/kitchen/dashboard`, `/dashboard`. The "dashboard" you want removed is the admin fallback (`/dashboard`) that the Login project navigates to.

## Merge strategy — namespace each project so nothing collides

```text
src/
  routes/
    index.tsx                 ← Login (from Login project, unchanged UI)
    page-id.tsx               ← NEW: Page-ID input, protected by session
    reception/                ← Reception routes (formerly _app.*)
    kitchen/                  ← Kitchen routes
    admin/                    ← Admin routes
  reception/{components,lib,hooks}/…  ← Reception's own src tree
  kitchen/{components,lib,hooks}/…
  admin/{components,lib,hooks}/…
  lib/supabase.ts             ← from Login (auth)
  styles.css                  ← merged, tokens scoped per app
```

- Each Reception route file is moved from `src/routes/_app.foo.tsx` to `src/routes/reception/_app.foo.tsx`; its `createFileRoute("/_app/foo")` becomes `createFileRoute("/reception/_app/foo")`. URL becomes `/reception/foo` (the `_app` segment is pathless). Same for `/kitchen/*` and `/admin/*`.
- Each project's `_app.tsx` layout becomes the pathless layout for its subtree and wraps its content in a `.theme-reception` / `.theme-kitchen` / `.theme-admin` div so its design tokens apply without leaking.
- All `@/components/...`, `@/lib/...`, `@/hooks/...` imports inside each project's files are rewritten to their namespaced path (e.g. `@/reception/components/ui/button`). Nothing inside those files is otherwise edited — no logic, styling, or JSX changes.
- Reception ships its own supabase client at `src/reception/lib/supabase.ts` (already exists in the project); Kitchen/Admin keep whatever data layer they ship with. Not touched.

## CSS handling (no visual regressions)

Each project defines `:root { --background: …; --primary: …; … }`. If concatenated verbatim they overwrite each other. Fix:
- Keep Login's tokens as the global `:root` (so `/` and `/page-id` look identical to the current Login).
- Rewrite Reception's `:root { … }` to `.theme-reception { … }` (and same for Kitchen/Admin, and any `.dark` blocks → `.theme-x.dark`, `.dark .theme-x`). Keyframes and utility classes stay global (they're unique per project).
- Each namespaced `_app.tsx` wraps its outlet in `<div className="theme-<name>">…</div>`. Tailwind utilities inside those subtrees resolve to that scope's variables.

Result: pages look identical to their standalone versions; there's no bleed between them.

## The `/page-id` gate (only new business logic)

- Guarded by `beforeLoad`: reads Supabase session; if missing, `redirect({ to: "/" })`.
- Renders a single input + submit styled with Login's design tokens.
- On submit, checks the entered ID against three configurable values (constants at the top of the file, easy to change) and navigates:
  - Reception ID → `/reception/…first Reception route…`
  - Kitchen ID → `/kitchen/…first Kitchen route…`
  - Admin ID → `/admin/…first Admin route…`
- Wrong ID → inline error, no navigation. No dashboard.

Default IDs (placeholders you can change): `RECEPTION-001`, `KITCHEN-001`, `ADMIN-001`. Let me know if you want different values, else I ship these.

## Login page changes (minimum required)

- UI: unchanged.
- Only the post-login navigation is retargeted: instead of `/reservations` | `/kitchen/dashboard` | `/dashboard`, every successful login goes to `/page-id`. No other edits to the Login file.

## Files removed

- Login's `_app.tsx`, `_app.dashboard.tsx`, `_app.reservations.tsx`, `_app.tables.tsx`, `kitchen.tsx`, `kitchen.dashboard.tsx`, and its `AppSidebar` / `KitchenSidebar` / `TopBar` — obsolete once Reception/Kitchen/Admin ship as their real originals. This is the "remove the Dashboard" requirement.

## What I will NOT touch

- Any JSX, className, styling, animation, or business logic inside Reception/Kitchen/Admin routes or components.
- Any Supabase calls / data logic inside them.
- Login form markup or styling.

## Execution order

1. Copy Reception's `src` tree into `src/reception/` and its routes into `src/routes/reception/`; rewrite imports + route paths only.
2. Same for Kitchen → `/kitchen/*`.
3. Same for Admin → `/admin/*`.
4. Copy Login's `index.tsx` to `src/routes/index.tsx`; retarget post-login nav to `/page-id`.
5. Copy Login's `lib/supabase.ts` and its supabase env vars.
6. Merge `styles.css` with the scope rewrite described above.
7. Create `src/routes/page-id.tsx`.
8. Delete leftover template placeholders and Login's dashboard files.
9. Build + smoke-test navigation.

## Risks I'll call out up front

- **Volume**: ~200 files copied/rewritten. I'll do the rewrites with scripted transforms, not by hand, but small stragglers may need follow-up patches.
- **Reception vs Admin overlap**: the Reception and Admin projects have nearly identical route trees (same file names). Namespacing under `/reception` vs `/admin` fully isolates them, but they are visually near-duplicates by design — this is expected, not a bug.
- **Fonts/`<link>` tags** from each project's `__root.tsx` (Google Fonts, favicons) get consolidated into the single root; if two projects load the same font family with different weights I keep the superset.
- **Env vars**: Reception/Kitchen/Admin projects may reference their own Supabase URLs. If they do, we'll need those keys added as project secrets. I'll surface any I find during step 1–3.

Approve this and I'll execute end-to-end.
