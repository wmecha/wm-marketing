import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

const SECTIONS = [
  { href: '/content',   label: 'Content',   desc: 'Drafts, scheduled posts, published pieces' },
  { href: '/calendar',  label: 'Calendar',  desc: 'Content calendar — daily and weekly view' },
  { href: '/campaigns', label: 'Campaigns', desc: 'Active and planned campaigns' },
  { href: '/crm',       label: 'CRM',       desc: 'Contacts, leads, and deal pipeline' },
  { href: '/episodes',  label: 'Episodes',  desc: 'Podcast and video episode tracker' },
  { href: '/reports',   label: 'Reports',   desc: 'Performance and reach reports' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C9A84C]">
          WM & Co
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Marketing Hub</h1>
        <p className="mt-2 text-sm text-white/45">
          Campaigns, content, calendar, CRM, and reports — all in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-lg border border-white/[0.07] bg-white/[0.03] p-6 transition-colors hover:border-[#C9A84C]/30 hover:bg-white/[0.05]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C] transition-colors group-hover:text-[#C9A84C]">
              {s.label}
            </p>
            <p className="mt-2 text-sm text-white/50">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
          MK-001 scaffold — migration in progress
        </p>
        <p className="mt-2 text-sm text-white/60">
          Content and data are migrating from wallacemecha. Pages marked with a status
          pill are live. Others are coming in MK-002 through MK-007.
        </p>
      </div>
    </div>
  )
}
