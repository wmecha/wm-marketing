import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string }
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const normalised  = email.trim().toLowerCase()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const resendKey   = process.env.RESEND_API_KEY ?? ''
    const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://marketing.wallacemecha.com'

    if (!serviceKey) { console.error('[marketing/send-magic-link] SUPABASE_SERVICE_ROLE_KEY not set'); return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 }) }
    if (!resendKey)  { console.error('[marketing/send-magic-link] RESEND_API_KEY not set');            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 }) }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalised,
      options: { redirectTo: appUrl },
    })

    if (error) {
      console.error('[marketing/send-magic-link] generateLink error:', error.message)
      return NextResponse.json({ ok: true })
    }

    const otp  = data.properties.email_otp
    const link = `${appUrl}/api/auth/magic?t=${encodeURIComponent(otp)}&e=${encodeURIComponent(normalised)}`

    const resend = new Resend(resendKey)
    const { error: sendError } = await resend.emails.send({
      from:    'WM & Co <wmco@operations.wallacemecha.com>',
      to:      normalised,
      subject: 'Sign in to Marketing Hub',
      html:    magicLinkEmail('Marketing Hub', 'marketing.wallacemecha.com', link),
    })

    if (sendError) console.error('[marketing/send-magic-link] Resend error:', sendError.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[marketing/send-magic-link] unexpected error:', err)
    return NextResponse.json({ error: 'Failed to send sign-in link' }, { status: 500 })
  }
}

function magicLinkEmail(appName: string, appDomain: string, link: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f2ef;color:#1a1a1a;margin:0;padding:0}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.header{background:#080808;padding:24px 32px}
.eyebrow{font-size:10px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:.18em}
.name{font-size:20px;font-weight:700;color:#fff;margin-top:4px;letter-spacing:-.02em}
.sub{font-size:11px;color:#555;margin-top:3px}
.body{padding:32px}
p{font-size:14px;color:#444;line-height:1.7;margin:0 0 24px}
.cta{display:block;width:fit-content;margin:0 auto 24px;background:#C9A84C;color:#000;padding:13px 32px;border-radius:7px;font-size:14px;font-weight:700;text-decoration:none}
.note{font-size:12px;color:#888;text-align:center;margin-bottom:20px}
.fallback{font-size:11px;color:#aaa;word-break:break-all;border-top:1px solid #eee;padding-top:16px}
.footer{background:#080808;padding:14px 32px;font-size:10px;color:#555;text-align:center}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="eyebrow">WM &amp; Co</div>
    <div class="name">${appName}</div>
    <div class="sub">${appDomain}</div>
  </div>
  <div class="body">
    <p>Click the button below to sign in to ${appName}. This link expires in 1 hour and can only be used once.</p>
    <a class="cta" href="${link}">Sign in to ${appName}</a>
    <p class="note">If you did not request this, you can safely ignore this email.</p>
    <div class="fallback">Or paste this link into your browser:<br>${link}</div>
  </div>
  <div class="footer">WM &amp; Co · Cognexa Limited · wmco@operations.wallacemecha.com</div>
</div>
</body></html>`
}
