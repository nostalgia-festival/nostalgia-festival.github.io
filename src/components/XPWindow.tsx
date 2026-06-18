import type { ReactNode } from 'react'

interface XPWindowProps {
  /** Text shown in the title bar (e.g. "details.txt — פרטי האירוע"). */
  title: string
  /** Optional emoji/glyph rendered before the title. */
  icon?: ReactNode
  /** Optional menu strip (קובץ, עריכה ...) shown under the title bar. */
  menu?: string[]
  /**
   * When provided, the close (✕) caption button becomes a real button wired to
   * this handler (used by modal windows). Without it the caption buttons stay
   * purely decorative, like the static windows down the page.
   */
  onClose?: () => void
  /**
   * When provided, the minimize (_) caption button collapses the window to its
   * taskbar button, just like real XP. Decorative when omitted.
   */
  onMinimize?: () => void
  children: ReactNode
  className?: string
}

/**
 * A Windows XP "Luna" styled window chrome: blue gradient title bar with the
 * classic minimize / maximize / close caption buttons, optional menu strip,
 * and a beige content area. Purely presentational.
 */
export default function XPWindow({ title, icon, menu, onClose, onMinimize, children, className }: XPWindowProps) {
  return (
    <section className={`xp-window ${className ?? ''}`}>
      <div className="xp-titlebar">
        <div className="xp-titlebar-text">
          {icon && <span className="xp-titlebar-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="xp-caption-buttons">
          {onMinimize ? (
            <button type="button" className="xp-caption xp-min" onClick={onMinimize} aria-label="מזער">
              _
            </button>
          ) : (
            <span className="xp-caption xp-min" aria-hidden="true">_</span>
          )}
          <span className="xp-caption xp-max" aria-hidden="true">▢</span>
          {onClose ? (
            <button type="button" className="xp-caption xp-close" onClick={onClose} aria-label="סגור">
              ✕
            </button>
          ) : (
            <span className="xp-caption xp-close" aria-hidden="true">✕</span>
          )}
        </div>
      </div>

      {menu && (
        <div className="xp-menubar">
          {menu.map((m) => (
            <span key={m} className="xp-menu-item">
              {m}
            </span>
          ))}
        </div>
      )}

      <div className="xp-window-body">{children}</div>
    </section>
  )
}
