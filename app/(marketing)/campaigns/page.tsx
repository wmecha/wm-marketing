import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Campaigns' }

export default function CampaignsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Campaigns</h1>
      <p className="mt-2 text-sm text-white/45">
        Migrating from wallacemecha — MK-002
      </p>
    </div>
  )
}
