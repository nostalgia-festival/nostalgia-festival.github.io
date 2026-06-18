# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page landing site for an Israeli nostalgia festival ("פסטיבל נוסטלגיה",
event 29.6.2026). Fully Hebrew, RTL, styled to look like Windows XP/2000. Its job
is to capture a ticket-purchase lead (name + ticket count) into Supabase and then
redirect the visitor to an external payment service.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # tsc -b (typecheck) then vite build → dist/
npm run preview  # serve the production build locally
```

There is no test runner, linter, or formatter configured. `npm run build` is the
only correctness gate — it runs `tsc -b` first, so a type error fails the build
(and the GitHub Actions deploy).

## Architecture

React 18 + TypeScript + Vite. No UI library, no router, no state manager — one
page composed of XP-styled "window" sections. Styling is hand-written CSS in
`src/styles/xp.css` (the entire visual theme lives here).

- `src/App.tsx` — composes the page: `Hero` → `DetailsWindow` → `FatesWall` →
  `TicketWizard` → `Footer`, plus a `Taskbar`. The Start button and Hero CTA both
  scroll to the `TicketWizard` via a ref.
- `src/components/XPWindow.tsx` — the reusable XP "Luna" window chrome (title bar,
  caption buttons, optional menu strip). Purely presentational; most sections wrap
  their content in this.
- `src/lib/config.ts` — **single source of truth** for event details (`EVENT`)
  and runtime config (`CONFIG`). Edit dates/labels/copy here, not in components.
- `src/lib/pricing.ts` — price calculation. Currently a flat `BASE_PRICE` (₪140)
  per ticket.
- `src/lib/supabase.ts` — `logTicketClick()` writes a row to the `ticket_clicks`
  table. The Supabase schema lives in `supabase/schema.sql`.

### The lead-capture flow (the core behavior — preserve it)

In `TicketWizard.tsx`, clicking pay calls `logTicketClick()` **first**, then
redirects to `CONFIG.paymentUrl`. Logging must happen *before* the redirect
because the user may not return after paying, and a logging/network failure must
**never** block the redirect — `logTicketClick` is written to never throw and to
return `false` on failure rather than propagate. Keep this ordering and
non-blocking guarantee intact.

### Config & graceful degradation

All deploy-time config comes from `VITE_`-prefixed env vars, inlined at build
time (so they are public — only the Supabase *publishable* key and payment URL go
here, never a secret key). The app is designed to build and run with all of them
missing:
- No Supabase URL/key → `logTicketClick` becomes a no-op (`console.warn`) and
  `isSupabaseConfigured` is `false`.
- No payment URL → `CONFIG.paymentUrl` falls back to a hardcoded default (note
  the `||`, not `??`, so an empty string from CI still falls through to the
  default).

Local dev: copy `.env.example` → `.env`. In production these are set as GitHub
Actions repository **Variables** (see `.github/workflows/deploy.yml`).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. `vite.config.ts` sets `base: './'` so the
build works regardless of the Pages path — do not change this to an absolute base.

## Conventions

- All user-facing text is Hebrew and the layout is RTL. Match the existing tone
  and the XP/2000 nostalgia framing (windows are named like `tickets.exe`,
  `details.txt`).
- Comments in `src/lib/*` are in English and explain the non-obvious decisions
  (the `||` vs `??` fallback, the no-throw logging contract) — read them before
  changing that logic.

## Docs caveat

`README.md`, `IMPLEMENTATION.md`, and `SUPABASE_SETUP.md` are in Hebrew and are
useful for Supabase setup and intent, but parts are stale relative to the code
(they describe a 3-step wizard, a `WelcomeWindow`, and tiered/age-based pricing
at ₪149 that no longer exist — the wizard is now single-step with a flat ₪140).
When they disagree with the code, trust the code.
