import { useRef } from 'react'
import Hero from './components/Hero'
import WelcomeWindow from './components/WelcomeWindow'
import DetailsWindow from './components/DetailsWindow'
import WhatsThereWindow from './components/WhatsThereWindow'
import TicketWizard from './components/TicketWizard'
import Taskbar from './components/Taskbar'
import Footer from './components/Footer'

export default function App() {
  const wizardRef = useRef<HTMLDivElement>(null)

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="app">
      <Hero onStartClick={scrollToWizard} />

      <main className="windows-stack">
        <WelcomeWindow />
        <DetailsWindow />
        <WhatsThereWindow />

        <div ref={wizardRef} className="wizard-anchor">
          <TicketWizard />
        </div>

        <Footer />
      </main>

      <Taskbar onStartClick={scrollToWizard} />
    </div>
  )
}
