import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'

const ROWS: { icon: string; label: string; value: string }[] = [
  { icon: '📅', label: 'תאריך', value: EVENT.dateLabel },
  { icon: '🚪', label: 'פתיחת דלתות', value: EVENT.doorsLabel },
  { icon: '🎤', label: 'אירועי במה ראשית', value: EVENT.mainStageLabel },
  { icon: '📍', label: 'מיקום', value: EVENT.locationLabel },
  { icon: '👥', label: 'קהל יעד', value: EVENT.audienceLabel },
]

/** "details.txt" — the factual event info window. */
export default function DetailsWindow() {
  return (
    <XPWindow
      title="פרטי האירוע — details.txt"
      icon="📄"
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <dl className="details-list">
        {ROWS.map((row) => (
          <div className="details-row" key={row.label}>
            <dt className="details-term">
              <span className="details-icon">{row.icon}</span>
              {row.label}
            </dt>
            <dd className="details-value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </XPWindow>
  )
}
