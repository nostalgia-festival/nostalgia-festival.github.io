import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'
import Icon from './Icon'

const ROWS: { label: string; value: string; href?: string }[] = [
  { label: 'תאריך', value: EVENT.dateLabel },
  { label: 'פתיחת דלתות', value: EVENT.doorsLabel },
  { label: 'אירועי במה ראשית', value: EVENT.mainStageLabel },
  { label: 'מיקום', value: EVENT.locationLabel, href: EVENT.locationUrl },
]

/** "פרטי האירוע.txt" — the factual event info, dressed up as a Notepad document
    (white paper, monospace, dot-leader lines) so it actually reads like a .txt. */
export default function DetailsWindow() {
  return (
    <XPWindow
      className="xp-window--notepad"
      title="פרטי האירוע.txt"
      icon={<Icon name="document" e="📄" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
      statusBar={
        <div className="notepad-status">
          <span className="notepad-status-cell">שורה 1, עמודה 1</span>
        </div>
      }
    >
      <div className="notepad">
        <div className="notepad-text">
          {ROWS.map((row) => (
            <div className="np-row" key={row.label}>
              <span className="np-label">{row.label}</span>
              <span className="np-leader" aria-hidden="true" />
              <span className="np-value">
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noopener noreferrer">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </XPWindow>
  )
}
