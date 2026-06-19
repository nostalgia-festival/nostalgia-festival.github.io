import { useEffect, useState, type ReactNode } from 'react'
import { INFO_ITEMS, type InfoItem } from '../lib/config'
import XPWindow from './XPWindow'
import Icon from './Icon'
import ProgressiveImage from './ProgressiveImage'
import type { TaskWindow } from '../lib/useTaskWindow'
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

interface InfoFolderProps {
  /** The readme currently chosen (null when none has been opened yet). */
  selected: InfoItem | null
  /** Choose a readme to open (and bring its window forward). */
  onOpen: (item: InfoItem) => void
  /** The readme popup's window lifecycle (shared with the taskbar). */
  window: TaskWindow
  /** Task-pane shortcuts: scroll to the ticket wizard / contact / details. */
  onTickets?: () => void
  onContact?: () => void
  onDetails?: () => void
}

/**
 * A collapsible XP "task pane" panel (blue Luna webview block): a header bar with
 * a chevron that toggles the body, just like "File and Folder Tasks" in Explorer.
 */
function TaskPanel({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`task-panel${open ? '' : ' task-panel--closed'}`}>
      <button
        type="button"
        className="task-panel-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="task-panel-title">{title}</span>
        <span className="task-panel-chevron" aria-hidden="true" />
      </button>
      {open && <div className="task-panel-body">{children}</div>}
    </div>
  )
}

/** One blue hyperlink row inside a task pane panel (icon + label). */
function TaskLink({ icon, onClick, children }: { icon: ReactNode; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" className="task-link" onClick={onClick}>
      <span className="task-link-icon">{icon}</span>
      <span className="task-link-label">{children}</span>
    </button>
  )
}

/**
 * The "מידע" folder — an inline XP "file browser" window in the page's window
 * stack (the מידע desktop icon scrolls here). It lists the event's content as
 * files; clicking a file opens a readme popup with its info. That popup is a
 * real window: it gets a taskbar button and can be minimized (state owned by
 * App via useTaskWindow), and still closes on its ✕, a backdrop click, or
 * Escape — just like the Recycle Bin.
 */
export default function InfoFolder({ selected, onOpen, window: win, onTickets, onContact, onDetails }: InfoFolderProps) {
  // Escape closes the open popup.
  useEffect(() => {
    if (!win.visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') win.close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [win])

  return (
    <>
      {/* Folder window — a normal window in the scrolling stack. */}
      <XPWindow
        className="xp-window--folder"
        title="תכני האירוע"
        icon={<Icon name="folder" e="📁" />}
        menu={['קובץ', 'עריכה', 'תצוגה', 'מועדפים', 'עזרה']}
        statusBar={`${INFO_ITEMS.length} אובייקטים`}
      >
        <div className="folder-layout">
          {/* The signature XP "task pane": blue webview panels down the side. */}
          <aside className="folder-tasks">
            <TaskPanel title="משימות תיקייה">
              <TaskLink icon={<Icon name="tickets" e="🎟️" />} onClick={onTickets}>
                קנה כרטיסים
              </TaskLink>
              <TaskLink icon={<Icon name="mail" e="✉️" />} onClick={onContact}>
                צור קשר
              </TaskLink>
            </TaskPanel>

            <TaskPanel title="מקומות אחרים">
              <TaskLink icon={<Icon name="calendar" e="📅" />} onClick={onDetails}>
                פרטי האירוע
              </TaskLink>
              <TaskLink
                icon={<Icon name="location" e="📍" />}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                שולחן העבודה
              </TaskLink>
            </TaskPanel>

            <TaskPanel title="פרטים">
              <div className="folder-details">
                <p className="folder-details-name">תכני האירוע</p>
                <p className="folder-details-line">תיקיית קבצים</p>
                <p className="folder-details-line">{INFO_ITEMS.length} אובייקטים</p>
              </div>
            </TaskPanel>
          </aside>

          <div className="info-folder">
          {INFO_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className="info-file"
              onClick={() => onOpen(item)}
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
        </div>
      </XPWindow>

      {/* Info popup — modal; backdrop click closes the popup. Only on screen
          when visible (open and not minimized to the taskbar). */}
      {selected && win.visible && (
        <div
          className="xp-modal-overlay"
          onClick={win.close}
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
              onClose={win.close}
              onMinimize={win.minimize}
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
