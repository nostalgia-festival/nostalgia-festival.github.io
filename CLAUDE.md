# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page landing site for an Israeli nostalgia festival ("פסטיבל נוסטלגיה",
event 29.6.2026). Fully Hebrew, RTL, styled to look like Windows XP/2000. The
festival has already happened: ticket sales are closed, and the site's job now is
to say so and collect signups (name + email + phone) into Supabase from people
who want to hear about a possible next festival.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # tsc -b (typecheck) then vite build → dist/
npm run preview  # serve the production build locally
```

There is no test runner, linter, or formatter configured. `npm run build` is the
only correctness gate - it runs `tsc -b` first, so a type error fails the build
(and the GitHub Actions deploy).

## Architecture

React 18 + TypeScript + Vite. No UI library, no router, no state manager - one
page composed of XP-styled "window" sections. Styling is hand-written CSS in
`src/styles/xp.css` (the entire visual theme lives here).

- `src/App.tsx` - composes the page: a `Background`, `DesktopIcons`, `Hero`, then
  a `windows-stack` of `DetailsWindow` → `InfoFolder` → `NotifySignup` →
  `Countdown` → `ContactWindow` → `Footer`, plus a `Taskbar`. App owns one ref per
  scroll target and passes `scrollTo` callbacks down; the desktop icons, Start
  button, Hero CTA, tray balloon and the `EventOverDialog` popup all
  `scrollIntoView` their section (everything sales-related now targets
  `NotifySignup`). App also owns the three taskbar-managed modal windows, the
  on-load `EventOverDialog`, and the background-music hook (see below).
- `src/components/XPWindow.tsx` - the reusable XP "Luna" window chrome (title bar,
  caption buttons, optional menu strip). Purely presentational; most sections wrap
  their content in this.
- `src/components/Countdown.tsx` - live countdown to `EVENT.startsAtISO`.
- `src/components/Background.tsx` - the "Bliss" desktop wallpaper, progressively
  loaded (see "Theme assets" below).
- `src/components/DesktopIcons.tsx` / `Taskbar.tsx` - the XP desktop icons and the
  bottom taskbar (Start button + one button per open modal window + volume icon).
- `src/lib/config.ts` - **single source of truth** for event details (`EVENT`),
  runtime config (`CONFIG`), and `INFO_ITEMS` (the "files" inside the `InfoFolder`
  window - each is a clickable entry with title/copy, wired to images in
  `InfoFolder.tsx` by `id`). Edit dates/labels/copy here, not in components.
- `src/lib/pricing.ts` - price calculation (flat `BASE_PRICE`, ₪140). Unused since
  ticket sales closed; kept for a future sale.
- `src/lib/supabase.ts` - `logNotifySignup()` writes a row to the
  `notify_signups` table. `logTicketClick()` (→ `ticket_clicks`) is the retired
  ticket flow's logger, unused but kept. The schema lives in `supabase/schema.sql`.

### The signup flow (the core behavior)

`NotifySignup.tsx` sits in the slot the ticket wizard used to fill. The visitor
enters full name, email and phone; the submit button stays disabled until all
three pass lenient checks. The phone is run through `cleanPhone()` first, which
drops all separators (spaces, `( ) .`, every dash variant) and invisible bidi
marks from pasted numbers, and that bare number is what gets saved
(`050-123 4567` → `0501234567`). `PHONE_RE` then enforces Israeli lengths:
05X/07X are exactly 10 digits and landlines exactly 9 (so a mobile missing a
digit is rejected), also in `+972`/`00972` form; foreign `+`/`00` numbers get
8-15 digits. An "invalid number" hint shows under the field after it's blurred.
Submitting calls `logNotifySignup()`, which, like every function in
`supabase.ts`, **never throws** and returns `false` on failure. There's no
redirect, so on `false` the form shows an error and stays filled for a retry.

`notify_signups` has a unique index on `lower(email)`. A repeat signup fails with
Postgres error `23505`, and `logNotifySignup` deliberately treats that as success
(the visitor *is* on the list, and an "already registered" message would reveal
which emails are). The table also has length `check`s that mirror the inputs'
`maxLength`. Keep the two in sync, or valid form input will be rejected.

The retired ticket flow (log to `ticket_clicks` *before* redirecting to a payment
URL, never letting a logging failure block the redirect) is in git history
(`TicketWizard.tsx` before commit `f766d8b`). There is currently **no payment
provider**: the old `VITE_PAYMENT_URL` (Tranzila) is gone from config, `.env` and
the deploy workflow, so a future sale would need a new provider wired in.

### Config & graceful degradation

All deploy-time config comes from `VITE_`-prefixed env vars, inlined at build
time (so they are public - only the Supabase URL and *publishable* key go here,
never a secret key). The app is designed to build and run without them: no
Supabase URL/key → `isSupabaseConfigured` is `false`, the `supabase.ts` functions
become no-ops (`console.warn`, return `false`), and the signup form shows a "demo
mode" error on submit.

Local dev: copy `.env.example` → `.env`. In production these are set as GitHub
Actions repository **Variables** (see `.github/workflows/deploy.yml`).

### Two kinds of "windows"

There are two distinct windowing mechanisms; don't conflate them.

- **Scroll-stack sections** (`DetailsWindow`, `InfoFolder`, `NotifySignup`,
  `ContactWindow`) - always-on-screen content wrapped in `XPWindow` chrome, laid
  out in the `windows-stack` and reached by smooth-scroll.
- **Taskbar-managed modal windows** - the *real* floating windows that open over
  the page: the Recycle Bin, the `Minesweeper` clone inside it, and the מידע
  folder's readme popup. Each is driven by a `useTaskWindow()` hook
  (`src/lib/useTaskWindow.ts`) whose state (`open`/`minimized`/`visible`) is lifted
  into `App` so the desktop icon that opens it, the window itself, and its taskbar
  button all stay in sync. Clicking a taskbar button toggles minimize/restore just
  like real XP. `Minesweeper.tsx` is a self-contained game (and exports a
  `MinesweeperGlyph` used as its taskbar icon).

> **RTL scroll trap (Minesweeper).** The whole site is RTL, but the Minesweeper
> board is `direction: ltr`. A wide board (intermediate/expert) on a phone must
> scroll horizontally, and the non-obvious gotcha is that **an RTL scroll
> container won't show a scrollbar for LTR overflow** - it treats overflow to the
> right as inline-*start* (negative) and offers nothing. So putting `overflow:auto`
> on the (RTL) `.xp-window-body` does nothing. The board therefore lives in its own
> LTR `.ms-scroll` wrapper that does the horizontal scrolling; the window body only
> scrolls vertically (`overflow-x: hidden`). The frame uses `width: max-content;
> min-width: 100%` so it fills the window when the board fits (beginner - no
> scrollbar) but grows past it when it doesn't (wider boards - scroll). Tiles stay
> a fixed 24px; don't switch to responsive cell sizing (it makes expert unplayably
> small). The difficulty/flag menu and the hint sit *outside* `.ms-scroll` so they
> stay at window width - keep them there, or `width: max-content` on an ancestor
> will lay the long hint sentence on one line and widen the whole window.

### Background music

`src/lib/useBackgroundMusic.ts` plays the Windows XP startup sound and then
hard-cuts into looping background music; the taskbar volume icon mutes/unmutes it.
The non-obvious parts are documented in the file and must be preserved: browsers
block autoplay-with-sound, so a rejected `play()` arms one-time
pointer/key/touch gesture listeners; volume runs through Web Audio `GainNode`s
(not `audio.volume`, which iOS Safari ignores) with a fallback; and a `disposed`
guard defends against React StrictMode's double-mount. Audio assets live in
`Media/` (`Windows_XP.mp3` intro, `NostalgiaFest.wav` loop), imported by Vite.

### Theme assets

Visual assets are imported through Vite from the top-level `images/` and `Media/`
folders (hashed/bundled at build time), **not** served from `public/`. `public/`
holds only files that must keep stable URLs: the favicon and OpenGraph/preview
images referenced by `index.html`.

- `src/components/Emoji.tsx` - renders every emoji as a bundled Twemoji SVG from
  `images/emoji/` (keyed by Unicode code point), so emoji look identical across
  platforms and fit the theme. Unknown emoji fall back to the raw character.
- `src/components/Icon.tsx` - renders authentic XP `.ico` system icons from
  `images/icons/` by semantic slug, falling back to an emoji (via `Emoji`) when no
  matching `.ico` exists, so the site still builds with that folder empty. The
  untouched originals in `images/icons/source/` are deliberately outside the glob.
- `src/components/Background.tsx` and `ProgressiveImage.tsx` - progressive
  low→high-resolution image loading: paint the tiniest tier instantly, then climb
  tier-by-tier, capping the top tier by the visitor's connection (Network
  Information API, `saveData` respected). Early tiers render with
  `image-rendering: pixelated` (crisp blocky upscaling - an intentional XP-era nod,
  see `xp.css`), switching to smooth once the sharpest tier loads.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. `vite.config.ts` sets `base: './'` so the
build works regardless of the Pages path - do not change this to an absolute base.

## Conventions

- All user-facing text is Hebrew and the layout is RTL. Match the existing tone
  and the XP/2000 nostalgia framing (windows are named like `tickets.exe`,
  `details.txt`).
- Comments in `src/lib/*` are in English and explain the non-obvious decisions
  (the `||` vs `??` fallback, the no-throw logging contract) - read them before
  changing that logic.

## Docs caveat

`README.md`, `IMPLEMENTATION.md`, and `SUPABASE_SETUP.md` are in Hebrew and are
useful for Supabase setup and intent, but parts are stale relative to the code
(they describe a 3-step wizard, a `WelcomeWindow`, and tiered/age-based pricing
at ₪149 that no longer exist - the wizard is now single-step with a flat ₪140).
When they disagree with the code, trust the code.
