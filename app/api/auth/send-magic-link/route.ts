import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, next } = await request.json() as { email: string; next?: string }
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://marketing.wallacemecha.com'

    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

    const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next ?? '/dashboard')}`

    // Domain restriction — only @wallacemecha.com may sign in
    if (!email.trim().toLowerCase().endsWith('@wallacemecha.com')) {
      // Return ok:true intentionally to avoid email enumeration
      return NextResponse.json({ ok: true })
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.trim().toLowerCase(),
      options: { redirectTo },
    })

    if (error) {
      console.error('[send-magic-link]', error.message)
      return NextResponse.json({ ok: true })
    }

    await sendMagicLink({
      to:        email.trim().toLowerCase(),
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
