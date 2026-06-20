import { EVENT } from '../lib/config'
import XPWindow from './XPWindow'
import Icon from './Icon'

/** "צרו קשר" - the contact window with a mailto link to the festival inbox. */
export default function ContactWindow() {
  return (
    <XPWindow
      title="צרו קשר"
      icon={<Icon name="mail" e="✉️" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
    >
      <div className="contact-window">
        <p className="contact-lead">יש לכם שאלה? נשמח לשמוע מכם.</p>
        <a className="contact-email" href={`mailto:${EVENT.contactEmail}`}>
          {EVENT.contactEmail}
        </a>
      </div>
    </XPWindow>
  )
}
