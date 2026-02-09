import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

type Row = { label: string; st: string; name: string; kind?: string }

type Db = { version: string; count: number; rows: Row[] }

let CACHE: Db | null = null

function loadDb(): Db {
  if (CACHE) return CACHE
  const p = path.join(process.cwd(), 'data', 'us_places.json')
  const raw = fs.readFileSync(p, 'utf8')
  CACHE = JSON.parse(raw) as Db
  return CACHE
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const qRaw = (url.searchParams.get('q') || '').trim()
  const q = qRaw.toLowerCase()

  if (q.length < 2) return NextResponse.json({ ok: true, q: qRaw, results: [] })

  const db = loadDb()

  // Prefix match first, then contains. Keep it fast.
  const results: Row[] = []

  for (const r of db.rows) {
    if (results.length >= 12) break
    if (r.label.toLowerCase().startsWith(q)) results.push(r)
  }

  if (results.length < 12) {
    for (const r of db.rows) {
      if (results.length >= 12) break
      const l = r.label.toLowerCase()
      if (!l.startsWith(q) && l.includes(q)) results.push(r)
    }
  }

  return NextResponse.json({ ok: true, q: qRaw, results })
}
