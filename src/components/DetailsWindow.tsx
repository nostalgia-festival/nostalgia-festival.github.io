import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'
import Icon from './Icon'

const ROWS: { icon: string; emoji: string; label: string; value: string }[] = [
  { icon: 'calendar', emoji: '📅', label: 'תאריך', value: EVENT.dateLabel },
  { icon: 'door', emoji: '🚪', label: 'פתיחת דלתות', value: EVENT.doorsLabel },
  { icon: 'microphone', emoji: '🎤', label: 'אירועי במה ראשית', value: EVENT.mainStageLabel },
  { icon: 'location', emoji: '📍', label: 'מיקום', value: EVENT.locationLabel },
]

/** "details.txt" — the factual event info window. */
export default function DetailsWindow() {
  return (
    <XPWindow
      title="פרטי האירוע.txt"
      icon={<Icon name="document" e="📄" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <dl className="details-list">
        {ROWS.map((row) => (
          <div className="details-row" key={row.label}>
            <dt className="details-term">
              <Icon name={row.icon} e={row.emoji} className="details-icon" />
              {row.label}
            </dt>
            <dd className="details-value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </XPWindow>
  )
}
