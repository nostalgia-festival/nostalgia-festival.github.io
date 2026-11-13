import XPWindow from './XPWindow'
import Icon from './Icon'
import { EVENT } from '../lib/config'

interface EventOverDialogProps {
  onClose: () => void
  /** "עדכנו אותי!" - dismiss the popup and take the visitor to the signup form. */
  onSignup: () => void
}

/**
 * A one-time "the festival is over" popup shown on load, now that the event has
 * taken place. It also teases a possible next festival and offers a shortcut to
 * the NotifySignup form. Styled like the other XP dialogs (backdrop + XPWindow
 * chrome); clicking the backdrop, the ✕, or "סגירה" dismisses it. Purely
 * presentational - the parent owns the open/close state.
 */
export default function EventOverDialog({ onClose, onSignup }: EventOverDialogProps) {
  return (
    <div className="xp-modal-overlay xp-modal-overlay--score" onClick={onClose} role="presentation">
      <div className="xp-modal xp-modal--popup" onClick={(e) => e.stopPropagation()}>
        <XPWindow
          title="הודעת מערכת"
          icon={<Icon name="info" e="ℹ️" />}
          onClose={onClose}
        >
          <div className="ms-score">
            <p className="ms-score-lead">הפסטיבל הסתיים 🎉</p>
            <p className="ms-score-time">פסטיבל נוסטלגיה התקיים ב־{EVENT.dateLabel}</p>
            <p>תודה ענקית לכל מי שהגיע והפך את הערב לבלתי־נשכח 💙</p>
            <p>
              ואולי... זו לא הפעם האחרונה. השאירו פרטים ונעדכן אתכם ראשונים אם יהיה פסטיבל נוסף.
            </p>
            <div className="ms-score-actions">
              <button type="button" className="xp-button xp-button--green" onClick={onSignup}>
                עדכנו אותי!
              </button>
              <button type="button" className="xp-button" onClick={onClose}>
                סגירה
              </button>
            </div>
          </div>
        </XPWindow>
      </div>
    </div>
  )
}
