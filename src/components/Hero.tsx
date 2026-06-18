import { EVENT } from '../lib/config'
import Countdown from './Countdown'
import logo from '../../images/LogoDetails.png'
import sponsorLogo from '../../images/לוגו סגול.png'

interface HeroProps {
  onStartClick: () => void
}

/** The Windows XP "Bliss" desktop hero with title + live countdown. */
export default function Hero({ onStartClick }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-center">
        <h1 className="hero-title">
          <img className="hero-logo" src={logo} alt={EVENT.titleLine1} />
        </h1>

        <div className="hero-sponsor">
          <span className="hero-sponsor-label">בסיוע</span>
          <img className="hero-sponsor-logo" src={sponsorLogo} alt="לוגו נותן החסות" />
        </div>

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
