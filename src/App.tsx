import { useRef, useState, type RefObject } from 'react'
import Background from './components/Background'
import DesktopIcons from './components/DesktopIcons'
import Hero from './components/Hero'
import DetailsWindow from './components/DetailsWindow'
import InfoFolder from './components/InfoFolder'
import TicketWizard from './components/TicketWizard'
import ContactWindow from './components/ContactWindow'
import Countdown from './components/Countdown'
import Taskbar, { type TaskButton } from './components/Taskbar'
import Footer from './components/Footer'
import Icon from './components/Icon'
import { MinesweeperGlyph } from './components/Minesweeper'
import { useTaskWindow } from './lib/useTaskWindow'
import { useBackgroundMusic } from './lib/useBackgroundMusic'
import { EVENT, type InfoItem } from './lib/config'

export default function App() {
  const detailsRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const wizardRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // The "real" windows that open over the page: the Recycle Bin, the Minesweeper
  // clone inside it, and the מידע folder's readme popup. Their state lives here
  // so the desktop icons, the windows themselves, and the taskbar buttons all
  // stay in sync.
  const recycle = useTaskWindow()
  const minesweeper = useTaskWindow()
  const info = useTaskWindow()
  // Which readme the מידע folder popup is showing (its content + button label).
  const [infoItem, setInfoItem] = useState<InfoItem | null>(null)

  // Looping background music; the taskbar's volume icon mutes/unmutes it.
  const music = useBackgroundMusic()

  // One taskbar button per open window — pressed (`active`) while it's on screen,
  // raised while minimized. Clicking toggles minimize/restore, like real XP.
  const tasks: TaskButton[] = []
  if (recycle.open) {
    tasks.push({
      id: 'recycle',
      title: 'סל המיחזור',
      icon: <Icon name="recyclebin" e="🗑️" />,
      active: recycle.visible,
      onClick: recycle.toggle,
    })
  }
  if (minesweeper.open) {
    tasks.push({
      id: 'minesweeper',
      title: 'שולה המוקשים',
      icon: <MinesweeperGlyph />,
      active: minesweeper.visible,
      onClick: minesweeper.toggle,
    })
  }
  if (info.open && infoItem) {
    tasks.push({
      id: 'info',
      title: `${infoItem.label} — readme.txt`,
      icon: <Icon name="document" e="📄" />,
      active: info.visible,
      onClick: info.toggle,
    })
  }

  return (
    <div className="app">
      <Background />

      <DesktopIcons
        onDetails={() => scrollTo(detailsRef)}
        onInfo={() => scrollTo(infoRef)}
        onTickets={() => scrollTo(wizardRef)}
        onContact={() => scrollTo(contactRef)}
        recycle={recycle}
        minesweeper={minesweeper}
      />

      <Hero onStartClick={() => scrollTo(wizardRef)} />

      <main className="windows-stack">
        <div ref={detailsRef} className="scroll-anchor">
          <DetailsWindow />
        </div>

        <div ref={infoRef} className="scroll-anchor">
          <InfoFolder
            selected={infoItem}
            onOpen={(item) => {
              setInfoItem(item)
              info.show()
            }}
            window={info}
            onTickets={() => scrollTo(wizardRef)}
            onContact={() => scrollTo(contactRef)}
            onDetails={() => scrollTo(detailsRef)}
          />
        </div>

        <div ref={wizardRef} className="wizard-anchor scroll-anchor">
          <TicketWizard />
        </div>

        <Countdown target={EVENT.startsAtISO} />

        <div ref={contactRef} className="scroll-anchor">
          <ContactWindow />
        </div>

        <Footer />
      </main>

      <Taskbar
        onStartClick={() => scrollTo(wizardRef)}
        tasks={tasks}
        muted={music.muted}
        onToggleMute={music.toggleMute}
      />
    </div>
  )
}
