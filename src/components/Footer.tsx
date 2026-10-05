import { LINKS } from '../content'
import { scrollToTop } from '../lib/motion'
import { ArrowUp } from './Icons'

export function Footer() {
  return (
    <footer className="shell relative">
      <div className="flex flex-col gap-5 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow text-dim">© 2026 Ayush Das</p>
        <ul className="eyebrow flex flex-wrap gap-x-6 gap-y-2 text-muted">
          {[
            ['GitHub', LINKS.github],
            ['LinkedIn', LINKS.linkedin],
            ['Résumé', LINKS.resume],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" className="link-line transition-colors hover:text-fg">
                {label} ↗
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => scrollToTop()}
          className="eyebrow flex items-center gap-2 text-muted transition-colors hover:text-fg"
        >
          Back to top <ArrowUp size={13} />
        </button>
      </div>
    </footer>
  )
}
