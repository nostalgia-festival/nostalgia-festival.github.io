interface DesktopIconsProps {
  /** Scroll to the "פרטי האירוע" (details.txt) window. */
  onDetails: () => void
  /** Open the "מידע" (info) folder window. */
  onInfo: () => void
  /** Scroll to the ticket purchase wizard (tickets.exe). */
  onTickets: () => void
}

/**
 * The XP "desktop" shortcuts pinned to the wallpaper. They are rendered at the
 * App level (not inside the Hero) and positioned `fixed`, so they stay parked in
 * the corner and travel with the viewport as the visitor scrolls — never
 * scrolling away with the hero. Each one double-acts as a jump link to its
 * matching window further down the page.
 */
export default function DesktopIcons({ onDetails, onInfo, onTickets }: DesktopIconsProps) {
  return (
    <div className="hero-desktop-icons">
      <button type="button" className="desktop-icon" onClick={onDetails}>
        <span className="desktop-icon-glyph">📄</span>
        <span className="desktop-icon-label">פרטים.txt</span>
      </button>

      <button type="button" className="desktop-icon" onClick={onInfo}>
        <span className="desktop-icon-glyph">📁</span>
        <span className="desktop-icon-label">מידע</span>
      </button>

      <button type="button" className="desktop-icon" onClick={onTickets}>
        <span className="desktop-icon-glyph">🎟️</span>
        <span className="desktop-icon-label">tickets.exe</span>
      </button>
    </div>
  )
}
