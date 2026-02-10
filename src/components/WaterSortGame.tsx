'use client'

import React, { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Plus, RotateCcw, Star, Trophy, Zap } from 'lucide-react'

type Color = string

type Tube = Color[]

type Theme = {
  bg: string
  panel: string
  border: string
  accent: string
}

const THEMES: Record<string, Theme> = {
  cosmic: {
    bg: 'bg-slate-950',
    panel: 'bg-slate-900/60',
    border: 'border-slate-700/50',
    accent: 'border-purple-400',
  },
}

const COLORS: Color[] = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#ef4444', // red
  '#eab308', // yellow
  '#14b8a6', // teal
  '#f472b6', // pink
]

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function isTubeSolved(t: Tube, capacity: number) {
  if (t.length === 0) return true
  if (t.length !== capacity) return false
  return t.every((c) => c === t[0])
}

function isGameWon(tubes: Tube[], capacity: number) {
  return tubes.every((t) => isTubeSolved(t, capacity))
}

function topColor(t: Tube) {
  return t.length ? t[t.length - 1] : null
}

function topRunLength(t: Tube) {
  if (!t.length) return 0
  const c = t[t.length - 1]
  let k = 0
  for (let i = t.length - 1; i >= 0; i--) {
    if (t[i] !== c) break
    k++
  }
  return k
}

function canPour(from: Tube, to: Tube, capacity: number) {
  if (!from.length) return false
  if (to.length >= capacity) return false
  const cFrom = topColor(from)
  const cTo = topColor(to)
  if (!cFrom) return false
  if (!cTo) return true
  return cFrom === cTo
}

function doPour(tubes: Tube[], i: number, j: number, capacity: number) {
  const next = tubes.map((t) => [...t])
  const from = next[i]
  const to = next[j]
  if (!canPour(from, to, capacity)) return null

  const c = from[from.length - 1]
  const run = topRunLength(from)
  const space = capacity - to.length
  const move = clamp(run, 0, space)
  if (move <= 0) return null

  for (let k = 0; k < move; k++) {
    to.push(c)
    from.pop()
  }

  return next
}

function makeLevel(level: number, capacity: number): { tubes: Tube[]; label: string } {
  // Deterministic-ish level generator: more colors as level increases.
  const colorCount = clamp(4 + Math.floor((level - 1) / 2), 4, 8)
  const colors = COLORS.slice(0, colorCount)

  // Build solved state: each color has a full tube.
  const solved: Tube[] = colors.map((c) => Array.from({ length: capacity }, () => c))
  // Add 2 empty tubes (classic water sort)
  solved.push([])
  solved.push([])

  // Shuffle by applying random valid pours from solved state.
  const rng = mulberry32(1337 + level * 999)
  let tubes = solved.map((t) => [...t])

  // Apply many random moves to mix.
  for (let step = 0; step < 800; step++) {
    const a = Math.floor(rng() * tubes.length)
    const b = Math.floor(rng() * tubes.length)
    if (a === b) continue
    const poured = doPour(tubes, a, b, capacity)
    if (poured) tubes = poured
  }

  return { tubes, label: `LEVEL ${level}` }
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function WaterSortGame() {
  const theme = THEMES.cosmic
  const capacity = 4

  const [screen, setScreen] = useState<'menu' | 'play'>('menu')
  const [level, setLevel] = useState(1)
  const [extraTubeUsed, setExtraTubeUsed] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [history, setHistory] = useState<Tube[][]>([])

  const { tubes: initialTubes } = useMemo(() => makeLevel(level, capacity), [level])
  const [tubes, setTubes] = useState<Tube[]>(() => initialTubes)

  // When level changes, reset play state
  const lastLevelRef = useRef(level)
  if (lastLevelRef.current !== level) {
    lastLevelRef.current = level
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // (We intentionally reset state on render when level changes.)
  }

  const won = useMemo(() => isGameWon(tubes, capacity), [tubes])

  function startGame(lvl: number) {
    setLevel(lvl)
    const lvlData = makeLevel(lvl, capacity)
    setTubes(lvlData.tubes)
    setHistory([])
    setSelected(null)
    setExtraTubeUsed(false)
    setScreen('play')
  }

  function pushHistory(prev: Tube[]) {
    setHistory((h) => [...h, prev.map((t) => [...t])])
  }

  function undo() {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setTubes(prev.map((t) => [...t]))
      setSelected(null)
      return h.slice(0, -1)
    })
  }

  function addExtraTube() {
    if (extraTubeUsed) return
    pushHistory(tubes)
    setTubes((t) => [...t.map((x) => [...x]), []])
    setExtraTubeUsed(true)
  }

  function findHint() {
    // Very simple hint: find first valid pour that improves something.
    for (let i = 0; i < tubes.length; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue
        if (!canPour(tubes[i], tubes[j], capacity)) continue
        // prioritize pouring onto same color
        const ontoSame = topColor(tubes[i]) && topColor(tubes[j]) && topColor(tubes[i]) === topColor(tubes[j])
        if (ontoSame) {
          setSelected(i)
          setTimeout(() => {
            handleTubeClick(j)
          }, 150)
          return
        }
      }
    }
    // fallback: any valid move
    for (let i = 0; i < tubes.length; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue
        if (!canPour(tubes[i], tubes[j], capacity)) continue
        setSelected(i)
        setTimeout(() => {
          handleTubeClick(j)
        }, 150)
        return
      }
    }
  }

  function handleTubeClick(idx: number) {
    if (won) return

    if (selected == null) {
      // select if has something
      if (!tubes[idx].length) return
      setSelected(idx)
      return
    }

    if (selected === idx) {
      setSelected(null)
      return
    }

    const poured = doPour(tubes, selected, idx, capacity)
    if (!poured) {
      // switch selection if tapped a non-empty tube
      if (tubes[idx].length) setSelected(idx)
      return
    }

    pushHistory(tubes)
    setTubes(poured)
    setSelected(null)
  }

  if (screen === 'menu') {
    return (
      <div className={`min-h-screen ${theme.bg} text-white flex items-center justify-center p-6`}>
        <div className={`w-full max-w-md ${theme.panel} border ${theme.border} rounded-3xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-300" />
              <div className="font-bold">Cosmic Sort</div>
            </div>
            <div className="text-xs text-white/60">Water-sort puzzle</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => startGame(level)}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition"
            >
              START
            </button>
            <button
              onClick={() => startGame(1)}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/15 transition"
            >
              NEW RUN
            </button>
          </div>

          <div className="mt-6 text-xs text-white/60 leading-relaxed">
            Rules: pour only onto an empty tube or same color. Fill each tube with a single color to win.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg} text-white p-4 pb-24 relative`}>
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => setScreen('menu')} className="text-white/70 hover:text-white flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="font-bold">Daily Wisdom</div>
        <div className="text-white/60 text-xs">{`LEVEL ${level}`}</div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {tubes.map((t, i) => {
            const sel = selected === i
            const solved = isTubeSolved(t, capacity)
            return (
              <button
                key={i}
                onClick={() => handleTubeClick(i)}
                className={`relative h-36 rounded-2xl border-4 ${sel ? theme.accent : 'border-white/20'} ${
                  solved ? 'bg-white/5' : 'bg-white/0'
                } transition`}
                aria-label={`tube-${i}`}
              >
                <div className="absolute inset-2 flex flex-col justify-end gap-1">
                  {Array.from({ length: capacity }).map((_, slot) => {
                    const c = t[slot] || null
                    return (
                      <div
                        key={slot}
                        className="h-5 rounded-md border border-black/30"
                        style={{ background: c || 'rgba(255,255,255,0.06)' }}
                      />
                    )
                  })}
                </div>
              </button>
            )
          })}
        </div>

        {/* Controls */}
        <div className="mt-6 flex gap-2 text-white/80">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`flex-1 flex flex-col items-center justify-center py-4 border-2 border-dashed border-current rounded-2xl ${
              history.length === 0 ? 'opacity-30' : 'hover:bg-white/10 active:opacity-50'
            }`}
          >
            <RotateCcw size={20} className="mb-2" />
            <span className="text-[10px]">UNDO</span>
          </button>

          <button
            onClick={findHint}
            disabled={won}
            className={`flex-1 flex flex-col items-center justify-center py-4 border-2 border-dashed border-current rounded-2xl ${
              won ? 'opacity-30' : 'hover:bg-white/10 active:opacity-50'
            }`}
          >
            <Zap size={20} className="mb-2" />
            <span className="text-[10px]">HINT</span>
          </button>

          <button
            onClick={addExtraTube}
            disabled={extraTubeUsed || won}
            className={`flex-1 flex flex-col items-center justify-center py-4 border-2 border-dashed border-current rounded-2xl ${
              extraTubeUsed || won ? 'opacity-30' : 'hover:bg-white/10 active:opacity-50'
            }`}
          >
            <Plus size={20} className="mb-2" />
            <span className="text-[10px]">ADD</span>
          </button>
        </div>
      </div>

      {/* Win Overlay */}
      {won && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-300 p-6">
          <div
            className={`flex flex-col items-center p-8 border-4 border-white ${theme.accent} shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] max-w-sm text-center rounded-3xl`}
          >
            <div className="relative">
              <Star className="absolute -top-6 -left-8 text-yellow-300 animate-spin" size={32} />
              <Trophy
                size={64}
                className="text-yellow-300 mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] animate-bounce"
              />
              <Star className="absolute -bottom-2 -right-8 text-yellow-300 animate-pulse" size={24} />
            </div>

            <h2 className="text-2xl text-white mb-2 drop-shadow-[2px_2px_0_#000]">VICTORY!</h2>
            <p className="text-white/80 text-xs mb-6">LEVEL {level} COMPLETE</p>

            <button
              onClick={() => startGame(level + 1)}
              className="w-full px-6 py-4 bg-yellow-400 text-black border-4 border-black hover:bg-white hover:translate-y-[-4px] hover:shadow-[0_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              NEXT STAGE <ChevronRight size={20} />
            </button>

            <button onClick={() => setScreen('menu')} className="mt-4 text-xs text-white/80 hover:text-white underline">
              RETURN TO BASE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
