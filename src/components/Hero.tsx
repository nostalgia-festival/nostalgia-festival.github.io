import { EVENT } from '../lib/config'
import Countdown from './Countdown'

interface HeroProps {
  onStartClick: () => void
}

/** The Windows XP "Bliss" desktop hero with title + live countdown. */
export default function Hero({ onStartClick }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-desktop-icons" aria-hidden="true">
        <div className="desktop-icon">
          <span className="desktop-icon-glyph">🖥️</span>
          <span className="desktop-icon-label">המחשב שלי</span>
        </div>
        <div className="desktop-icon">
          <span className="desktop-icon-glyph">🗑️</span>
          <span className="desktop-icon-label">סל המיחזור</span>
        </div>
        <div className="desktop-icon">
          <span className="desktop-icon-glyph">🌐</span>
          <span className="desktop-icon-label">אינטרנט</span>
        </div>
      </div>

      <div className="hero-center">
        <h1 className="hero-title">
          <span className="hero-title-main">{EVENT.titleLine1}</span>
          <span className="hero-title-sub">{EVENT.titleLine2}</span>
        </h1>

        <Countdown target={EVENT.startsAtISO} />

        <button className="hero-cta xp-button xp-button--green" onClick={onStartClick}>
          🎟️ אני רוצה כרטיס!
        </button>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        גללו למטה כדי לפתוח את החלונות ▾
      </div>
    </header>
  )
}
