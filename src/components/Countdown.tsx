import { Fragment, useEffect, useState } from 'react'

interface CountdownProps {
  /** Target time as an ISO string. */
  target: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const seconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  }
}

const PARTS: { key: keyof Omit<TimeLeft, 'done'>; label: string }[] = [
  { key: 'days', label: 'ימים' },
  { key: 'hours', label: 'שעות' },
  { key: 'minutes', label: 'דקות' },
  { key: 'seconds', label: 'שניות' },
]

/** Live countdown to the event, styled to match the hero mock. */
export default function Countdown({ target }: CountdownProps) {
  const targetMs = new Date(target).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(targetMs))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(computeTimeLeft(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (timeLeft.done) {
    return (
      <div className="countdown countdown--done">
        <span>הדלתות נפתחו! נתראה בקפסולה 🎉</span>
      </div>
    )
  }

  return (
    <div className="countdown" role="timer" aria-label="זמן עד תחילת האירוע">
      {/* Rendered LTR so the time reads HH:MM:SS naturally, even on an RTL page. */}
      <div className="countdown-row" dir="ltr">
        {PARTS.map((part, i) => (
          <Fragment key={part.key}>
            <div className="countdown-cell">
              <div className="countdown-value">
                {String(timeLeft[part.key]).padStart(2, '0')}
              </div>
              <div className="countdown-label">{part.label}</div>
            </div>
            {i < PARTS.length - 1 && <span className="countdown-sep">:</span>}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
