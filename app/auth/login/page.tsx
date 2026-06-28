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
    <div className="flex min-h-screen items-center justify-center bg-[#111111]">
      <div className="w-full max-w-sm rounded-xl border border-white/[0.07] bg-white/[0.03] p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A84C]">WM &amp; Co</p>
        <h1 className="mt-2 text-xl font-bold">Marketing Hub</h1>

        {sent ? (
          <div className="mt-6">
            <p className="text-sm text-white/80 font-medium">Check your email</p>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              A sign-in link has been sent to <strong className="text-white/70">{email}</strong>.
              Click the link to access Marketing Hub. It expires in 1 hour.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-5 text-[11px] text-white/30 underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@wallacemecha.com"
              className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#C9A84C]/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-[11px] text-white/25 text-center">
          Access restricted to authorised Cognexa team members
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
