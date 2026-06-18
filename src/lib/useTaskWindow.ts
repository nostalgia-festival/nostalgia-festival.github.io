import { useState } from 'react'

/**
 * Models a single XP-style window's taskbar lifecycle: open (has a taskbar
 * button), minimized (button stays, window hidden), and visible (open and not
 * minimized — the only state in which the modal actually renders).
 *
 * Lifting this above both <DesktopIcons> (which opens the windows) and
 * <Taskbar> (which lists them as buttons) lets the taskbar button and the
 * window track one shared state, so minimize/restore behaves like real XP.
 */
export interface TaskWindow {
  /** A taskbar button exists for this window. */
  open: boolean
  /** Open but collapsed to the taskbar — button shown, modal hidden. */
  minimized: boolean
  /** Open and not minimized: the modal is on screen and the button is pressed. */
  visible: boolean
  /** Open it (and un-minimize if it was collapsed). */
  show: () => void
  /** Close entirely — removes its taskbar button. */
  close: () => void
  /** Collapse to the taskbar without closing. */
  minimize: () => void
  /** Taskbar-button click: open if closed, else toggle minimize/restore. */
  toggle: () => void
}

export function useTaskWindow(): TaskWindow {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)

  return {
    open,
    minimized,
    visible: open && !minimized,
    show: () => {
      setOpen(true)
      setMinimized(false)
    },
    close: () => {
      setOpen(false)
      setMinimized(false)
    },
    minimize: () => setMinimized(true),
    toggle: () => {
      if (!open) {
        setOpen(true)
        setMinimized(false)
      } else {
        setMinimized((m) => !m)
      }
    },
  }
}
