'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  Sparkles,
  Shield,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  Heart,
  Star,
  Zap,
  ChevronRight,
  Settings,
  Lock,
  ArrowLeft,
  CheckCircle,
  Moon,
  Sun,
  Briefcase,
  Home,
} from 'lucide-react';

/**
 * ==========================================
 * LAYER 1: THE BRAIN (Deterministic Engines)
 * ==========================================
 */

const NumerologyEngine = {
  sumDigits: (n: any) => String(n).split('').reduce((a, b) => a + parseInt(b), 0),

  reduceToMaster: (n: any): any => {
    let num = parseInt(n);
    if (num === 11 || num === 22 || num === 33) return num;
    if (num < 10) return num;
    return NumerologyEngine.reduceToMaster(NumerologyEngine.sumDigits(num));
  },

  calculateLifePath: (year: any, month: any, day: any) => {
    if (!year || !month || !day) return 0;
    const m = NumerologyEngine.reduceToMaster(month);
    const d = NumerologyEngine.reduceToMaster(day);
    const y = NumerologyEngine.reduceToMaster(year);
    const sum = m + d + y;
    return NumerologyEngine.reduceToMaster(sum);
  },

  getPracticalMagic: (lp: any) => {
    const reduced = lp === 11 ? 2 : lp === 22 ? 4 : lp === 33 ? 6 : lp;
    const data: any = {
      1: { lucky: [1, 10, 19], hours: '6AM - 10AM', task: 'Strategy & Initiation', home: 'Decluttering' },
      2: { lucky: [2, 11, 20], hours: '8AM - 12PM', task: 'Collaboration', home: 'Cooking/Hosting' },
      3: { lucky: [3, 12, 21], hours: '1PM - 5PM', task: 'Creative Writing', home: 'Socializing' },
      4: { lucky: [4, 13, 22], hours: '10AM - 2PM', task: 'Spreadsheets/Admin', home: 'Repairs/Gardening' },
      5: { lucky: [5, 14, 23], hours: '3PM - 7PM', task: 'Sales/Networking', home: 'Rearranging Furniture' },
      6: { lucky: [6, 15, 24], hours: '9AM - 1PM', task: 'Team Management', home: 'Family Care' },
      7: { lucky: [7, 16, 25], hours: '8PM - 12AM', task: 'Research/Analysis', home: 'Meditation/Reading' },
      8: { lucky: [8, 17, 26], hours: '11AM - 3PM', task: 'Financial Planning', home: 'Organization' },
      9: { lucky: [9, 18, 27], hours: '4PM - 8PM', task: 'Philanthropy/Art', home: 'Rest/Feng Shui' },
    };
    return data[reduced] || data[1];
  },

  getDayMeaning: (day: any) => {
    const reduced = NumerologyEngine.reduceToMaster(day);
    const meanings: any = {
      1: 'The Originator - New beginnings and leadership.',
      2: 'The Peacemaker - Harmony and intuition.',
      3: 'The Expressive - Social, creative, and joyful.',
      4: 'The Builder - Grounded, practical, and trustworthy.',
      5: 'The Catalyst - Dynamic, adventurous, and adaptable.',
      6: 'The Nurturer - Responsibility and love.',
      7: 'The Analyst - Deep seeking of truth and wisdom.',
      8: 'The Executive - Efficiency and success.',
      9: 'The Humanitarian - Compassionate and wise.',
      11: 'The Illuminator - High intuition and spiritual insight.',
      22: 'The Master Builder - Turning dreams into reality.',
      33: 'The Master Teacher - Selfless service.',
    };
    return meanings[reduced] || 'A day of unique potential.';
  },

  getLifePathDescription: (lp: any) => {
    const map: any = {
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
    };
    return map[lp] || 'The Unique Soul';
  },
};

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

  getChineseSign: (year: any) => AstrologyEngine.chineseZodiac[year % 12],

  getZodiacSignSimple: (day: any, month: any) => {
    const days = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
    let idx = month - 1;
    if (day < days[idx]) {
      idx = idx - 1;
      if (idx < 0) idx = 11;
    }
    return signs[idx];
  },

  getRisingSignEstimate: (sunSign: any, birthHour: any) => {
    if (!birthHour && birthHour !== 0) return null;
    // Rule of thumb: Sun rises ~6am. Ascendant changes every 2 hours.
    // ASC = SunSign + (Hour - 6) / 2
    const sunIdx = AstrologyEngine.zodiacSigns.indexOf(sunSign);
    const hour = parseInt(birthHour.split(':')[0]);
    // Calculate offset signs (each sign is 2 hours)
    let offset = Math.floor((hour - 6) / 2);
    let ascIdx = (sunIdx + offset) % 12;
    if (ascIdx < 0) ascIdx += 12;
    return AstrologyEngine.zodiacSigns[ascIdx];
  },

  getMonthSigns: (month: any) => {
    const pairs: any = {
      1: 'Capricorn or Aquarius',
      2: 'Aquarius or Pisces',
      3: 'Pisces or Aries',
      4: 'Aries or Taurus',
      5: 'Taurus or Gemini',
      6: 'Gemini or Cancer',
      7: 'Cancer or Leo',
      8: 'Leo or Virgo',
      9: 'Virgo or Libra',
      10: 'Libra or Scorpio',
      11: 'Scorpio or Sagittarius',
      12: 'Sagittarius or Capricorn',
    };
    return pairs[month];
  },

  // Full Chart Calculation
  getPlanetPos: (jd: any, speed: any, start: any) => {
    let pos = start + speed * jd;
    pos = pos % 360;
    return pos < 0 ? pos + 360 : pos;
  },

  getSign: (deg: any) => AstrologyEngine.zodiacSigns[Math.floor(deg / 30)],

  computeChart: (date: any) => {
    const time = date.getTime();
    const jd = time / 86400000 + 2440587.5 - 2451545.0;
    const positions: any = {
      Sun: AstrologyEngine.getPlanetPos(jd, 0.985647, 280.46),
      Moon: AstrologyEngine.getPlanetPos(jd, 13.176358, 218.316),
      Venus: AstrologyEngine.getPlanetPos(jd, 1.6021, 180.0),
      Mars: AstrologyEngine.getPlanetPos(jd, 0.524, 300.0),
    };
    const formatted: any = {};
    for (const [planet, deg] of Object.entries(positions)) {
      formatted[planet as any] = { degree: Math.round((deg as any) * 100) / 100, sign: AstrologyEngine.getSign(deg), absolute: deg };
    }
    return formatted;
  },

  getSoulmateTraits: (chart: any) => {
    const vSign = chart.Venus.sign;
    const mSign = chart.Mars.sign;
    return {
      attraction_style: `You love like a ${vSign}.`,
      ideal_partner: `Your Mars in ${mSign} seeks boldness.`,
    };
  },

  getNextPowerDates: (natalChart: any) => {
    const dates: any[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const currentChart = AstrologyEngine.computeChart(d);
      const moonPos = currentChart.Moon.absolute;
      const sunPos = natalChart.Sun.absolute;
      const isTrine = (p1: any, p2: any) => Math.abs(Math.abs(p1 - p2) - 120) < 10;
      if (isTrine(moonPos, sunPos)) dates.push({ date: d.toISOString().split('T')[0], type: 'Confidence Boost' });
    }
    return dates.slice(0, 3);
  },
};

/**
 * ==========================================
 * LAYER 2: CITY DATABASE & SERVICE
 * ==========================================
 */

const MAJOR_CITIES = [
  'New York, USA',
  'London, UK',
  'Tokyo, Japan',
  'Paris, France',
  'Los Angeles, USA',
  'Sydney, Australia',
  'Toronto, Canada',
  'Berlin, Germany',
  'Mumbai, India',
  'Dubai, UAE',
  'Singapore',
  'Hong Kong',
  'Chicago, USA',
  'Miami, USA',
  'Rome, Italy',
  'Madrid, Spain',
  'Moscow, Russia',
  'Sao Paulo, Brazil',
  'Mexico City, Mexico',
  'Cairo, Egypt',
  'Istanbul, Turkey',
  'Bangkok, Thailand',
  'Seoul, South Korea',
  'Shanghai, China',
  'Beijing, China',
  'Buenos Aires, Argentina',
  'Lagos, Nigeria',
  'Johannesburg, South Africa',
  'San Francisco, USA',
  'Seattle, USA',
  'Austin, USA',
  'Denver, USA',
  'Boston, USA',
  'Vancouver, Canada',
  'Montreal, Canada',
  'Melbourne, Australia',
  'Auckland, New Zealand',
  'Dublin, Ireland',
  'Amsterdam, Netherlands',
];

const CoachService = {
  call: async (apiKey: any, messages: any, tools: any, toolCallback: any): Promise<any> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          tools: tools,
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) throw new Error('Service connection failed');
      const data = await response.json();
      const message = data.choices[0].message;

      if (message.tool_calls) {
        const toolMessages = [message];
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          const result = await toolCallback(functionName, args);
          toolMessages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify(result),
          });
        }
        return CoachService.call(apiKey, [...messages, ...toolMessages], tools, toolCallback);
      }

      return message.content;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

/**
 * ==========================================
 * UI COMPONENTS
 * ==========================================
 */

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 ${className}`}> {children} </div>
);

const ChatBubble = ({ children, delay = 0 }: any) => (
  <div
    className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-bl-sm p-4 max-w-[90%] shadow-lg">
      {children}
    </div>
  </div>
);

const InfoTag = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
    <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase tracking-wider mb-1">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <div className="text-white font-medium">{value}</div>
  </div>
);

export default function CosmicChatClient() {
  const [apiKey, setApiKey] = useState('');
  const [view, setView] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  // Derived Onboarding State
  const [dobStep, setDobStep] = useState('month');
  const [computedSign, setComputedSign] = useState('');
  const [computedChinese, setComputedChinese] = useState('');
  const [computedLP, setComputedLP] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('cosmic_access_key');
    const storedProfile = localStorage.getItem('cosmic_profile');

    if (storedKey) setApiKey(storedKey);

    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      // Hydrate state
      setName(p.name);

      if (p.dob) {
        const [y, m, d] = p.dob.split('-');
        setBirthYear(y);
        setBirthMonth(m);
        setBirthDay(d);
        const lp = NumerologyEngine.calculateLifePath(y, m, d);
        setComputedLP(lp);
      }

      if (p.birthTime) setBirthTime(p.birthTime);
      if (p.birthPlace) setBirthPlace(p.birthPlace);

      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveProfile = () => {
    const dob = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    const profile = { name, dob, birthTime, birthPlace };
    localStorage.setItem('cosmic_profile', JSON.stringify(profile));

    // Recalculate Logic to ensure dashboard is ready
    const lp = NumerologyEngine.calculateLifePath(birthYear, birthMonth, birthDay);
    setComputedLP(lp);
    setView('dashboard');
  };

  const handleSaveKey = (key: any) => {
    setApiKey(key);
    localStorage.setItem('cosmic_access_key', key);
  };

  const clearData = () => {
    localStorage.clear();
    setApiKey('');
    setName('');
    setBirthMonth('');
    setBirthDay('');
    setBirthYear('');
    setView('welcome');
    setOnboardingStep(1);
    setDobStep('month');
  };

  // --- BRAIN TOOLS ---
  const executeTool = async (name: any, args: any) => {
    if (name === 'get_astrology_forecast') {
      const today = new Date();
      const dob = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
      const natalChart = AstrologyEngine.computeChart(dob);
      const currentChart = AstrologyEngine.computeChart(today);

      return {
        user: name,
        date: today.toDateString(),
        life_path: computedLP,
        sun_sign: natalChart.Sun.sign,
        moon_sign: natalChart.Moon.sign,
        current_moon_sign: currentChart.Moon.sign,
        numerology_day: NumerologyEngine.reduceToMaster(
          computedLP + today.getDate() + (today.getMonth() + 1) + today.getFullYear()
        ),
        advice_context: 'Focus on themes of their Life Path and current Moon transit.',
      };
    }

    return { error: 'Unknown tool' };
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const newMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = {
        role: 'system',
        content: `You are the Cosmic Coach. USER: ${name}, Life Path ${computedLP}. RULES: Use 'get_astrology_forecast' for data. Tone: Mystical, empowering. No medical/legal advice.`,
      };

      const tools = [
        {
          type: 'function',
          function: {
            name: 'get_astrology_forecast',
            description: 'Get real astrological positions.',
            parameters: { type: 'object', properties: {}, required: [] },
          },
        },
      ];

      const responseText = await CoachService.call(apiKey, [systemPrompt, ...messages, newMsg], tools, executeTool);
      setMessages((prev) => [...prev, { role: 'assistant', content: responseText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The connection to the cosmos was interrupted. Check your Access Key in Settings.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC HANDLERS ---
  const handleMonthSelect = (m: any) => {
    setBirthMonth(m);
    setDobStep('day');
  };

  const handleDaySelect = () => {
    const d = parseInt(birthDay);
    if (isNaN(d) || d < 1 || d > 31) return;
    setComputedSign(AstrologyEngine.getZodiacSignSimple(d, parseInt(birthMonth)));
    setDobStep('year');
  };

  const handleYearSelect = () => {
    const y = parseInt(birthYear);
    if (isNaN(y) || String(y).length !== 4) return;
    setComputedChinese(AstrologyEngine.getChineseSign(y));
    setComputedLP(NumerologyEngine.calculateLifePath(y, parseInt(birthMonth), parseInt(birthDay)));
    setDobStep('confirm');
  };

  const handleCitySearch = (val: any) => {
    setBirthPlace(val);
    if (val.length > 1) {
      const filtered = MAJOR_CITIES.filter((c) => c.toLowerCase().includes(val.toLowerCase()));
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city: any) => {
    setBirthPlace(city);
    setCitySuggestions([]);
  };

  // --- RENDERERS ---
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]" />
        <div className="max-w-md w-full space-y-8 relative z-10 text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-10 h-10 text-purple-300" />
          </div>

          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-indigo-200 to-white">Cosmic Coach</h1>

          <p className="text-slate-400 text-lg leading-relaxed">
            Discover the mathematics of your soul.
            <br />
            <span className="text-purple-400 text-sm font-medium tracking-wide uppercase mt-2 block">
              Astrology • Numerology • Daily Wisdom
            </span>
          </p>

          <button
            onClick={() => setView('onboarding')}
            className="w-full bg-white text-slate-950 hover:bg-purple-50 font-bold py-4 rounded-xl shadow-xl shadow-purple-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Start Your Journey <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6">
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex justify-between text-xs text-slate-500 uppercase tracking-widest mb-2">
            <span>Profile Setup</span>
            <span>Step {onboardingStep}/4</span>
          </div>

          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${(onboardingStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-auto w-full flex flex-col justify-center">
          {onboardingStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">First, what is your name?</h2>
                <p className="text-slate-400">The vibration of your name carries its own unique frequency.</p>
              </div>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name..."
                className="w-full bg-transparent border-b-2 border-slate-700 text-3xl py-2 focus:border-purple-500 outline-none transition-colors placeholder:text-slate-700"
                autoFocus
              />

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <span className="text-purple-400 font-bold">1</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-200 font-medium">Expression Number:</span> Derived from all letters in your full
                    name.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold">2</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-200 font-medium">Soul Urge:</span> Derived from vowels, showing heart's desire.
                  </p>
                </div>
              </div>

              <button
                onClick={() => name && setOnboardingStep(2)}
                disabled={!name}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-6">
              {dobStep === 'month' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <ChatBubble>
                    Hi {name}. To calculate your Life Path, I need your birth date. Let's start with the <strong>Month</strong>.
                  </ChatBubble>

                  <div className="grid grid-cols-3 gap-3">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <button
                        key={m}
                        onClick={() => handleMonthSelect(i + 1)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:border-purple-500 transition-all font-medium"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dobStep === 'day' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <ChatBubble>
                    Awesome. Being born in Month {birthMonth} means you are likely a{' '}
                    <strong>{(AstrologyEngine as any).getMonthSigns(birthMonth)}</strong>. <br />
                    <br />
                    What <strong>Day</strong> were you born?
                  </ChatBubble>

                  <input
                    type="number"
                    placeholder="DD"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-4xl tracking-widest focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                  />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleDaySelect}
                      disabled={!birthDay || (birthDay as any) > 31 || (birthDay as any) < 1}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-all"
                    >
                      Confirm Day
                    </button>
                    <button
                      onClick={() => setDobStep('month')}
                      className="text-slate-500 text-sm hover:text-white mx-auto block"
                    >
                      Change Month
                    </button>
                  </div>
                </div>
              )}

              {dobStep === 'year' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <ChatBubble>
                    A {computedSign}! ✨
                    <br />
                    Your Birth Day ({birthDay}) carries the energy: <br />
                    <span className="italic text-purple-300">"{NumerologyEngine.getDayMeaning(birthDay)}"</span>
                    <br />
                    <br />
                    Finally, what <strong>Year</strong> did you arrive?
                  </ChatBubble>

                  <input
                    type="number"
                    placeholder="YYYY"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-4xl tracking-widest focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                  />

                  <button
                    onClick={handleYearSelect}
                    disabled={!birthYear || String(birthYear).length < 4}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-all"
                  >
                    Confirm Year
                  </button>
                </div>
              )}

              {dobStep === 'confirm' && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl border border-indigo-500/30 text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white">So, you are a...</h2>

                    <div className="py-4 space-y-2">
                      <div className="text-3xl font-light text-purple-300">
                        {computedSign} {computedChinese}
                      </div>
                      <div className="text-lg text-slate-300">
                        Life Path Number{' '}
                        <span className="font-bold text-white bg-purple-600 px-2 py-0.5 rounded ml-1">{computedLP}</span>
                      </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg text-sm text-indigo-200 italic">
                      "{NumerologyEngine.getLifePathDescription(computedLP)}"
                    </div>
                  </div>

                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-semibold transition-all"
                  >
                    Confirm & Continue
                  </button>

                  <button onClick={() => setDobStep('month')} className="text-slate-500 text-sm hover:text-white mx-auto block">
                    Start Over
                  </button>
                </div>
              )}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8">
              <h2 className="text-2xl font-bold text-white">Do you know your birth time?</h2>
              <p className="text-slate-400">
                This determines your <strong>Rising Sign</strong> (your public mask). If unknown, we use Noon.
              </p>

              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl p-4 text-xl outline-none"
              />

              <div className="flex gap-4">
                <button onClick={() => setOnboardingStep(4)} className="flex-1 bg-slate-800 py-4 rounded-xl text-slate-400">
                  Skip
                </button>
                <button onClick={() => setOnboardingStep(4)} className="flex-1 bg-purple-600 py-4 rounded-xl text-white font-bold">
                  Next
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8">
              <h2 className="text-2xl font-bold text-white">Last step: Birth Place</h2>
              <p className="text-slate-400">Start typing your city...</p>

              <div className="relative">
                <div className="flex items-center bg-slate-800 rounded-xl p-4 border border-slate-700 focus-within:border-purple-500 transition-colors">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="e.g. New York, London"
                    value={birthPlace}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    className="bg-transparent w-full text-xl outline-none placeholder:text-slate-600"
                  />
                </div>

                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-20 max-h-60 overflow-y-auto">
                    {citySuggestions.map((city) => (
                      <button
                        key={city}
                        onClick={() => selectCity(city)}
                        className="w-full text-left p-4 hover:bg-purple-600/20 hover:text-purple-200 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={!birthPlace}
                className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold disabled:opacity-50"
              >
                Reveal My Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  if (view === 'dashboard') {
    const dobDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
    const chart: any = AstrologyEngine.computeChart(dobDate);
    const soulmate: any = AstrologyEngine.getSoulmateTraits(chart);
    const powerDates: any = AstrologyEngine.getNextPowerDates(chart);
    const practical: any = NumerologyEngine.getPracticalMagic(computedLP);
    const rising: any = AstrologyEngine.getRisingSignEstimate(chart.Sun.sign, birthTime);
    const chinese: any = AstrologyEngine.getChineseSign(parseInt(birthYear));

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 p-6">
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-950/80 backdrop-blur z-10 py-4 border-b border-slate-800/50">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-purple-400" /> Cosmic Coach
          </h1>
          <button onClick={() => setView('settings')}>
            <Settings className="text-slate-400 hover:text-white" />
          </button>
        </header>

        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-bold text-white mb-2">Hello, {name}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
            <MapPin className="w-3 h-3" /> {birthPlace}
          </div>
        </div>

        {/* SECTION 1: IDENTITY */}
        <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="w-32 h-32" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="h-20 w-20 bg-indigo-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <span className="text-3xl font-bold">{computedLP}</span>
              <span className="text-[10px] uppercase opacity-75">Life Path</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">The {computedChinese}</h3>
              <p className="text-sm text-indigo-200 mt-1">{NumerologyEngine.getLifePathDescription(computedLP)}</p>
            </div>
          </div>
        </Card>

        {/* SECTION 2: PRACTICAL MAGIC (New) */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Practical Magic</h3>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 border-emerald-500/20 bg-emerald-900/10">
            <div className="text-emerald-400 font-bold flex items-center gap-2 text-sm mb-2">
              <Briefcase className="w-4 h-4" /> Peak Work
            </div>
            <div className="text-2xl font-bold text-white">{practical.hours}</div>
            <div className="text-xs text-slate-400 mt-1">Focus: {practical.task}</div>
          </Card>

          <Card className="p-4 border-amber-500/20 bg-amber-900/10">
            <div className="text-amber-400 font-bold flex items-center gap-2 text-sm mb-2">
              <Home className="w-4 h-4" /> Home Flow
            </div>
            <div className="text-white font-medium">{practical.home}</div>
            <div className="text-xs text-slate-400 mt-2">
              Lucky Numbers: <span className="text-amber-200">{practical.lucky.join(', ')}</span>
            </div>
          </Card>
        </div>

        {/* SECTION 3: ASTROLOGY */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Your Blueprint</h3>

        <Card className="bg-slate-900/80 border-slate-800 mb-6">
          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-800 text-center">
            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">Sun</div>
              <div className="font-bold text-purple-300">{chart?.Sun.sign}</div>
              <div className="text-[10px] text-slate-500">Core Self</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">Moon</div>
              <div className="font-bold text-blue-300">{chart?.Moon.sign}</div>
              <div className="text-[10px] text-slate-500">Emotion</div>
            </div>

            <div>
              <div className="text-slate-400 text-xs uppercase mb-1">Rising</div>
              <div className="font-bold text-orange-300">{rising || 'Unknown'}</div>
              <div className="text-[10px] text-slate-500">The Mask</div>
            </div>
          </div>
        </Card>

        {/* SECTION 4: LOVE */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Heart & Soul</h3>

        <Card className="border-pink-500/20 mb-6">
          <div className="flex items-center gap-2 mb-4 text-pink-400 font-medium">
            <Heart className="w-5 h-5" /> Relationship Insights
          </div>
          <div className="space-y-3">
            <InfoTag icon={Heart} label="Love Style" value={soulmate?.attraction_style} />
            <InfoTag icon={Zap} label="Ideal Match" value={soulmate?.ideal_partner} />
          </div>
        </Card>

        <button
          onClick={() => setView('chat')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
        >
          Start Daily Session <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (view === 'chat') {
    return (
      <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
        <header className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between">
          <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white transition-colors">
            Back
          </button>
          <h1 className="font-bold text-purple-300">Daily Wisdom</h1>
          <div className="w-6" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!apiKey && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold">Unlock Daily Coaching</h2>
              <p className="text-slate-400 max-w-xs">
                To begin your personal sessions, please enter your Cosmic Access Key in settings.
              </p>
              <button
                onClick={() => setView('settings')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-colors font-medium"
              >
                Go to Settings
              </button>
            </div>
          )}

          {apiKey && messages.length === 0 && (
            <div className="text-center mt-20 opacity-50">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>The stars are aligned. Ask about your day.</p>
            </div>
          )}

          {apiKey &&
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                  }`}
                >
                  {m.content
                    .split(' ')
                    .map((line: any, idx: any) => (
                      <p key={idx} className={line.startsWith('-') ? 'ml-4' : 'mb-2'}>
                        {line}
                      </p>
                    ))}
                </div>
              </div>
            ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl p-4 flex gap-2 items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {apiKey && (
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="What energy surrounds me today?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-purple-500 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Cosmic Access Key (API)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm font-mono"
              placeholder="sk-..."
            />
            <p className="text-xs text-slate-500 mt-2">Your key connects you to the guidance engine.</p>
          </div>
        </div>

        <button
          onClick={clearData}
          className="w-full flex items-center justify-center gap-2 text-red-400 border border-red-900/30 p-4 rounded-xl hover:bg-red-900/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Wipe All Data & Reset
        </button>
      </div>
    );
  }

  return null;
}
