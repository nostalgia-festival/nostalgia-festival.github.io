# פסטיבל נוסטלגיה 🕹️

עמוד נחיתה לכנס הנוסטלגיה לילדי שנות ה-90 וה-2000. עיצוב בהשראת Windows XP / 2000,
עברית מלאה (RTL), עם ספירה לאחור לאירוע ואשף רכישת כרטיסים שמתעד לידים ב-Supabase
לפני הפניה לסליקה.

**אירוע:** יום שני, 29.6.2026 · פתיחת דלתות 17:30 · אקספו תל אביב, ביתן 11A.

## טכנולוגיה
React + TypeScript + Vite · CSS בסגנון XP · Supabase לתיעוד · GitHub Pages (Actions).

## התחלה מהירה
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

## תיעוד
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** — מה נבנה, החלטות, ו**מה עוד צריך למלא**.
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** — הקמת Supabase ופרסום ב-GitHub Pages, צעד-אחר-צעד.

> לפני העלייה לאוויר חובה להגדיר את `VITE_PAYMENT_URL`, `VITE_SUPABASE_URL`,
> `VITE_SUPABASE_PUBLISHABLE_KEY`, ולעדכן את מחירי הכרטיסים (placeholder) ב-`src/lib/pricing.ts`.
