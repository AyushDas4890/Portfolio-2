import { useEffect } from 'react'
import { initMotion, runIntro, ScrollTrigger } from './lib/motion.js'
import About from './sections/About.jsx'
import RingCanvas from './three/RingCanvas.jsx'
import Preloader from './sections/Preloader.jsx'
import Nav from './sections/Nav.jsx'
import Hero from './sections/Hero.jsx'
import Work from './sections/Work.jsx'
import CaseBands from './sections/CaseBands.jsx'
import Experience from './sections/Experience.jsx'
import Credentials from './sections/Credentials.jsx'
import Contact from './sections/Contact.jsx'

export default function App() {
  useEffect(() => {
    const destroy = initMotion()
    // fonts shift metrics → recalc trigger positions once loaded
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return destroy
  }, [])

  return (
    <>
      <Preloader onDone={runIntro} />
      <RingCanvas />
      <div className="vignette" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <CaseBands />
        <Experience />
        <Credentials />
        <Contact />
      </main>
    </>
  )
}
