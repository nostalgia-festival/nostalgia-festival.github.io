import { useEffect, useRef, useState } from 'react'
import musicUrl from '../../Media/Music.mp3'
import introUrl from '../../Media/Windows_XP.mp3'

const INTRO_VOLUME = 0.1
const MUSIC_VOLUME = 0.025
const CROSSFADE_MS = 1000

/**
 * Plays the Windows XP startup sound, then crossfades (1s) into the looping
 * background music. Browsers block autoplay-with-sound until the user interacts
 * with the page, so when the initial play() is rejected we arm one-time gesture
 * listeners and start on the first click/keypress/touch. Returns the muted state
 * and a toggle for the taskbar volume icon. The toggle also kicks off playback if
 * autoplay was blocked and never started, so unmuting always produces sound.
 */
export function useBackgroundMusic() {
  const introRef = useRef<HTMLAudioElement | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const intro = new Audio(introUrl)
    intro.loop = false
    intro.preload = 'auto'
    intro.volume = INTRO_VOLUME
    introRef.current = intro

    const music = new Audio(musicUrl)
    music.loop = false
    music.preload = 'auto'
    music.volume = MUSIC_VOLUME
    musicRef.current = music

    // Guards against React StrictMode's mount/unmount/mount cycle: pausing this
    // instance in cleanup makes its pending play() reject *after* cleanup ran,
    // which would otherwise re-arm the listeners on this orphaned audio and leave
    // a second element playing that the mute toggle can't reach.
    let disposed = false
    let fadeTimer: ReturnType<typeof setInterval> | null = null
    let crossfadeStarted = false

    // Linearly crossfade: fade the intro out and the music in over CROSSFADE_MS,
    // starting MUSIC near silence and ramping to MUSIC_VOLUME.
    const startCrossfade = () => {
      if (disposed || crossfadeStarted) return
      crossfadeStarted = true
      music.volume = 0
      music.play().catch(() => {})
      const startedAt = performance.now()
      fadeTimer = setInterval(() => {
        const t = Math.min(1, (performance.now() - startedAt) / CROSSFADE_MS)
        intro.volume = INTRO_VOLUME * (1 - t)
        music.volume = MUSIC_VOLUME * t
        if (t >= 1) {
          if (fadeTimer) clearInterval(fadeTimer)
          fadeTimer = null
          intro.pause()
        }
      }, 30)
    }

    // Once the intro is within CROSSFADE_MS of its end, begin the crossfade.
    const onTimeUpdate = () => {
      if (!Number.isFinite(intro.duration)) return
      if (intro.duration - intro.currentTime <= CROSSFADE_MS / 1000) startCrossfade()
    }
    intro.addEventListener('timeupdate', onTimeUpdate)
    // Fallback in case timeupdate stops firing before we trigger the crossfade.
    intro.addEventListener('ended', startCrossfade)

    const startOnGesture = () => {
      if (disposed) return
      intro.play().catch(() => {})
    }
    const arm = () => {
      if (disposed) return
      window.addEventListener('pointerdown', startOnGesture, { once: true })
      window.addEventListener('keydown', startOnGesture, { once: true })
      window.addEventListener('touchstart', startOnGesture, { once: true })
    }

    // Try to autoplay the intro immediately; if the browser blocks it, fall back
    // to the first user gesture.
    intro.play().catch(arm)

    return () => {
      disposed = true
      if (fadeTimer) clearInterval(fadeTimer)
      intro.pause()
      music.pause()
      intro.removeEventListener('timeupdate', onTimeUpdate)
      intro.removeEventListener('ended', startCrossfade)
      window.removeEventListener('pointerdown', startOnGesture)
      window.removeEventListener('keydown', startOnGesture)
      window.removeEventListener('touchstart', startOnGesture)
      introRef.current = null
      musicRef.current = null
    }
  }, [])

  const toggleMute = () => {
    const intro = introRef.current
    const music = musicRef.current
    if (!intro || !music) return
    const next = !intro.muted
    intro.muted = next
    music.muted = next
    setMuted(next)
    // If autoplay was blocked and nothing is playing yet, unmuting should start it.
    if (!next && intro.paused && music.paused) intro.play().catch(() => {})
  }

  return { muted, toggleMute }
}
