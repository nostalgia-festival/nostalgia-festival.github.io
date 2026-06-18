import { useRef, type RefObject } from 'react'
import Background from './components/Background'
import DesktopIcons from './components/DesktopIcons'
import Hero from './components/Hero'
import DetailsWindow from './components/DetailsWindow'
import InfoFolder from './components/InfoFolder'
import TicketWizard from './components/TicketWizard'
import ContactWindow from './components/ContactWindow'
import Taskbar from './components/Taskbar'
import Footer from './components/Footer'

export default function App() {
  const detailsRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const wizardRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="app">
      <Background />

      <DesktopIcons
        onDetails={() => scrollTo(detailsRef)}
        onInfo={() => scrollTo(infoRef)}
        onTickets={() => scrollTo(wizardRef)}
        onContact={() => scrollTo(contactRef)}
      />

      <Hero onStartClick={() => scrollTo(wizardRef)} />

      <main className="windows-stack">
        <div ref={detailsRef} className="scroll-anchor">
          <DetailsWindow />
        </div>

        <div ref={infoRef} className="scroll-anchor">
          <InfoFolder />
        </div>

        <div ref={wizardRef} className="wizard-anchor scroll-anchor">
          <TicketWizard />
        </div>

        <div ref={contactRef} className="scroll-anchor">
          <ContactWindow />
        </div>

        <Footer />
      </main>

      <Taskbar onStartClick={() => scrollTo(wizardRef)} />
    </div>
  )
}
