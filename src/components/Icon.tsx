// Renders an authentic Windows XP system icon (original .ico file) for the
// chrome roles where a modern emoji would clash with the theme. The icons live
// in images/icons/, named by a semantic slug, and are bundled at build time — no
// runtime CDN, mirroring Emoji.tsx. (The untouched originals, by their real XP
// names, are kept in images/icons/source/ — outside this non-recursive glob.)
//
// Graceful fallback: if a given slug has no .ico in images/icons/, the matching
// emoji (`e`) is rendered via <Emoji> instead, so the site still builds and runs
// with the folder empty. Each icon goes live the moment its file appears.

import Emoji from './Emoji'

// Vite inlines the URL of every icon, keyed by its file path. Browsers render
// .ico in <img> just like a favicon, picking the largest frame in the file.
const ASSETS = import.meta.glob('../../images/icons/*.ico', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// path → slug (e.g. "../../images/icons/folder.ico" → "folder"). Lowercased so
// the slug match is robust to the originals' mixed-case names.
const BY_NAME: Record<string, string> = {}
for (const [path, url] of Object.entries(ASSETS)) {
  const name = path.slice(path.lastIndexOf('/') + 1).replace('.ico', '').toLowerCase()
  BY_NAME[name] = url
}

interface IconProps {
  /** Semantic icon slug matching a file in images/icons/, e.g. "document". */
  name: string
  /** Emoji fallback shown until the PNG is supplied, e.g. "📄". */
  e: string
  /**
   * Accessible label. Omit (or pass "") for purely decorative icons, which are
   * then hidden from assistive tech.
   */
  label?: string
  className?: string
}

export default function Icon({ name, e, label, className }: IconProps) {
  const src = BY_NAME[name]
  // No bundled PNG yet → fall back to the emoji so nothing renders blank.
  if (!src) return <Emoji e={e} label={label} className={className} />
  return (
    <img
      className={['xp-icon', className].filter(Boolean).join(' ')}
      src={src}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      loading="lazy"
    />
  )
}
