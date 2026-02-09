'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Send,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Heart,
  Zap,
  Star,
  Trash2,
  Briefcase,
  Home,
} from 'lucide-react'

// Ported from the original Vite SPA into a Next.js client component.
// Server-side OpenAI calls are handled by /api/chat (see src/app/api/chat/route.ts)

// =========================
// LAYER 1: THE BRAIN
// =========================

const NumerologyEngine = {
  sumDigits: (n: any) =>
    String(n)
      .split('')
      .reduce((a, b) => a + Number.parseInt(b, 10), 0),

  reduceToMaster: (n: any): number => {
    let num = Number.parseInt(n, 10)
    if ([11, 22, 33].includes(num)) return num
    if (num < 10) return num
    return NumerologyEngine.reduceToMaster(NumerologyEngine.sumDigits(num))
  },

  calculateLifePath: (year: any, month: any, day: any): number => {
    if (!year || !month || !day) return 0
    const m = NumerologyEngine.reduceToMaster(month)
    const d = NumerologyEngine.reduceToMaster(day)
    const y = NumerologyEngine.reduceToMaster(year)
    return NumerologyEngine.reduceToMaster(m + d + y)
  },

  getPracticalMagic: (lp: number) => {
    const reduced = lp === 11 ? 2 : lp === 22 ? 4 : lp === 33 ? 6 : lp
    const data: Record<number, any> = {
      1: { lucky: [1, 10, 19], hours: '6AM - 10AM', task: 'Strategy & Initiation', home: 'Decluttering' },
      2: { lucky: [2, 11, 20], hours: '8AM - 12PM', task: 'Collaboration', home: 'Cooking/Hosting' },
      3: { lucky: [3, 12, 21], hours: '1PM - 5PM', task: 'Creative Writing', home: 'Socializing' },
      4: { lucky: [4, 13, 22], hours: '10AM - 2PM', task: 'Spreadsheets/Admin', home: 'Repairs/Gardening' },
      5: { lucky: [5, 14, 23], hours: '3PM - 7PM', task: 'Sales/Networking', home: 'Rearranging Furniture' },
      6: { lucky: [6, 15, 24], hours: '9AM - 1PM', task: 'Team Management', home: 'Family Care' },
      7: { lucky: [7, 16, 25], hours: '8PM - 12AM', task: 'Research/Analysis', home: 'Meditation/Reading' },
      8: { lucky: [8, 17, 26], hours: '11AM - 3PM', task: 'Financial Planning', home: 'Organization' },
      9: { lucky: [9, 18, 27], hours: '4PM - 8PM', task: 'Philanthropy/Art', home: 'Rest/Feng Shui' },
    }
    return data[reduced] || data[1]
  },

  getDayMeaning: (day: any) => {
    const reduced = NumerologyEngine.reduceToMaster(day)
    const meanings: Record<number, string> = {
      1: 'The Originator — new beginnings and leadership.',
      2: 'The Peacemaker — harmony and intuition.',
      3: 'The Expressive — social, creative, and joyful.',
      4: 'The Builder — grounded, practical, and trustworthy.',
      5: 'The Catalyst — dynamic, adventurous, and adaptable.',
      6: 'The Nurturer — responsibility and love.',
      7: 'The Analyst — deep seeking of truth and wisdom.',
      8: 'The Executive — efficiency and success.',
      9: 'The Humanitarian — compassionate and wise.',
      11: 'The Illuminator — high intuition and spiritual insight.',
      22: 'The Master Builder — turning dreams into reality.',
      33: 'The Master Teacher — selfless service.',
    }
    return meanings[reduced] || 'A day of unique potential.'
  },

  getLifePathDescription: (lp: number) => {
    const map: Record<number, string> = {
      1: 'The Leader. You are here to master independence.',
      2: 'The Diplomat. You are here to master cooperation.',
      3: 'The Communicator. You are here to master self-expression.',
      4: 'The Teacher. You are here to master stability.',
      5: 'The Freedom Seeker. You are here to master change.',
      6: 'The Healer. You are here to master responsibility.',
      7: 'The Seeker. You are here to master spiritual truth.',
      8: 'The Powerhouse. You are here to master abundance.',
      9: 'The Humanist. You are here to master letting go.',
      11: 'The Intuitive. You are a lightning rod for spiritual information.',
      22: 'The Visionary. You build foundations for the future.',
      33: 'The Guide. You uplift humanity through love.',
    }
    return map[lp] || 'The Unique Soul.'
  },
}

const AstrologyEngine = {
  zodiacSigns: [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ],
  chineseZodiac: ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'],

  getChineseSign: (year: any) => AstrologyEngine.chineseZodiac[Number(year) % 12],

  getZodiacSignSimple: (day: any, month: any) => {
    const d = Number(day)
    const m = Number(month)
    const days = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]
    const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius']
    let idx = m - 1
    if (d < days[idx]) {
      idx -= 1
      if (idx < 0) idx = 11
    }
    return signs[idx]
  },
}

// =========================
// UI PRIMITIVES
// =========================

function clampText(s: any, n = 5000) {
  const str = typeof s === 'string' ? s : String(s ?? '')
  return str.length > n ? str.slice(0, n) : str
}

const UserBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full flex justify-end mb-4">
    <div className="bg-purple-600 text-white rounded-2xl rounded-br-sm p-4 max-w-[90%] shadow-lg">{children}</div>
  </div>
)

const BotBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full flex justify-start mb-4">
    <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-bl-sm p-4 max-w-[90%] shadow-lg">{children}</div>
  </div>
)

const InfoTag = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
    <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase tracking-wider mb-1">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <div className="text-white font-medium">{value}</div>
  </div>
)

// =========================
// APP
// =========================

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

export default function CosmicChatClient() {
  const [view, setView] = useState<'welcome' | 'onboarding' | 'dashboard' | 'chat'>('welcome')
  const [onboardingStep, setOnboardingStep] = useState(1)

  // Profile
  const [name, setName] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])

  const [dobStep, setDobStep] = useState<'month' | 'day' | 'year'>('month')
  const [computedSign, setComputedSign] = useState('')
  const [computedChinese, setComputedChinese] = useState('')
  const [computedLP, setComputedLP] = useState(0)

  // Chat
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('cosmic_profile')
      if (storedProfile) {
        const p = JSON.parse(storedProfile)
        setName(p.name || '')
        if (p.dob) {
          const [y, m, d] = String(p.dob).split('-')
          setBirthYear(y)
          setBirthMonth(m)
          setBirthDay(d)
          setComputedLP(NumerologyEngine.calculateLifePath(y, Number(m), Number(d)))
          setComputedSign(AstrologyEngine.getZodiacSignSimple(Number(d), Number(m)))
          setComputedChinese(AstrologyEngine.getChineseSign(Number(y)))
        }
        setBirthTime(p.birthTime || '')
        setBirthPlace(p.birthPlace || '')
        setView('dashboard')
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const today = useMemo(() => new Date(), [])
  const todayDay = today.getDate()
  const dayMeaning = useMemo(() => NumerologyEngine.getDayMeaning(todayDay), [todayDay])

  const practical = useMemo(() => NumerologyEngine.getPracticalMagic(computedLP || 1), [computedLP])

  function saveProfile() {
    const dob = birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth}-${birthDay}` : ''
    const p = { name, dob, birthTime, birthPlace }
    localStorage.setItem('cosmic_profile', JSON.stringify(p))
  }

  function resetProfile() {
    localStorage.removeItem('cosmic_profile')
    setName('')
    setBirthMonth('')
    setBirthDay('')
    setBirthYear('')
    setBirthTime('')
    setBirthPlace('')
    setComputedSign('')
    setComputedChinese('')
    setComputedLP(0)
    setMessages([])
    setView('welcome')
    setOnboardingStep(1)
    setDobStep('month')
  }

  const updateCitySuggestions = (query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return setCitySuggestions([])
    const cities = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
      'Miami, FL',
      'Atlanta, GA',
      'Boston, MA',
      'Seattle, WA',
      'Austin, TX',
    ]

    const filtered = cities.filter((c) => c.toLowerCase().includes(q))
    setCitySuggestions(filtered.slice(0, 12))
  }

  const selectCity = (city: string) => {
    setBirthPlace(city)
    setCitySuggestions([])
  }

  async function sendMessage() {
    if (!input.trim()) return

    const newMsg: Msg = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, newMsg])
    setInput('')

    setIsLoading(true)
    try {
      const systemPrompt = `You are the Cosmic Coach. USER: ${name || 'Friend'}, Life Path ${computedLP || 'unknown'}.
Tone: mystical, empowering. No medical/legal advice.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          system: systemPrompt,
          messages: [...messages, newMsg],
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) throw new Error(data?.error || `LLM proxy error ${res.status}`)

      const reply = data.reply || '…'
      setMessages((prev) => [...prev, { role: 'assistant', content: clampText(reply, 8000) }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The connection to the cosmos was interrupted. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // -------- Views --------

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.12),transparent_70%)]" />
        <div className="max-w-md w-full space-y-8 relative z-10 text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.35)]">
            <Sparkles className="w-10 h-10 text-purple-300" />
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-white">
            Cosmic Coach
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Discover the mathematics of your soul.
            <br />
            <span className="text-purple-400 text-sm font-medium tracking-wide uppercase mt-2 block">
              Astrology • Numerology • Daily Wisdom
            </span>
          </p>
          <button
            onClick={() => setView('onboarding')}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 hover:-translate-y-0.5"
          >
            Begin Your Journey
          </button>
          <p className="text-xs text-slate-500">Your data stays on your device. Chat runs via a secure server proxy.</p>
        </div>
      </div>
    )
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setView('welcome')}
              className="text-slate-400 hover:text-white transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-slate-500 text-sm">Step {onboardingStep} / 3</div>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">What should I call you?</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                disabled={!name.trim()}
                onClick={() => setOnboardingStep(2)}
                className="w-full py-3 rounded-2xl font-semibold bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-purple-500 transition"
              >
                Continue <ChevronRight className="inline w-4 h-4" />
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Your birth date</h2>
              <p className="text-slate-400">We use it for numerology + a simple zodiac sign.</p>

              <div className="grid grid-cols-3 gap-3">
                <input
                  value={birthMonth}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setBirthMonth(v)
                    setDobStep('day')
                  }}
                  placeholder="MM"
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  value={birthDay}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setBirthDay(v)
                    setDobStep('year')
                  }}
                  placeholder="DD"
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  value={birthYear}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setBirthYear(v)
                  }}
                  placeholder="YYYY"
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <button
                onClick={() => {
                  const lp = NumerologyEngine.calculateLifePath(birthYear, birthMonth, birthDay)
                  setComputedLP(lp)
                  setComputedSign(AstrologyEngine.getZodiacSignSimple(birthDay, birthMonth))
                  setComputedChinese(AstrologyEngine.getChineseSign(birthYear))
                  setOnboardingStep(3)
                }}
                disabled={!birthMonth || !birthDay || birthYear.length !== 4}
                className="w-full py-3 rounded-2xl font-semibold bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-purple-500 transition"
              >
                Continue <ChevronRight className="inline w-4 h-4" />
              </button>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Your cosmic profile</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoTag icon={Star} label="Life Path" value={computedLP || '—'} />
                <InfoTag icon={Zap} label="Zodiac" value={computedSign || '—'} />
                <InfoTag icon={Heart} label="Chinese" value={computedChinese || '—'} />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-slate-400">Birth time (optional)</label>
                <input
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  placeholder="e.g., 07:30"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
                />

                <label className="text-sm text-slate-400">Birth place (optional)</label>
                <div className="relative">
                  <input
                    value={birthPlace}
                    onChange={(e) => {
                      setBirthPlace(e.target.value)
                      updateCitySuggestions(e.target.value)
                    }}
                    placeholder="City, State"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {citySuggestions.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      {citySuggestions.map((c) => (
                        <button
                          key={c}
                          onClick={() => selectCity(c)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  saveProfile()
                  setView('dashboard')
                }}
                className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg"
              >
                Finish <CheckCircle className="inline w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 ring-1 ring-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Welcome, {name || 'friend'}</h1>
                <p className="text-slate-400 text-sm">{dayMeaning}</p>
              </div>
            </div>
            <button
              onClick={() => resetProfile()}
              className="text-slate-400 hover:text-white transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Reset
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoTag icon={Star} label="Life Path" value={computedLP || '—'} />
            <InfoTag icon={Zap} label="Best Hours" value={practical.hours} />
            <InfoTag icon={Home} label="Home Task" value={practical.home} />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-2">Today’s Practical Magic</h2>
            <p className="text-slate-300">Focus: {practical.task}</p>
            <p className="text-slate-400 text-sm mt-2">Lucky numbers: {practical.lucky.join(', ')}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView('chat')}
              className="flex-1 py-4 rounded-2xl font-semibold bg-purple-600 hover:bg-purple-500 transition"
            >
              Open Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Chat view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between">
        <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4" /> {computedSign || '—'} • LP {computedLP || '—'}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <BotBubble>
              <div className="space-y-2">
                <div className="font-semibold">Ask me anything.</div>
                <div className="text-slate-300 text-sm">Try: “What should I focus on today?”</div>
              </div>
            </BotBubble>
          )}

          {messages.map((m, idx) =>
            m.role === 'user' ? (
              <UserBubble key={idx}>{m.content}</UserBubble>
            ) : (
              <BotBubble key={idx}>{m.content}</BotBubble>
            )
          )}

          {isLoading && (
            <BotBubble>
              <div className="text-slate-300">Listening to the cosmos…</div>
            </BotBubble>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isLoading) void sendMessage()
              }
            }}
            placeholder="Type your message…"
            className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            disabled={isLoading || !input.trim()}
            onClick={() => void sendMessage()}
            className="px-4 py-3 rounded-2xl bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-purple-500 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
