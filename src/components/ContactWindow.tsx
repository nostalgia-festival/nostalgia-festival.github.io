import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'
import Emoji from './Emoji'

/** "צרו קשר" — the contact window with a mailto link to the festival inbox. */
export default function ContactWindow() {
  return (
    <XPWindow
      title="צרו קשר.eml"
      icon={<Emoji e="✉️" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <div className="contact-window">
        <p className="contact-lead">יש לכם שאלה? נשמח לשמוע מכם.</p>
        <a className="contact-email" href={`mailto:${EVENT.contactEmail}`}>
          <Emoji e="✉️" className="contact-email-icon" />
          {EVENT.contactEmail}
        </a>
      </div>
    </XPWindow>
  )
}
