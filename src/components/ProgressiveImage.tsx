import { useEffect, useState } from 'react'

interface ProgressiveImageProps {
  /** Image variants ordered low → high resolution. Required, non-empty. */
  tiers: string[]
  alt: string
  className?: string
}

/**
 * Highest tier index to climb to, based on the visitor's connection (Network
 * Information API). Mirrors Background's policy but scaled to this image's tier
 * count: slow links stop short of the sharpest variant. `saveData` is respected.
 */
function maxTierForConnection(tierCount: number): number {
  const last = tierCount - 1
  // Not all browsers expose navigator.connection — default to full quality.
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
  if (!conn) return last
  if (conn.saveData) return Math.min(1, last) // Data Saver → one step up from the tiniest.
  switch (conn.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 0 // tiniest variant only
    case '3g':
      return Math.max(0, last - 1) // one below the sharpest
    default:
      return last // 4g and above → full resolution.
  }
}

/**
 * Progressively-loaded <img>, same treatment as the Bliss Background: paint the
 * tiniest variant first (instant) and climb tier-by-tier, swapping the visible
 * src only once the next, sharper variant has fully decoded. Until we reach the
 * sharpest reachable tier the image renders with nearest-neighbour upscaling
 * (`image-rendering: pixelated`) — crisply blocky rather than blurry, and a nod
 * to the XP-era nostalgia theme — then switches to smooth rendering once sharp.
 */
export default function ProgressiveImage({ tiers, alt, className }: ProgressiveImageProps) {
  // Connection cap is read once at mount and kept stable across renders.
  const [maxTier] = useState(() => maxTierForConnection(tiers.length))
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let cancelled = false
    let tier = 0

    const loadNext = () => {
      if (cancelled || tier > maxTier) return
      const next = tiers[tier]
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        setIdx(tier)
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
  }, [tiers, maxTier])

  const blocky = idx < maxTier
  return (
    <img
      className={[className, blocky ? 'progressive-img--blocky' : null].filter(Boolean).join(' ')}
      src={tiers[idx]}
      alt={alt}
    />
  )
}
