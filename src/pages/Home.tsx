import { useEffect } from 'react'
import { Showreel } from '../components/Showreel'
import { About } from '../sections/About'
import { Capabilities } from '../sections/Capabilities'
import { Contact } from '../sections/Contact'
import { Credentials } from '../sections/Credentials'
import { Experience } from '../sections/Experience'
import { Hero } from '../sections/Hero'
import { Stack } from '../sections/Stack'
import { Work } from '../sections/Work'
import { useActiveSection } from '../lib/hooks'
import { ScrollTrigger, scrollToId } from '../lib/motion'

// Sections that aren't in the nav light up the nav item they belong to.
const NAV_OF: Record<string, string> = {
  about: 'about',
  capabilities: 'about',
  stack: 'about',
  work: 'work',
  experience: 'experience',
  credentials: 'credentials',
  contact: 'contact',
}
const OBSERVED = Object.keys(NAV_OF)

export function Home({ section, onActiveChange }: { section?: string; onActiveChange: (id: string | null) => void }) {
  const active = useActiveSection(OBSERVED)

  useEffect(() => {
    onActiveChange(active ? NAV_OF[active] : null)
  }, [active, onActiveChange])

  // Arriving with a section in the URL (a shared link, or Back from a case
  // study): jump there once the page has laid out. Mount-only on purpose —
  // in-page navigation scrolls by itself.
  useEffect(() => {
    if (!section) return
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      scrollToId(section, true)
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Hero />
      <Showreel />
      <About />
      <Capabilities />
      <Stack />
      <Work />
      <Experience />
      <Credentials />
      <Contact />
    </>
  )
}
