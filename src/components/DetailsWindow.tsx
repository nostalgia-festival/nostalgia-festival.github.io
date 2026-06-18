import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'
import Emoji from './Emoji'

const ROWS: { icon: string; label: string; value: string }[] = [
  { icon: '📅', label: 'תאריך', value: EVENT.dateLabel },
  { icon: '🚪', label: 'פתיחת דלתות', value: EVENT.doorsLabel },
  { icon: '🎤', label: 'אירועי במה ראשית', value: EVENT.mainStageLabel },
  { icon: '📍', label: 'מיקום', value: EVENT.locationLabel },
]

/** "details.txt" — the factual event info window. */
export default function DetailsWindow() {
  return (
    <XPWindow
      title="פרטי האירוע.txt"
      icon={<Emoji e="📄" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <dl className="details-list">
        {ROWS.map((row) => (
          <div className="details-row" key={row.label}>
            <dt className="details-term">
              <Emoji e={row.icon} className="details-icon" />
              {row.label}
            </dt>
            <dd className="details-value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </XPWindow>
  )
}
