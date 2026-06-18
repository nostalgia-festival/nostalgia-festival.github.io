import { useEffect, useState } from 'react'
import { INFO_ITEMS } from '../lib/config'
import XPWindow from './XPWindow'
import shustusLogo from '../../images/לוגו ששטוס מ2008.png'

// Images for the folder entries, keyed by the `id` from INFO_ITEMS. Entries
// without an image fall back to the emoji glyph below. (Kept here, not in
// config.ts, so config stays free of asset imports.)
const IMAGES: Record<string, string> = {
  shustus: shustusLogo,
}
const GLYPHS: Record<string, string> = {
  'oded-paz': '🎙️',
  'ilan-rozenfeld': '🎙️',
  'tal-mosseri': '🎤',
  dj: '💿',
}

type Item = (typeof INFO_ITEMS)[number]

/**
 * The "מידע" folder — an inline XP "file browser" window in the page's window
 * stack (the מידע desktop icon scrolls here). It lists the event's content as
 * files; clicking a file opens a popup with its info. Only the popup is modal:
 * it closes on its ✕ button, on a click outside (the dimmed backdrop), or on
 * Escape.
 */
export default function InfoFolder() {
  const [selected, setSelected] = useState<Item | null>(null)

  // Escape closes the open popup.
  useEffect(() => {
    if (!selected) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <>
      {/* Folder window — a normal window in the scrolling stack. */}
      <XPWindow
        title="תכני האירוע — info"
        icon="📁"
        menu={['קובץ', 'עריכה', 'תצוגה', 'מועדפים', 'עזרה']}
      >
        <div className="info-folder">
          {INFO_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className="info-file"
              onClick={() => setSelected(item)}
            >
              {IMAGES[item.id] ? (
                <img className="info-file-img" src={IMAGES[item.id]} alt="" />
              ) : (
                <span className="info-file-glyph" aria-hidden="true">
                  {GLYPHS[item.id] ?? '📄'}
                </span>
              )}
              <span className="info-file-label">{item.label}</span>
            </button>
          ))}
        </div>
      </XPWindow>

      {/* Info popup — modal; backdrop click closes the popup. */}
      {selected && (
        <div
          className="xp-modal-overlay"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div className="xp-modal xp-modal--popup" onClick={(e) => e.stopPropagation()}>
            <XPWindow
              title={`${selected.label} — readme.txt`}
              icon={IMAGES[selected.id] ? '🖼️' : '📄'}
              onClose={() => setSelected(null)}
            >
              <div className="info-popup">
                {IMAGES[selected.id] && (
                  <img className="info-popup-img" src={IMAGES[selected.id]} alt={selected.label} />
                )}
                <h3 className="info-popup-title">{selected.title}</h3>
                {selected.lines.map((line, i) => (
                  <p className="info-popup-line" key={i}>
                    {line}
                  </p>
                ))}
              </div>
            </XPWindow>
          </div>
        </div>
      )}
    </>
  )
}
