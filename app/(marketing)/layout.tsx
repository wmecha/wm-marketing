import type { ReactNode } from 'next'
import Nav from '@/components/layout/Nav'
import { requireUser } from '@/lib/auth'

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  await requireUser()
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-24">
        {children}
      </main>
    </>
  )
}
