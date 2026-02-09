import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

type Body = {
  model?: string
  system?: string
  messages?: Msg[]
}

function outText(json: any): string {
  const output = json?.output ?? []
  const parts: string[] = []
  for (const item of output) {
    const content = item?.content || []
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c.text === 'string') parts.push(c.text)
    }
  }
  return parts.join('\n').trim()
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY not configured' }, { status: 500 })

  const body = (await req.json().catch(() => ({}))) as Body
  const model = body.model || 'gpt-4o-mini'
  const system = (body.system || 'You are Cosmic Coach.').slice(0, 2000)
  const messages = Array.isArray(body.messages) ? body.messages : []

  // Keep it small and safe
  const trimmed = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-40)
    .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 6000) }))

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [{ role: 'system', content: system }, ...trimmed],
      max_output_tokens: 600,
    }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: json?.error?.message || 'OpenAI error', detail: json },
      { status: 502 }
    )
  }

  const text = outText(json)
  return NextResponse.json({ ok: true, reply: text, raw: { id: json?.id, model: json?.model } })
}
