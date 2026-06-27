import { Resend } from 'resend'

const FROM = 'WM & Co Operations <wmco@operations.wallacemecha.com>'

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

function esc(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendMagicLink(params: {
  to: string
  magicLink: string
  appName: string
  appUrl: string
  intro: string
}): Promise<void> {
  const resend = getClient()
  const { to, magicLink, appName, appUrl, intro } = params

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f2ef;color:#1a1a1a;margin:0;padding:0}
  .wrap{max-width:560px;margin:0 auto;background:#fff}
  .header{background:#080808;padding:24px 32px}
  .logo-eyebrow{font-size:10px;font-weight:700;color:#c9a960;text-transform:uppercase;letter-spacing:0.18em}
  .logo-name{font-size:20px;font-weight:700;color:#fff;margin-top:4px;letter-spacing:-0.02em}
  .logo-sub{font-size:11px;color:#555;margin-top:3px}
  .body{padding:32px 32px 28px}
  .intro{font-size:14px;color:#444;line-height:1.7;margin-bottom:28px}
  .cta-wrap{text-align:center;margin-bottom:28px}
  .cta{display:inline-block;background:#c9a960;color:#000;padding:13px 32px;border-radius:7px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.01em}
  .expiry{font-size:12px;color:#888;text-align:center;margin-bottom:24px}
  .fallback{font-size:11px;color:#aaa;word-break:break-all;border-top:1px solid #eee;padding-top:18px;margin-top:4px}
  .footer{background:#080808;padding:14px 32px;font-size:10px;color:#555;text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo-eyebrow">WM &amp; Co</div>
    <div class="logo-name">${esc(appName)}</div>
    <div class="logo-sub">${esc(appUrl)}</div>
  </div>
  <div class="body">
    <p class="intro">${esc(intro)}</p>
    <div class="cta-wrap">
      <a class="cta" href="${magicLink}">Sign in to ${esc(appName)}</a>
    </div>
    <p class="expiry">This link expires in 1 hour and can only be used once.</p>
    <div class="fallback">
      If the button doesn't work, paste this link into your browser:<br>${magicLink}
    </div>
  </div>
  <div class="footer">WM &amp; Co · Cognexa Limited · wmco@operations.wallacemecha.com</div>
</div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from:    FROM,
    to,
    subject: `Sign in to ${appName}`,
    html,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}
