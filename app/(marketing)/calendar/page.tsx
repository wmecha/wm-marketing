import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Calendar' }

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Calendar</h1>
      <p className="mt-2 text-sm text-white/45">
        Migrating from wallacemecha — MK-002
      </p>
    </div>
  )
}
