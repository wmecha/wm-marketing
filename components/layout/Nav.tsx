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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#111111]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A84C]">
          WM Marketing
        </Link>
        <nav className="flex flex-wrap gap-1">
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
                    : 'text-white/50 hover:text-white/80'
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
