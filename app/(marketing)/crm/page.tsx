import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'CRM' }

export default function CrmPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">CRM</h1>
      <p className="mt-2 text-sm text-white/45">
        Migrating from wallacemecha — MK-002
      </p>
    </div>
  )
}
