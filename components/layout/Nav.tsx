'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/content',    label: 'Content' },
  { href: '/calendar',   label: 'Calendar' },
  { href: '/campaigns',  label: 'Campaigns' },
  { href: '/crm',        label: 'CRM' },
  { href: '/episodes',   label: 'Episodes' },
  { href: '/reports',    label: 'Reports' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <header style={{
      position: 'fixed', inset: '0 0 auto 0', zIndex: 50,
      borderBottom: '1px solid var(--wm-border-faint)',
      background: 'rgba(17,17,17,0.92)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', height: 52 }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 1, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--wm-text-eyebrow)' }}>
            WM &amp; Co
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--wm-gold)' }}>
            Marketing Hub
          </span>
        </Link>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1 }}>
          {NAV.map((item) => {
            const active = path === item.href || path.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors',
                  active
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
