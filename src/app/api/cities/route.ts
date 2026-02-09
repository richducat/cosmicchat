import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

type Row = { label: string; st: string; name: string; kind?: string }

type Db = { version: string; count: number; rows: Row[] }

type WorldRow = { label: string; city: string; country: string; countryName: string; admin1?: string; admin1Name?: string; pop?: number }

type WorldDb = { version: string; count: number; rows: WorldRow[] }

let US_CACHE: Db | null = null
let WORLD_CACHE: WorldDb | null = null

function loadUs(): Db {
  if (US_CACHE) return US_CACHE
  const p = path.join(process.cwd(), 'data', 'us_places.json')
  US_CACHE = JSON.parse(fs.readFileSync(p, 'utf8')) as Db
  return US_CACHE
}

function loadWorld(): WorldDb {
  if (WORLD_CACHE) return WORLD_CACHE
  const p = path.join(process.cwd(), 'data', 'world_cities.json')
  WORLD_CACHE = JSON.parse(fs.readFileSync(p, 'utf8')) as WorldDb
  return WORLD_CACHE
}

function findMatches(labels: string[], q: string, limit: number) {
  const out: string[] = []
  for (const s of labels) {
    if (out.length >= limit) break
    if (s.toLowerCase().startsWith(q)) out.push(s)
  }
  if (out.length < limit) {
    for (const s of labels) {
      if (out.length >= limit) break
      const l = s.toLowerCase()
      if (!l.startsWith(q) && l.includes(q)) out.push(s)
    }
  }
  return out
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const qRaw = (url.searchParams.get('q') || '').trim()
  const q = qRaw.toLowerCase()

  if (q.length < 2) return NextResponse.json({ ok: true, q: qRaw, results: [] })

  const us = loadUs()
  const world = loadWorld()

  // Prefer US results first (your onboarding asks for "City, State")
  const usLabels = us.rows.map((r) => r.label)
  const worldLabels = world.rows.map((r) => r.label)

  const usHits = findMatches(usLabels, q, 12)
  const remaining = 12 - usHits.length
  const worldHits = remaining > 0 ? findMatches(worldLabels, q, remaining) : []

  const labels = [...usHits, ...worldHits]
  return NextResponse.json({ ok: true, q: qRaw, results: labels.map((label) => ({ label })) })
}
