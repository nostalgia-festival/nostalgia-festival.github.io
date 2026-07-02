import XPWindow from './XPWindow'
import Icon from './Icon'
import { EVENT } from '../lib/config'

/**
 * The "אשף רכישת הכרטיסים" (ticket purchase wizard). The festival has taken
 * place, so ticket sales are closed: the window now shows a "sale ended" notice
 * instead of the purchase form. The lead-capture flow (name/email → Supabase →
 * payment redirect) has been retired along with the sale.
 */
export default function TicketWizard() {
  return (
    <XPWindow
      title="אשף רכישת הכרטיסים"
      icon={<Icon name="tickets" e="🎟️" />}
      menu={['קובץ', 'עריכה', 'תצוגה', 'עזרה']}
      className="wizard-window"
    >
      <div className="wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">מכירת הכרטיסים הסתיימה</h2>
          <p className="wizard-notice">הפסטיבל כבר מאחורינו</p>
        </div>

        <div className="wizard-body">
          <div className="price-box">
            <span className="price-box-label">הפסטיבל התקיים ב־{EVENT.dateLabel}</span>
            <span className="price-box-value">תודה שהייתם חלק מהנוסטלגיה 💙</span>
            <span className="price-box-note">נתראה בפעם הבאה!</span>
          </div>
        </div>
      </div>
    </XPWindow>
  )
}
