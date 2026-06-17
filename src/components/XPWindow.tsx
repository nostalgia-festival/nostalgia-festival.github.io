import type { ReactNode } from 'react'

interface XPWindowProps {
  /** Text shown in the title bar (e.g. "details.txt — פרטי האירוע"). */
  title: string
  /** Optional emoji/glyph rendered before the title. */
  icon?: ReactNode
  /** Optional menu strip (קובץ, עריכה ...) shown under the title bar. */
  menu?: string[]
  children: ReactNode
  className?: string
}

/**
 * A Windows XP "Luna" styled window chrome: blue gradient title bar with the
 * classic minimize / maximize / close caption buttons, optional menu strip,
 * and a beige content area. Purely presentational.
 */
export default function XPWindow({ title, icon, menu, children, className }: XPWindowProps) {
  return (
    <section className={`xp-window ${className ?? ''}`}>
      <div className="xp-titlebar">
        <div className="xp-titlebar-text">
          {icon && <span className="xp-titlebar-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="xp-caption-buttons" aria-hidden="true">
          <span className="xp-caption xp-min">_</span>
          <span className="xp-caption xp-max">▢</span>
          <span className="xp-caption xp-close">✕</span>
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
