import XPWindow from './XPWindow'
import Icon from './Icon'
import { EVENT } from '../lib/config'

/**
 * A one-time "the festival is over" popup shown on load, now that the event has
 * taken place. Styled like the other XP dialogs (backdrop + XPWindow chrome);
 * clicking the backdrop, the ✕, or the button dismisses it. Purely
 * presentational - the parent owns the open/close state.
 */
export default function EventOverDialog({ onClose }: { onClose: () => void }) {
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
            <p>מכירת הכרטיסים נסגרה. תודה ענקית לכל מי שהגיע והפך את הערב לבלתי־נשכח 💙</p>
            <div className="ms-score-actions">
              <button type="button" className="xp-button xp-button--green" onClick={onClose}>
                אישור
              </button>
            </div>
          </div>
        </XPWindow>
      </div>
    </div>
  )
}
