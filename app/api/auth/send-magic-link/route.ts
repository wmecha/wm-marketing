import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMagicLink } from '@/lib/email'

// ── How this will evolve ──────────────────────────────────────────────────────
// Current (phase 1): generateLink returns the URL → we send via Resend SDK.
// Target (phase 2):  Once SMTP_PASS is set in Supabase (Resend key), replace
//                    generateLink + sendMagicLink with signInWithOtp() and
//                    Supabase delivers the branded email itself — no SDK needed.
// The branded template is already live in Supabase (set 2026-06-28).
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { email, next } = await request.json() as { email: string; next?: string }
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const normalised = email.trim().toLowerCase()

    // Domain restriction — silently no-op to avoid email enumeration
    if (!normalised.endsWith('@wallacemecha.com')) {
      return NextResponse.json({ ok: true })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://marketing.wallacemecha.com'

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next ?? '/dashboard')}`

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalised,
      options: { redirectTo },
    })

    if (error) {
      console.error('[send-magic-link]', error.message)
      return NextResponse.json({ ok: true }) // don't leak error details
    }

    await sendMagicLink({
      to:        normalised,
      magicLink: data.properties.action_link,
      appName:   'Marketing Hub',
      appUrl:    'marketing.wallacemecha.com',
      intro:     'You requested a sign-in link for WM & Co Marketing Hub. Click the button below to access your marketing dashboard. If you did not request this, you can safely ignore this email.',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-magic-link] unexpected error', err)
    return NextResponse.json({ error: 'Failed to send sign-in link' }, { status: 500 })
  }
}
