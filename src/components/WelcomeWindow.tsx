import XPWindow from './XPWindow'

/** "welcome.exe" — the headline / vibe-setting window. */
export default function WelcomeWindow() {
  return (
    <XPWindow title="נוסטלגיה 2000 — welcome.exe" icon="💾">
      <div className="welcome">
        <div className="welcome-logo">
          NOSTALGIA
          <span className="welcome-logo-year">2000</span>
        </div>
        <p className="welcome-tagline">
          הכנס שמחזיר אותך לסלון של סבתא, יום שישי, חצי ליטר קולה
        </p>
        <p className="welcome-sub">
          לילה אחד. כל מה שגדלנו עליו. בלי טיקטוק, בלי AI — רק נוסטלגיה במנה כפולה.
        </p>
      </div>
    </XPWindow>
  )
}
