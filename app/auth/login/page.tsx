'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111]">
      <div className="w-full max-w-sm rounded-xl border border-white/[0.07] bg-white/[0.03] p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A84C]">WM & Co</p>
        <h1 className="mt-2 text-xl font-bold">Marketing Hub</h1>
        {sent ? (
          <p className="mt-6 text-sm text-white/60">
            Check <strong>{email}</strong> for a magic link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#C9A84C]/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="rounded-lg bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
