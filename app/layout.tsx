import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { IBM_Plex_Sans, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['italic', 'normal'],
  variable: '--font-instrument',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'WM Marketing Hub', template: '%s · WM Marketing' },
  description: 'WM & Co Marketing Hub',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
