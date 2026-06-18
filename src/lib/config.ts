// Central configuration. Values come from build-time env vars (see .env.example)
// and fall back to safe defaults so the site still builds/runs without them.

export const CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  // Supabase's new "publishable" key (sb_publishable_...), which replaces the
  // legacy anon key. Safe to expose to the browser; protected by RLS.
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',

  // Where to redirect the user after we log their details. `||` (not `??`) so an
  // empty env var — which the deploy workflow sets when the GitHub variable is
  // unset — falls through to the real payment URL instead of disabling redirect.
  paymentUrl: import.meta.env.VITE_PAYMENT_URL || 'https://pay.tranzila.com/double12ch10',
}

// ---------------------------------------------------------------------------
// Event details — single source of truth, shown across the page.
// PLACEHOLDER values are taken from the brief; confirm before going live.
// ---------------------------------------------------------------------------
export const EVENT = {
  titleLine1: 'פסטיבל נוסטלגיה',

  // Used for the countdown. Monday 29.6.2026, doors at 19:30 (Asia/Jerusalem).
  // Format: ISO with explicit +03:00 (Israel Daylight Time in June).
  startsAtISO: '2026-06-29T19:30:00+03:00',

  dateLabel: 'יום שני, 29.6.2026',
  doorsLabel: '19:30',
  mainStageLabel: '21:00',
  locationLabel: 'רדינג 3',

  // Contact address shown in the "צרו קשר" window (and its mailto: link).
  contactEmail: 'contact@nostalgia-festival.co.il',
}

// ---------------------------------------------------------------------------
// Contents of the "מידע" (info) desktop folder. Each entry is a "file" inside
// the folder window; clicking it opens a popup with this copy. Images for the
// entries are wired in InfoFolder.tsx by `id` (assets live alongside the other
// images, not here, to keep this file import-free). Edit the copy here.
// ---------------------------------------------------------------------------
export const INFO_ITEMS = [
  {
    id: 'shustus',
    label: 'ששטוס לייב',
    title: 'בואו לקחת חלק במשחק ששטוס ענק!',
    lines: [
      'קיר הגורלות חוזר! נצחו במשימות, אספו מפתחות ותוכלו לצבור נקודות בקיר הגורלות!',
      'משחק אינטראקטיבי לאורך כל הערב במתחם המרכזי.',
    ],
  },
  {
    id: 'oded-paz',
    label: 'עודד פז',
    title: 'עודד פז',
    lines: [
      'יופיע עם שירים מוכרים עד שיהיה חייב ללכת',
    ],
  },
  {
    id: 'ilan-rozenfeld',
    label: 'אילן רוזנפלד',
    title: 'אילן רוזנפלד',
    lines: [
      'יצטרף לעודד בהופעה ואז יחזור לנתניה',
    ],
  },
  {
    id: 'tal-mosseri',
    label: 'טל מוסרי',
    title: 'טל מוסרי',
    lines: [
      'יופיע על הבמה המרכזית ולא יבגוד וילך לבמה אחרת',
    ],
  },
  {
    id: 'dj',
    label: "דיג'יי",
    title: "דיג'יי",
    lines: [
      'שירי פסטיגלים, סדרות ולהיטים מהתקופה',
    ],
  },
  {
    id: 'stands',
    label: 'דוכנים',
    title: 'דוכנים',
    lines: [
      'דוכנים שלא יביישו יריד שהלכתם אליו עם אמא ביום העצמאות 2005',
    ],
  },
  {
    id: 'mystery-1',
    label: 'ייחשף בהמשך',
    title: 'ייחשף בהמשך',
    lines: [
      'עוד הפתעה שתיחשף בקרוב — הישארו מעודכנים!',
    ],
  },
  {
    id: 'mystery-2',
    label: 'ייחשף בהמשך',
    title: 'ייחשף בהמשך',
    lines: [
      'עוד הפתעה שתיחשף בקרוב — הישארו מעודכנים!',
    ],
  },
  {
    id: 'mystery-3',
    label: 'ייחשף בהמשך',
    title: 'ייחשף בהמשך',
    lines: [
      'עוד הפתעה שתיחשף בקרוב — הישארו מעודכנים!',
    ],
  },
  {
    id: 'mystery-4',
    label: 'ייחשף בהמשך',
    title: 'ייחשף בהמשך',
    lines: [
      'עוד הפתעה שתיחשף בקרוב — הישארו מעודכנים!',
    ],
  },
] as const

/** A single "file" inside the מידע folder (one entry of INFO_ITEMS). */
export type InfoItem = (typeof INFO_ITEMS)[number]
