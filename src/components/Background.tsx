import { useEffect, useState } from 'react'
import bliss32 from '../../images/bliss/bliss-32.jpg'
import bliss128 from '../../images/bliss/bliss-128.jpg'
import bliss480 from '../../images/bliss/bliss-480.jpg'
import bliss1280 from '../../images/bliss/bliss-1280.jpg'
import bliss2560 from '../../images/bliss/bliss-2560.jpg'

/**
 * The "Bliss" desktop wallpaper, loaded progressively from low to high
 * resolution. We always paint the tiniest variant first (instant, <1 KB) and
 * then climb tier-by-tier, only swapping the visible src once the next, sharper
 * variant has fully decoded — so the picture sharpens in steps and never shows
 * a blank/half-loaded frame.
 *
 * Nearest-neighbour upscaling (`image-rendering: pixelated`, see xp.css) keeps
 * the early low-res tiers crisply blocky rather than blurry — both an explicit
 * requirement and a fitting nod to the XP-era nostalgia theme.
 */
const TIERS = [bliss32, bliss128, bliss480, bliss1280, bliss2560]

/**
 * Highest tier index we should climb to, based on the visitor's connection
 * (Network Information API). On a slow link we stop early to avoid pulling the
 * full-size image; on 4g/unknown we go all the way. `saveData` is respected.
 */
function maxTierForConnection(): number {
  const last = TIERS.length - 1
  // Not all browsers expose navigator.connection — default to full quality.
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
  if (!conn) return last
  if (conn.saveData) return 2 // Data Saver on → cap at the 480px tier.
  switch (conn.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 1 // ~128px
    case '3g':
      return 3 // ~1280px
    default:
      return last // 4g and above → full resolution.
  }
}

export default function Background() {
  const [src, setSrc] = useState(TIERS[0])

  useEffect(() => {
    let cancelled = false
    const maxTier = maxTierForConnection()
    let tier = 0

    const loadNext = () => {
      if (cancelled || tier > maxTier) return
      const next = TIERS[tier]
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        setSrc(next)
        tier += 1
        loadNext()
      }
      // A broken tier must not stall the climb — skip it and keep going.
      img.onerror = () => {
        if (cancelled) return
        tier += 1
        loadNext()
      }
      img.src = next
    }

    loadNext()
    return () => {
      cancelled = true
    }
  }, [])

  return <img className="bg-image" src={src} alt="" aria-hidden="true" />
}
