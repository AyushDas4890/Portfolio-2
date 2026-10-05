import type { MouseEvent, ReactNode } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight } from './Icons'

type Variant = 'primary' | 'ghost' | 'ink' | 'ghost-ink'
type IconKind = 'arrow' | 'external' | 'down' | 'none'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-amber text-ink hover:bg-amber-soft',
  ghost: 'text-fg ring-1 ring-inset ring-white/15 hover:bg-white/[0.06] hover:ring-white/30',
  ink: 'bg-ink text-cream hover:bg-black',
  'ghost-ink': 'text-ink ring-1 ring-inset ring-ink/20 hover:bg-ink/[0.06] hover:ring-ink/40',
}

const ICONS = { arrow: ArrowRight, external: ArrowUpRight, down: ArrowDown }

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  variant?: Variant
  icon?: IconKind
  external?: boolean
  download?: boolean
  size?: 'md' | 'sm'
  className?: string
  ariaLabel?: string
}

/**
 * Pill button/link. The icon swaps out on hover — the old one leaves along
 * its direction while a copy slides in behind it.
 */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  icon = 'arrow',
  external,
  download,
  size = 'md',
  className = '',
  ariaLabel,
}: ButtonProps) {
  const Icon = icon === 'none' ? null : ICONS[icon]
  const shift =
    icon === 'external'
      ? 'group-hover:translate-x-[130%] group-hover:-translate-y-[130%]'
      : icon === 'down'
        ? 'group-hover:translate-y-[130%]'
        : 'group-hover:translate-x-[130%]'
  const enter =
    icon === 'external'
      ? '-translate-x-[130%] translate-y-[130%]'
      : icon === 'down'
        ? '-translate-y-[130%]'
        : '-translate-x-[130%]'

  const classes = [
    'group relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.97]',
    size === 'md' ? 'h-12 px-6 text-[15px]' : 'h-10 px-4 text-[14px]',
    VARIANTS[variant],
    className,
  ].join(' ')

  const content = (
    <>
      <span>{children}</span>
      {Icon && (
        <span className="relative -mr-1 inline-flex h-4 w-4 overflow-hidden">
          <Icon size={16} className={`absolute inset-0 transition-transform duration-500 ease-out-expo ${shift}`} />
          <Icon
            size={16}
            className={`absolute inset-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0 ${enter}`}
          />
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
        download={download || undefined}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={classes} aria-label={ariaLabel}>
      {content}
    </button>
  )
}
