import { useEffect, useState } from 'react'

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

function currentClock(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

interface TaskbarProps {
  onStartClick: () => void
}

/** The fixed XP taskbar: green Start button on one side, live clock on the other. */
export default function Taskbar({ onStartClick }: TaskbarProps) {
  const [clock, setClock] = useState(currentClock)

  useEffect(() => {
    const id = setInterval(() => setClock(currentClock()), 1000 * 15)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="taskbar">
      <button className="start-button" onClick={onStartClick}>
        <StartFlag />
        התחל
      </button>

      <div className="taskbar-tray">
        <span className="tray-clock">{clock}</span>
      </div>
    </div>
  )
}
