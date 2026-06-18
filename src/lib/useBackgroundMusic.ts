import { useEffect, useRef, useState } from 'react'
import musicUrl from '../../Media/Music.mp3'

/**
 * Plays the site's background music on load and loops it. Browsers block
 * autoplay-with-sound until the user interacts with the page, so when the
 * initial play() is rejected we arm one-time gesture listeners and start on the
 * first click/keypress/touch. Returns the muted state and a toggle for the
 * taskbar volume icon. The toggle also kicks off playback if autoplay was
 * blocked and never started, so unmuting always produces sound.
 */
export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = new Audio(musicUrl)
    audio.loop = false
    audio.preload = 'auto'
    audio.volume = 0.025
    audioRef.current = audio

    // Guards against React StrictMode's mount/unmount/mount cycle: pausing this
    // instance in cleanup makes its pending play() reject *after* cleanup ran,
    // which would otherwise re-arm the listeners on this orphaned audio and leave
    // a second element playing that the mute toggle can't reach.
    let disposed = false

    const startOnGesture = () => {
      if (disposed) return
      audio.play().catch(() => {})
    }
    const arm = () => {
      if (disposed) return
      window.addEventListener('pointerdown', startOnGesture, { once: true })
      window.addEventListener('keydown', startOnGesture, { once: true })
      window.addEventListener('touchstart', startOnGesture, { once: true })
    }

    // Try to autoplay immediately; if the browser blocks it, fall back to the
    // first user gesture.
    audio.play().catch(arm)

    return () => {
      disposed = true
      audio.pause()
      window.removeEventListener('pointerdown', startOnGesture)
      window.removeEventListener('keydown', startOnGesture)
      window.removeEventListener('touchstart', startOnGesture)
      audioRef.current = null
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
    // If autoplay was blocked and nothing is playing yet, unmuting should start it.
    if (!audio.muted && audio.paused) audio.play().catch(() => {})
  }

  return { muted, toggleMute }
}
