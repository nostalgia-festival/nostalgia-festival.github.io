// Central configuration. Values come from build-time env vars (see .env.example)
// and fall back to safe defaults so the site still builds/runs without them.

export const CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  // Supabase's new "publishable" key (sb_publishable_...), which replaces the
  // legacy anon key. Safe to expose to the browser; protected by RLS.
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',

  // Where to redirect the user after we log their details. When empty (e.g. in
  // local dev), the wizard shows a friendly placeholder instead of redirecting.
  paymentUrl: import.meta.env.VITE_PAYMENT_URL ?? '',
}

// ---------------------------------------------------------------------------
// Event details — single source of truth, shown across the page.
// PLACEHOLDER values are taken from the brief; confirm before going live.
// ---------------------------------------------------------------------------
export const EVENT = {
  titleLine1: 'פסטיבל נוסטלגיה',
  titleLine2: 'שנות ה-2000 חוזרות ליום אחד',

  // Used for the countdown. Monday 29.6.2026, doors at 17:00 (Asia/Jerusalem).
  // Format: ISO with explicit +03:00 (Israel Daylight Time in June).
  startsAtISO: '2026-06-29T17:00:00+03:00',

  dateLabel: 'יום שני, 29.6.2026',
  doorsLabel: '17:00',
  mainStageLabel: '20:00',
  locationLabel: 'אקספו תל אביב, ביתן 11A',
  audienceLabel: 'ילדי שנות ה-90 וה-2000 (וכל מי שמתגעגע)',
}
