// Renders an emoji as a bundled Twemoji SVG instead of relying on the OS emoji
// font. The platform emoji fonts differ wildly (and clash with the XP/2000
// nostalgia theme), so we pin a single consistent image set. The SVGs live in
// images/emoji/, named by Unicode code point, and are bundled at build time -
// no runtime CDN dependency, in keeping with the rest of the site.

// Vite inlines the URL of every emoji SVG, keyed by its file path.
const ASSETS = import.meta.glob('../../images/emoji/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// path → code point (e.g. "../../images/emoji/1f39f.svg" → "1f39f").
const BY_CODE: Record<string, string> = {}
for (const [path, url] of Object.entries(ASSETS)) {
  const code = path.slice(path.lastIndexOf('/') + 1).replace('.svg', '')
  BY_CODE[code] = url
}

/**
 * Convert an emoji string to its Twemoji file name (hyphen-joined hex code
 * points). Mirrors twemoji's own rule: drop the U+FE0F variation selector
 * unless the sequence is a ZWJ sequence (which keeps FE0F in its file names).
 */
function toCodePoint(emoji: string): string {
  const str = emoji.indexOf('‍') < 0 ? emoji.replace(/️/g, '') : emoji
  const points: string[] = []
  let high = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    if (high) {
      points.push((0x10000 + ((high - 0xd800) << 10) + (c - 0xdc00)).toString(16))
      high = 0
    } else if (c >= 0xd800 && c <= 0xdbff) {
      high = c
    } else {
      points.push(c.toString(16))
    }
  }
  return points.join('-')
}

interface EmojiProps {
  /** The emoji character, e.g. "🎟️". */
  e: string
  /**
   * Accessible label. Omit (or pass "") for purely decorative emoji, which are
   * then hidden from assistive tech.
   */
  label?: string
  className?: string
}

export default function Emoji({ e, label, className }: EmojiProps) {
  const src = BY_CODE[toCodePoint(e)]
  // Unknown emoji (no bundled asset) falls back to the raw character so we
  // never render a broken image.
  if (!src) return <span className={className}>{e}</span>
  return (
    <img
      className={['emoji', className].filter(Boolean).join(' ')}
      src={src}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      loading="lazy"
    />
  )
}
