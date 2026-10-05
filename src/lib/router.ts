import { useSyncExternalStore } from 'react'

// Hash routing keeps deep links working on a static host without rewrites.
//   #/work/:id            → case study page
//   #/case-studies[/:id]  → legacy links from the previous site
//   #<section>            → home, scrolled to that section
export type Route = { name: 'home'; section?: string } | { name: 'project'; id: string }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '')
}

export function parseRoute(hash: string): Route {
  const project = hash.match(/^#\/(?:work|case-studies)\/([\w-]+)/)
  if (project) return { name: 'project', id: project[1] }
  if (hash.startsWith('#/case-studies')) return { name: 'home', section: 'work' }
  if (hash.length > 1 && !hash.startsWith('#/')) return { name: 'home', section: hash.slice(1) }
  return { name: 'home' }
}

export const projectHref = (id: string) => `#/work/${id}`
