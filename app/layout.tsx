import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'WM Marketing', template: '%s · WM Marketing' },
  description: 'WM & Co Marketing Hub',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111111] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
