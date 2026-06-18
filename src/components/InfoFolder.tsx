import { useEffect, useState } from 'react'
import { INFO_ITEMS } from '../lib/config'
import XPWindow from './XPWindow'
import Icon from './Icon'
import ProgressiveImage from './ProgressiveImage'
import shustus40 from '../../images/logos/shustus-40.png'
import shustus160 from '../../images/logos/shustus-160.png'
import shustus440 from '../../images/logos/shustus-440.png'
import oded from '../../images/artists/oded.png'
import ilan from '../../images/artists/ilan.png'
import tal from '../../images/artists/tal.png'

// Image tiers (low → high res) for the folder entries, keyed by the `id` from
// INFO_ITEMS. Entries without an image fall back to the emoji glyph below.
// (Kept here, not in config.ts, so config stays free of asset imports.)
// The artist portraits are single-resolution, so each gets a one-tier array.
const IMAGES: Record<string, string[]> = {
  shustus: [shustus40, shustus160, shustus440],
  'oded-paz': [oded],
  'ilan-rozenfeld': [ilan],
  'tal-mosseri': [tal],
}
// Icon (slug + emoji fallback) for the folder entries without a real image.
const GLYPHS: Record<string, { name: string; e: string }> = {
  dj: { name: 'cd', e: '💿' },
  stands: { name: 'party', e: '🎉' },
  'mystery-1': { name: 'mystery', e: '❓' },
  'mystery-2': { name: 'mystery', e: '❓' },
  'mystery-3': { name: 'mystery', e: '❓' },
  'mystery-4': { name: 'mystery', e: '❓' },
}
const DEFAULT_GLYPH = { name: 'document', e: '📄' }

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
        title="תכני האירוע"
        icon={<Icon name="folder" e="📁" />}
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
                <ProgressiveImage
                  className={`info-file-img${item.id === 'shustus' ? ' info-file-img--shustus' : ''}`}
                  tiers={IMAGES[item.id]}
                  alt=""
                />
              ) : (
                <Icon
                  name={(GLYPHS[item.id] ?? DEFAULT_GLYPH).name}
                  e={(GLYPHS[item.id] ?? DEFAULT_GLYPH).e}
                  className="info-file-glyph"
                />
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
              icon={
                IMAGES[selected.id] ? (
                  <Icon name="picture" e="🖼️" />
                ) : (
                  <Icon name="document" e="📄" />
                )
              }
              onClose={() => setSelected(null)}
            >
              <div className="info-popup">
                {IMAGES[selected.id] && (
                  <ProgressiveImage
                    className={`info-popup-img${selected.id === 'shustus' ? ' info-popup-img--shustus' : ''}`}
                    tiers={IMAGES[selected.id]}
                    alt={selected.label}
                  />
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
