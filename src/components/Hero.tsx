import { EVENT } from '../lib/config'
import Countdown from './Countdown'
import Icon from './Icon'
import ProgressiveImage from './ProgressiveImage'
import logo80 from '../../images/logos/hero-logo-80.png'
import logo320 from '../../images/logos/hero-logo-320.png'
import logo1280 from '../../images/logos/hero-logo-1280.png'
import sponsor24 from '../../images/logos/sponsor-24.png'
import sponsor80 from '../../images/logos/sponsor-80.png'
import sponsor200 from '../../images/logos/sponsor-200.png'

// Logo variants ordered low → high resolution (see ProgressiveImage).
const LOGO_TIERS = [logo80, logo320, logo1280]
const SPONSOR_TIERS = [sponsor24, sponsor80, sponsor200]

interface HeroProps {
  onStartClick: () => void
}

/** The Windows XP "Bliss" desktop hero with title + live countdown. */
export default function Hero({ onStartClick }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-center">
        <h1 className="hero-title">
          <ProgressiveImage className="hero-logo" tiers={LOGO_TIERS} alt={EVENT.titleLine1} />
        </h1>

        <div className="hero-sponsor">
          <span className="hero-sponsor-label">בסיוע</span>
          <ProgressiveImage className="hero-sponsor-logo" tiers={SPONSOR_TIERS} alt="לוגו נותן החסות" />
        </div>

        <Countdown target={EVENT.startsAtISO} />

        <button className="hero-cta xp-button xp-button--green" onClick={onStartClick}>
          <Icon name="tickets" e="🎟️" /> אני רוצה כרטיס!
        </button>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        גללו למטה כדי לפתוח את החלונות ▾
      </div>
    </header>
  )
}
