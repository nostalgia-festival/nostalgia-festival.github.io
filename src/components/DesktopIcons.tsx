import { useEffect, useLayoutEffect, useRef } from 'react'
import Icon from './Icon'
import XPWindow from './XPWindow'
import Minesweeper, { MinesweeperGlyph } from './Minesweeper'
import type { TaskWindow } from '../lib/useTaskWindow'

interface DesktopIconsProps {
  /** Scroll to the "פרטי האירוע" (details.txt) window. */
  onDetails: () => void
  /** Open the "מידע" (info) folder window. */
  onInfo: () => void
  /** Scroll to the ticket purchase wizard (tickets.exe). */
  onTickets: () => void
  /** Scroll to the "צרו קשר" contact window. */
  onContact: () => void
  /** Recycle bin window lifecycle (shared with the taskbar — owned by App). */
  recycle: TaskWindow
  /** Minesweeper window lifecycle (shared with the taskbar — owned by App). */
  minesweeper: TaskWindow
}

/**
 * The XP "desktop" shortcuts pinned to the wallpaper. They are rendered at the
 * App level (not inside the Hero) and positioned `fixed`, so they stay parked in
 * the corner and travel with the viewport as the visitor scrolls — never
 * scrolling away with the hero. Each one double-acts as a jump link to its
 * matching window further down the page.
 */
export default function DesktopIcons({ onDetails, onInfo, onTickets, onContact, recycle, minesweeper }: DesktopIconsProps) {
  // The recycle bin is the only icon that opens its own window rather than
  // scrolling to a section in the page. Its open/minimize state is owned by App
  // (see useTaskWindow) so its taskbar button can track it. The bin holds one
  // "deleted" file — a working Minesweeper clone — which opens in its own modal
  // layer on top of the bin.

  // The five shortcuts lay out as a vertical column on desktop but as a wrapping
  // horizontal row on mobile (see .hero-desktop-icons). On the narrowest phones
  // the row can't hold all five, and the recycle bin — the last child — drops
  // alone onto a lonely second line. We can't predict the wrap point in CSS
  // because the icon labels (e.g. "כרטיסים.exe") are wider than the nominal 60px
  // box, so instead we measure the real layout: if the bin lands on a different
  // row than the first icon, hide it. (The Minesweeper easter egg inside is an
  // acceptable casualty on tiny screens.) Done imperatively rather than via
  // state to measure-and-hide within one synchronous pass — no flicker.
  const firstIconRef = useRef<HTMLButtonElement>(null)
  const recycleRef = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    const recycle = recycleRef.current
    const first = firstIconRef.current
    if (!recycle || !first) return
    const mobile = window.matchMedia('(max-width: 520px)')
    function measure() {
      if (!recycle || !first) return
      // Desktop column layout stacks every icon on its own row by design, so
      // row comparison is meaningless there — always show the bin.
      if (!mobile.matches) {
        recycle.style.display = ''
        return
      }
      // Show it first so we can read its true position, then hide if it wrapped.
      recycle.style.display = ''
      recycle.style.display = recycle.offsetTop > first.offsetTop ? 'none' : ''
    }
    measure()
    window.addEventListener('resize', measure)
    mobile.addEventListener('change', measure)
    return () => {
      window.removeEventListener('resize', measure)
      mobile.removeEventListener('change', measure)
    }
  }, [])

  // Escape closes the topmost visible layer (mirrors the modal in InfoFolder).
  useEffect(() => {
    if (!recycle.visible && !minesweeper.visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (minesweeper.visible) minesweeper.close()
      else recycle.close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recycle, minesweeper])

  return (
    <>
      <div className="hero-desktop-icons">
        <button type="button" className="desktop-icon" onClick={onDetails} ref={firstIconRef}>
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

        <button type="button" className="desktop-icon desktop-icon--recycle" onClick={recycle.show} ref={recycleRef}>
          <Icon name="recyclebin" e="🗑️" className="desktop-icon-glyph" />
          <span className="desktop-icon-label">סל המיחזור</span>
        </button>
      </div>

      {/* Recycle bin — holds one "deleted" file: a Minesweeper clone. */}
      {recycle.visible && (
        <div
          className="xp-modal-overlay"
          onClick={recycle.close}
          role="presentation"
        >
          <div className="xp-modal xp-modal--popup" onClick={(e) => e.stopPropagation()}>
            <XPWindow
              title="סל המיחזור"
              icon={<Icon name="recyclebin" e="🗑️" />}
              menu={['קובץ', 'עריכה', 'תצוגה', 'מועדפים', 'עזרה']}
              onClose={recycle.close}
              onMinimize={recycle.minimize}
            >
              <div className="info-folder">
                <button
                  type="button"
                  className="info-file"
                  onClick={minesweeper.show}
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
      {minesweeper.visible && (
        <div
          className="xp-modal-overlay"
          onClick={minesweeper.close}
          role="presentation"
        >
          <div className="xp-modal xp-modal--minesweeper" onClick={(e) => e.stopPropagation()}>
            <XPWindow
              title="שולה המוקשים"
              icon={<MinesweeperGlyph />}
              menu={['משחק', 'עזרה']}
              onClose={minesweeper.close}
              onMinimize={minesweeper.minimize}
            >
              <Minesweeper />
            </XPWindow>
          </div>
        </div>
      )}
    </>
  )
}
