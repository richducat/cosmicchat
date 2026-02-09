import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Server-side CoachService proxy.
 * - Keeps OPENAI_API_KEY off the client
 * - Performs tool-calling loop for get_astrology_forecast on the server
 */

type Msg = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: any
  name?: string
  tool_call_id?: string
}

type Body = {
  model?: string
  messages: Msg[]
  // deterministic context needed for the tool
  ctx?: {
    birthYear?: string
    birthMonth?: string
    birthDay?: string
    computedLP?: number
  }
}

const NumerologyEngine = {
  sumDigits: (n: any) => String(n).split('').reduce((a, b) => a + parseInt(b, 10), 0),
  reduceToMaster: (n: any): number => {
    let num = parseInt(n, 10)
    if (num === 11 || num === 22 || num === 33) return num
    if (num < 10) return num
    return NumerologyEngine.reduceToMaster(NumerologyEngine.sumDigits(num))
  },
}

const AstrologyEngine = {
  zodiacSigns: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  getPlanetPos: (jd: number, speed: number, start: number) => {
    let pos = start + speed * jd
    pos = pos % 360
    return pos < 0 ? pos + 360 : pos
  },
  getSign: (deg: number) => AstrologyEngine.zodiacSigns[Math.floor(deg / 30)],
  getZodiacSignSimple: (day: number, month: number) => {
    const cusp = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]
    const beforeCusp = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius']
    const afterCusp = ['Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn']
    const idx = month - 1
    return day < cusp[idx] ? beforeCusp[idx] : afterCusp[idx]
  },
  computeChart: (date: Date) => {
    const time = date.getTime()
    const jd = time / 86400000 + 2440587.5 - 2451545.0
    const positions: Record<string, number> = {
      Sun: AstrologyEngine.getPlanetPos(jd, 0.985647, 280.460),
      Moon: AstrologyEngine.getPlanetPos(jd, 13.176358, 218.316),
      Venus: AstrologyEngine.getPlanetPos(jd, 1.6021, 180.0),
      Mars: AstrologyEngine.getPlanetPos(jd, 0.524, 300.0),
    }
    const formatted: any = {}
    for (const [planet, deg] of Object.entries(positions)) {
      formatted[planet] = { degree: Math.round(deg * 100) / 100, sign: AstrologyEngine.getSign(deg), absolute: deg }
    }
    return formatted
  },
}

async function openaiChatCompletions(apiKey: string, payload: any) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

function tool_get_astrology_forecast(ctx: Body['ctx']) {
  const today = new Date()
  const y = ctx?.birthYear || ''
  const m = ctx?.birthMonth || ''
  const d = ctx?.birthDay || ''

  const dob = new Date(`${y}-${m}-${d}`)
  const natalChart = AstrologyEngine.computeChart(dob)
  const currentChart = AstrologyEngine.computeChart(today)

  const computedLP = Number(ctx?.computedLP ?? 0)

  // Sun sign should be the standard zodiac-by-date (the chart model here is a toy approximation).
  const sunSign = (() => {
    const day = Number(d)
    const month = Number(m)
    if (!day || !month) return natalChart.Sun.sign
    return AstrologyEngine.getZodiacSignSimple(day, month)
  })()

  return {
    user: 'get_astrology_forecast',
    date: today.toDateString(),
    life_path: computedLP,
    sun_sign: sunSign,
    moon_sign: natalChart.Moon.sign,
    current_moon_sign: currentChart.Moon.sign,
    numerology_day: NumerologyEngine.reduceToMaster(
      computedLP + today.getDate() + (today.getMonth() + 1) + today.getFullYear()
    ),
    advice_context: 'Focus on themes of their Life Path and current Moon transit.',
  }
}

async function runLoop(apiKey: string, model: string, messages: any[], ctx: Body['ctx']) {
  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_astrology_forecast',
        description: 'Get real astrological positions.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
  ]

  // Hard guardrails for output formatting: users should never see raw JSX/code unless they explicitly ask.
  const FORMAT_GUARD = {
    role: 'system',
    content:
      "Output rules: Do NOT output code (no JSX/HTML/TS/JS), no stack traces, no config snippets, no pseudo-code. Reply as a mystical coach in normal text with short paragraphs and occasional bullet points. If the user asks for code explicitly, confirm in one sentence and then keep it minimal.",
  }

  // Ensure our guard is always first.
  messages = [FORMAT_GUARD, ...messages]

  // hard cap to avoid infinite loops
  for (let i = 0; i < 6; i++) {
    const { ok, status, json } = await openaiChatCompletions(apiKey, {
      model,
      messages,
      tools,
      tool_choice: 'auto',
    })

    if (!ok) throw new Error(json?.error?.message || `OpenAI error ${status}`)

    const message = json?.choices?.[0]?.message
    if (!message) throw new Error('No message from OpenAI')

    // If no tools, return the content
    if (!message.tool_calls || !Array.isArray(message.tool_calls) || message.tool_calls.length === 0) {
      return message?.content ?? ''
    }

    // append assistant message with tool_calls then tool results
    messages = [...messages, message]
    for (const toolCall of message.tool_calls) {
      const functionName = toolCall?.function?.name
      if (functionName !== 'get_astrology_forecast') {
        messages.push({
          role: 'tool',
          name: functionName,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Unknown tool' }),
        })
        continue
      }

      const result = tool_get_astrology_forecast(ctx)
      messages.push({
        role: 'tool',
        name: functionName,
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      })
    }
  }

  throw new Error('Tool loop exceeded limit')
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY not configured' }, { status: 500 })

  const body = (await req.json().catch(() => ({}))) as Partial<Body>
  const model = body.model || 'gpt-4o'
  const messages = Array.isArray(body.messages) ? body.messages : []
  const ctx = body.ctx || {}

  try {
    const text = await runLoop(apiKey, model, messages, ctx)
    return NextResponse.json({ ok: true, reply: text })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Coach error' }, { status: 502 })
  }
}
