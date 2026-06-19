import { useEffect, useState, type ReactNode } from 'react'

/** The classic 4-color flag, matching the tab favicon (not the modern window glyph). */
function StartFlag() {
  return (
    <svg className="start-flag" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" fill="#f25022" />
      <rect x="9" y="2" width="5" height="5" fill="#7fba00" />
      <rect x="2" y="9" width="5" height="5" fill="#00a4ef" />
      <rect x="9" y="9" width="5" height="5" fill="#ffb900" />
    </svg>
  )
}

/**
 * Tray speaker icon (XP "Volume" notification-area glyph). When `muted`, the
 * sound waves are replaced with a red ✕ to read as muted.
 */
function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg className="tray-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1.5 6h2.5L7.5 3v10L4 10H1.5z" fill="#eef3fb" stroke="#0b3a8f" strokeWidth="0.6" strokeLinejoin="round" />
      {muted ? (
        <path d="M10 5l4 6M14 5l-4 6" fill="none" stroke="#e23b3b" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <>
          <path d="M9.8 4.4a4 4 0 0 1 0 7.2" fill="none" stroke="#eef3fb" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M11.3 2.6a6.4 6.4 0 0 1 0 10.8" fill="none" stroke="#eef3fb" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

/** Tray "Local Area Connection" icon: two little monitors with a green link light. */
function NetworkIcon() {
  return (
    <svg className="tray-icon tray-icon--network" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.6" y="2.6" width="8" height="6" rx="0.6" fill="#cdddf3" stroke="#0b3a8f" strokeWidth="0.6" />
      <rect x="1.8" y="3.6" width="5.6" height="3.4" fill="#2f6fd6" />
      <rect x="7" y="7" width="8" height="6" rx="0.6" fill="#cdddf3" stroke="#0b3a8f" strokeWidth="0.6" />
      <rect x="8.2" y="8" width="5.6" height="3.4" fill="#2f6fd6" />
      <circle cx="13.4" cy="3.4" r="1.5" fill="#3ad14a" stroke="#0a5a1f" strokeWidth="0.4" />
    </svg>
  )
}

function currentClock(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/** One open window, shown as a pressable taskbar button. */
export interface TaskButton {
  id: string
  /** Button label (the window's title). */
  title: string
  /** Small glyph shown before the label. */
  icon: ReactNode
  /** Pressed-in (focused) when visible; raised when minimized. */
  active: boolean
  /** Click handler — toggles minimize/restore. */
  onClick: () => void
}

interface TaskbarProps {
  onStartClick: () => void
  /** Open windows to list as taskbar buttons (empty when none are open). */
  tasks: TaskButton[]
  /** Whether the background music is currently muted. */
  muted: boolean
  /** Toggle the background music mute state (the tray volume icon). */
  onToggleMute: () => void
}

/**
 * The fixed XP taskbar: green Start button, a row of buttons for any open
 * windows, then the notification area (tray icons + live clock). A one-time
 * balloon tip rises from the tray a few seconds after load to nudge the visitor
 * toward the ticket flow, exactly like XP's tray notifications.
 */
export default function Taskbar({ onStartClick, tasks, muted, onToggleMute }: TaskbarProps) {
  const [clock, setClock] = useState(currentClock)
  const [balloonOpen, setBalloonOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setClock(currentClock()), 1000 * 15)
    return () => clearInterval(id)
  }, [])

  // Show the balloon once, a few seconds in, then auto-dismiss it. Kept short so
  // it reads as a nostalgic flourish, not a nag.
  useEffect(() => {
    const show = setTimeout(() => setBalloonOpen(true), 3500)
    const hide = setTimeout(() => setBalloonOpen(false), 15000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  return (
    <>
      <div className="taskbar">
        <button className="start-button" onClick={onStartClick}>
          <StartFlag />
          התחל
        </button>

        <div className="taskbar-tasks">
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`task-button ${t.active ? 'is-active' : ''}`}
              onClick={t.onClick}
            >
              <span className="task-button-icon">{t.icon}</span>
              <span className="task-button-label">{t.title}</span>
            </button>
          ))}
        </div>

        <div className="taskbar-tray">
          <span className="tray-icons">
            <button
              type="button"
              className="tray-icon-button"
              onClick={onToggleMute}
              aria-label={muted ? 'הפעל מוזיקה' : 'השתק מוזיקה'}
              aria-pressed={muted}
              title={muted ? 'הפעל מוזיקה' : 'השתק מוזיקה'}
            >
              <VolumeIcon muted={muted} />
            </button>
            <NetworkIcon />
          </span>
          <span className="tray-clock">{clock}</span>
        </div>
      </div>

      {balloonOpen && (
        <div className="tray-balloon" role="status">
          <div className="tray-balloon-head">
            <span className="tray-balloon-info" aria-hidden="true">i</span>
            <span>פסטיבל נוסטלגיה</span>
            <button
              type="button"
              className="tray-balloon-close"
              onClick={() => setBalloonOpen(false)}
              aria-label="סגור"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            className="tray-balloon-body"
            onClick={() => {
              setBalloonOpen(false)
              onStartClick()
            }}
          >
            הכרטיסים שלכם ממתינים! לחצו כאן כדי לבחור כמות ולשריין מקום.
          </button>
        </div>
      )}
    </>
  )
}
