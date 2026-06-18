import { useEffect, useState } from 'react'
import Icon from './Icon'
import XPWindow from './XPWindow'
import Minesweeper, { MinesweeperGlyph } from './Minesweeper'

interface DesktopIconsProps {
  /** Scroll to the "פרטי האירוע" (details.txt) window. */
  onDetails: () => void
  /** Open the "מידע" (info) folder window. */
  onInfo: () => void
  /** Scroll to the ticket purchase wizard (tickets.exe). */
  onTickets: () => void
  /** Scroll to the "צרו קשר" contact window. */
  onContact: () => void
}

/**
 * The XP "desktop" shortcuts pinned to the wallpaper. They are rendered at the
 * App level (not inside the Hero) and positioned `fixed`, so they stay parked in
 * the corner and travel with the viewport as the visitor scrolls — never
 * scrolling away with the hero. Each one double-acts as a jump link to its
 * matching window further down the page.
 */
export default function DesktopIcons({ onDetails, onInfo, onTickets, onContact }: DesktopIconsProps) {
  // The recycle bin is the only icon that opens its own window rather than
  // scrolling to a section in the page, so its open/close state lives here. The
  // bin holds one "deleted" file — a working Minesweeper clone — which opens in
  // its own modal layer on top of the bin.
  const [recycleOpen, setRecycleOpen] = useState(false)
  const [minesweeperOpen, setMinesweeperOpen] = useState(false)

  // Escape closes the topmost open layer (mirrors the modal in InfoFolder).
  useEffect(() => {
    if (!recycleOpen && !minesweeperOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (minesweeperOpen) setMinesweeperOpen(false)
      else setRecycleOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recycleOpen, minesweeperOpen])

  return (
    <>
      <div className="hero-desktop-icons">
        <button type="button" className="desktop-icon" onClick={onDetails}>
          <Icon name="document" e="📄" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">פרטים.txt</span>
        </button>

        <button type="button" className="desktop-icon" onClick={onInfo}>
          <Icon name="folder" e="📁" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">מידע</span>
        </button>

        <button type="button" className="desktop-icon" onClick={onTickets}>
          <Icon name="tickets" e="🎟️" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">כרטיסים.exe</span>
        </button>

        <button type="button" className="desktop-icon" onClick={onContact}>
          <Icon name="mail" e="✉️" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">צרו קשר</span>
        </button>

        <button type="button" className="desktop-icon desktop-icon--recycle" onClick={() => setRecycleOpen(true)}>
          <Icon name="recyclebin" e="🗑️" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">סל המיחזור</span>
        </button>
      </div>

      {/* Recycle bin — holds one "deleted" file: a Minesweeper clone. */}
      {recycleOpen && (
        <div
          className="xp-modal-overlay"
          onClick={() => setRecycleOpen(false)}
          role="presentation"
        >
          <div className="xp-modal xp-modal--popup" onClick={(e) => e.stopPropagation()}>
            <XPWindow
              title="סל המיחזור"
              icon={<Icon name="recyclebin" e="🗑️" />}
              menu={['קובץ', 'עריכה', 'תצוגה', 'מועדפים', 'עזרה']}
              onClose={() => setRecycleOpen(false)}
            >
              <div className="info-folder">
                <button
                  type="button"
                  className="info-file"
                  onClick={() => setMinesweeperOpen(true)}
                >
                  <MinesweeperGlyph className="info-file-glyph" />
                  <span className="info-file-label">שולה המוקשים.exe</span>
                </button>
              </div>
            </XPWindow>
          </div>
        </div>
      )}

      {/* Minesweeper — a modal layer above the bin; backdrop click closes it. */}
      {minesweeperOpen && (
        <div
          className="xp-modal-overlay"
          onClick={() => setMinesweeperOpen(false)}
          role="presentation"
        >
          <div className="xp-modal xp-modal--minesweeper" onClick={(e) => e.stopPropagation()}>
            <XPWindow
              title="שולה המוקשים"
              icon={<MinesweeperGlyph />}
              menu={['משחק', 'עזרה']}
              onClose={() => setMinesweeperOpen(false)}
            >
              <Minesweeper />
            </XPWindow>
          </div>
        </div>
      )}
    </>
  )
}
