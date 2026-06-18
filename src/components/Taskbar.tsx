import { useEffect, useState } from 'react'
import Emoji from './Emoji'

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
        <Emoji e="🪟" className="start-flag" />
        התחל
      </button>

      <div className="taskbar-tray">
        <span className="tray-clock">{clock}</span>
      </div>
    </div>
  )
}
