import { EVENT } from '../lib/config'
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

        {/* A loud early-2000s "starburst" sticker — the kind that screamed off
            every Geocities/Flash splash page. Pure CSS spiky star + blinking,
            color-cycling text. Hypes the returning ששטוס game, and doubles as
            the hero CTA: clicking it scrolls to the ticket wizard. */}
        <button
          type="button"
          className="hero-burst"
          onClick={onStartClick}
          aria-label="חדש! ששטוס חוזר ללילה אחד בלבד, ואתם משתתפים! יופיעו על הבמה: טל מוסרי, גיורא חמיצר, עודד פז ואילן רוזנפלד. לחצו לרכישת כרטיס"
        >
          <div className="hero-burst-star" aria-hidden="true"></div>
          <div className="hero-burst-text" aria-hidden="true">
            <span className="hero-burst-kicker">★ חדש! ★</span>
            <span className="hero-burst-title">ששטוס חוזר!</span>
            <span className="hero-burst-sub">ללילה אחד בלבד</span>
            <span className="hero-burst-sub2">ואתם משתתפים!</span>
            <span className="hero-burst-lineup-label">יופיעו על הבמה:</span>
            <span className="hero-burst-artists">
              טל מוסרי + גיורא חמיצר + עודד פז + אילן רוזנפלד
            </span>
          </div>
        </button>
      </div>

      <div className="hero-scroll-hint" aria-hidden="true">
        גללו למטה כדי לפתוח את החלונות ▾
      </div>
    </header>
  )
}
