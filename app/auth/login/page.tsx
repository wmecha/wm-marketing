'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    const res = await fetch('/api/auth/send-magic-link', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.trim().toLowerCase(), next }),
    })

    setSending(false)

    if (!res.ok) {
      setError('Could not send sign-in link. Check your email address and try again.')
      return
    }

    setSent(true)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--wm-bg-primary)', padding: 24,
    }}>
      <div style={{
        background: 'var(--wm-bg-secondary)',
        border: '1px solid var(--wm-border)',
        borderRadius: 10, padding: '48px 40px', width: '100%', maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--wm-text-eyebrow)', marginBottom: 6 }}>
            WM &amp; Co
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--wm-gold)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Marketing Hub
          </div>
          <div style={{ fontSize: 11, color: 'var(--wm-text-muted)', marginTop: 6 }}>
            marketing.wallacemecha.com
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>✉</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--wm-text-primary)', marginBottom: 8 }}>
              Check your email
            </div>
            <div style={{ fontSize: 12, color: 'var(--wm-text-muted)', lineHeight: 1.6 }}>
              A sign-in link has been sent to <strong style={{ color: 'var(--wm-text-secondary)' }}>{email}</strong>.<br />
              Click the link to access Marketing Hub. It expires in 1 hour.
            </div>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              style={{ marginTop: 24, fontSize: 11, color: 'var(--wm-text-faint)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@wallacemecha.com"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--wm-border)',
                borderRadius: 6, color: 'var(--wm-text-primary)',
                fontSize: 14, padding: '10px 14px', width: '100%',
                outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--wm-border-gold-strong)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--wm-border)' }}
            />

            {error && (
              <div style={{
                padding: '10px 14px', background: 'rgba(208,138,133,0.1)',
                border: '1px solid var(--wm-status-error)', borderRadius: 6,
                color: 'var(--wm-status-error)', fontSize: 12,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%', padding: '12px 20px',
                background: sending ? 'var(--wm-bg-card)' : 'var(--wm-gold)',
                border: 'none', borderRadius: 6,
                color: sending ? 'var(--wm-text-muted)' : 'var(--wm-text-on-gold)',
                fontSize: 14, fontWeight: 600, cursor: sending ? 'wait' : 'pointer',
                transition: 'background var(--wm-dur-quick)',
                fontFamily: 'inherit',
              }}
            >
              {sending ? 'Sending link…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: 11, color: 'var(--wm-text-faint)', textAlign: 'center' }}>
          Access restricted to authorised Cognexa team members
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
