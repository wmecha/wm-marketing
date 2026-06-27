import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ ok: true, app: 'wm-marketing', ts: new Date().toISOString() })
}
