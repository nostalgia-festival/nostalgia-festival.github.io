import { useRef, type RefObject } from 'react'
import Background from './components/Background'
import DesktopIcons from './components/DesktopIcons'
import Hero from './components/Hero'
import DetailsWindow from './components/DetailsWindow'
import FatesWall from './components/FatesWall'
import TicketWizard from './components/TicketWizard'
import Taskbar from './components/Taskbar'
import Footer from './components/Footer'

export default function App() {
  const detailsRef = useRef<HTMLDivElement>(null)
  const fatesRef = useRef<HTMLDivElement>(null)
  const wizardRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="app">
      <Background />

      <DesktopIcons
        onDetails={() => scrollTo(detailsRef)}
        onFates={() => scrollTo(fatesRef)}
        onTickets={() => scrollTo(wizardRef)}
      />

      <Hero onStartClick={() => scrollTo(wizardRef)} />

      <main className="windows-stack">
        <div ref={detailsRef} className="scroll-anchor">
          <DetailsWindow />
        </div>

        <div ref={fatesRef} className="scroll-anchor">
          <FatesWall />
        </div>

        <div ref={wizardRef} className="wizard-anchor scroll-anchor">
          <TicketWizard />
        </div>

        <Footer />
      </main>

      <Taskbar onStartClick={() => scrollTo(wizardRef)} />
    </div>
  )
}
