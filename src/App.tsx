import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Nav } from './components/Nav'
import { Home } from './pages/Home'
import { ProjectPage } from './pages/ProjectPage'
import { ScrollTrigger, scrollToTop, startSmoothScroll } from './lib/motion'
import { parseRoute, useHash } from './lib/router'

export default function App() {
  const route = parseRoute(useHash())
  const [active, setActive] = useState<string | null>(null)
  const routeKey = route.name === 'project' ? `project-${route.id}` : 'home'

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    return startSmoothScroll()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only z-[60] rounded-full bg-amber px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Nav active={route.name === 'home' ? active : null} onHome={route.name === 'home'} />

      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          scrollToTop(true)
          ScrollTrigger.refresh()
        }}
      >
        <motion.main
          key={routeKey}
          id="main"
          tabIndex={-1}
          className="outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
        >
          {route.name === 'project' ? (
            <ProjectPage id={route.id} />
          ) : (
            <Home section={route.section} onActiveChange={setActive} />
          )}
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  )
}
