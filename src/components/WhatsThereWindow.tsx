import XPWindow from './XPWindow'

// PLACEHOLDER activities from the brief. The real line-up is intentionally kept
// secret for now — add/replace these tiles when the content is finalized.
// See IMPLEMENTATION.md ("What's still left to fill").
const ACTIVITIES: string[] = ['פסטיגל', 'סופרגול', 'פוגים', 'קורנפלקס', 'ששטוס']

/** "My Documents" — teaser of what's waiting at the conference. */
export default function WhatsThereWindow() {
  return (
    <XPWindow title="מה יהיה שם? — My Documents" icon="📁">
      <p className="whats-there-intro">
        לא נספיילר הכל. אבל יהיה <strong>ששטוס</strong> חופשי, מגדלי{' '}
        <strong>קורנפלקס</strong>, טורניר <strong>פוגים</strong> רשמי, חזרה
        ל<strong>סופרגול</strong> על מסך ענק, פינת <strong>פסטיגל</strong> מקורית —
        ועוד כמה דברים שאסור לנו לחשוף.
      </p>

      <div className="activity-grid">
        {ACTIVITIES.map((name) => (
          <div className="activity-tile" key={name}>
            {name}
          </div>
        ))}
        <div className="activity-tile activity-tile--mystery" title="עוד הפתעות בדרך">
          ???
        </div>
      </div>
    </XPWindow>
  )
}
