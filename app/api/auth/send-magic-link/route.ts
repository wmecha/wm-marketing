import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, next } = await request.json() as { email: string; next?: string }
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const normalised = email.trim().toLowerCase()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://marketing.wallacemecha.com'
    const redirectTo  = `${appUrl}/auth/callback?next=${encodeURIComponent(next ?? '/dashboard')}`

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase.auth.signInWithOtp({
      email: normalised,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) console.error('[marketing/send-magic-link]', error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[marketing/send-magic-link] unexpected error', err)
    return NextResponse.json({ error: 'Failed to send sign-in link' }, { status: 500 })
  }
}
