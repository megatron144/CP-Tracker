import { useState, useEffect } from 'react';
import { 
  Activity, Flame, TrendingUp, Zap, CheckCircle2, 
  ChevronRight, Calendar, Target
} from 'lucide-react';
import { PlatformIcons } from './PlatformIcons';

// Custom Count-Up Hook that triggers when active
const useCountUp = (endValue, duration = 800, active = true) => {
  const [count, setCount] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return endValue;
    }
    return 0;
  });

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return;

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration, active]);

  return count;
};

// Mock Historical Data for Interactive Graph
const CHART_DATA = [
  { month: "Oct '25", x: 20, lc: 1680, cf: 1420, lcY: 54, cfY: 62 },
  { month: "Nov '25", x: 85, lc: 1790, cf: 1540, lcY: 46, cfY: 52 },
  { month: "Dec '25", x: 150, lc: 1880, cf: 1610, lcY: 38, cfY: 44 },
  { month: "Jan '26", x: 215, lc: 1960, cf: 1720, lcY: 28, cfY: 34 },
  { month: "Now", x: 280, lc: 2150, cf: 1840, lcY: 14, cfY: 22 }
];

const FEATURE_TABS = [
  {
    id: 0,
    badge: 'Peer Benchmarking',
    title: 'Compare & Compete',
    desc: 'Interactive cross-platform telemetry. Benchmark rating trajectories across LeetCode & Codeforces.',
    icon: TrendingUp
  },
  {
    id: 1,
    badge: 'Live Contest Radar',
    title: 'Upcoming Contests & Calendar',
    desc: 'Real-time countdowns and smart reminders for Codeforces, LeetCode, CodeChef, and AtCoder rounds.',
    icon: Calendar
  },
  {
    id: 2,
    badge: 'Skill Mastery Analytics',
    title: 'Problem Insights & Breakdown',
    desc: 'Multi-platform difficulty distribution, topic tag masteries, and daily consistency telemetry.',
    icon: Target
  }
];

export const ProductPreview = ({ isCompact = false }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Panel 1: Graph states
  const [showLeetCode, setShowLeetCode] = useState(true);
  const [showCodeforces, setShowCodeforces] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  // Panel 2: Live Contest countdown ticking
  const [secondsTick, setSecondsTick] = useState(45);

  // Auto cycle timer
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_TABS.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Seconds ticker for countdown live feel
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsTick((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Animated numbers for Panel 1
  const solvedCount = useCountUp(1482, 900, activeSlide === 0);
  const streakCount = useCountUp(42, 700, activeSlide === 0);

  // Animated numbers for Panel 3
  const easyCount = useCountUp(480, 800, activeSlide === 2);
  const mediumCount = useCountUp(742, 900, activeSlide === 2);
  const hardCount = useCountUp(260, 1000, activeSlide === 2);

  // Mobile compact strip (< 1024px)
  if (isCompact) {
    return (
      <div className="w-full bg-[#0D1322]/80 backdrop-blur-md border border-blue-900/40 rounded-2xl p-4 mb-6 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <Activity className="w-5 h-5 text-blue-400 animate-heartbeat" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Live CP Preview</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                  4 Synced
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">LeetCode • Codeforces • CodeChef • AtCoder</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-800/40 text-xs text-blue-200">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>42-day streak</span>
          </div>
        </div>
      </div>
    );
  }

  const currentTab = FEATURE_TABS[activeSlide];
  const IconComponent = currentTab.icon;

  return (
    <div 
      className="h-full flex flex-col justify-between p-8 lg:p-10 text-white select-none relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge & Live Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-xs text-blue-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 animate-pulse"></span>
            </span>
            <span className="font-semibold tracking-wide">Live CP Telemetry Dashboard</span>
          </div>

          {/* Quick Platform Badges */}
          <div className="flex items-center gap-1.5 bg-[#090E1A]/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <PlatformIcons platform="codeforces" className="w-4 h-4" />
            <PlatformIcons platform="leetcode" className="w-4 h-4" />
            <PlatformIcons platform="codechef" className="w-4 h-4" />
            <PlatformIcons platform="atcoder" className="w-4 h-4" />
          </div>
        </div>

        {/* Feature Narrative with smooth slide transition */}
        <div key={activeSlide} className="animate-slide-panel">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <IconComponent className="w-4 h-4 text-blue-400" />
            <span>{currentTab.badge}</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {currentTab.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-lg">
            {currentTab.desc}
          </p>
        </div>
      </div>

      {/* Dynamic Interactive Showcase Panel (Rotates with Carousel) */}
      <div className="my-5 min-h-[350px] flex items-center">
        
        {/* PANEL 1: Compare & Compete with Interactive SVG Chart */}
        {activeSlide === 0 && (
          <div className="w-full bg-[#090E1A]/95 backdrop-blur-md rounded-2xl border border-blue-900/40 p-5 shadow-[0_0_35px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-slide-panel">
            {/* Ambient beam */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* User Profile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                  <Activity className="w-5 h-5 text-white animate-heartbeat" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">alex_coder</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 font-mono">Expert</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Global CP-Score: 1,940 pts</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                  <Zap className="w-3 h-3" />
                  <span>+128 rating</span>
                </div>
                <span className="text-[10px] text-slate-400">Last 30 days</span>
              </div>
            </div>

            {/* Interactive Stat Cards with Count-up & Hover-Lift */}
            <div className="grid grid-cols-3 gap-2.5 my-3.5">
              <div className="bg-[#0D1322] p-2.5 rounded-xl border border-slate-800/90 hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-200 text-center cursor-default">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Solved</span>
                <span className="text-base font-extrabold text-white">{solvedCount.toLocaleString()}</span>
                <span className="text-[9px] text-blue-400 block font-medium">+14 this wk</span>
              </div>

              <div className="bg-[#0D1322] p-2.5 rounded-xl border border-slate-800/90 hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-200 text-center cursor-default">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Streak</span>
                <span className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-0.5">
                  {streakCount} <Flame className="w-3.5 h-3.5 inline fill-amber-500/20" />
                </span>
                <span className="text-[9px] text-emerald-400 block font-medium">Personal Best</span>
              </div>

              <div className="bg-[#0D1322] p-2.5 rounded-xl border border-slate-800/90 hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-200 text-center cursor-default">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Percentile</span>
                <span className="text-base font-extrabold text-indigo-400">Top 4.2%</span>
                <span className="text-[9px] text-slate-400 block font-medium">Rank #842</span>
              </div>
            </div>

            {/* Interactive Rating Chart with Toggleable Series and Hover Tooltip */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  Trajectory (Interactive)
                </span>

                {/* Series Toggle Legend Chips */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLeetCode(!showLeetCode)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
                      showLeetCode
                        ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 opacity-60 line-through'
                    }`}
                    title="Click to toggle LeetCode line"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>LeetCode 2,150</span>
                  </button>

                  <button
                    onClick={() => setShowCodeforces(!showCodeforces)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
                      showCodeforces
                        ? 'bg-blue-950/60 text-blue-300 border-blue-700/60 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 opacity-60 line-through'
                    }`}
                    title="Click to toggle Codeforces line"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>CF 1,840</span>
                  </button>
                </div>
              </div>

              {/* SVG Chart Area */}
              <div 
                className="relative h-24 w-full bg-[#0D1322]/80 rounded-xl p-2 border border-slate-800/80 cursor-crosshair overflow-visible"
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cfGlowP1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lcGlowP1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="10" y1="18" x2="290" y2="18" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="10" y1="40" x2="290" y2="40" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />
                  <line x1="10" y1="62" x2="290" y2="62" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />

                  {/* LeetCode Area & Spline */}
                  {showLeetCode && (
                    <g className="transition-opacity duration-300">
                      <path
                        d="M 20 54 Q 85 46 150 38 T 280 14 L 280 68 L 20 68 Z"
                        fill="url(#lcGlowP1)"
                      />
                      <path
                        d="M 20 54 Q 85 46 150 38 T 280 14"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-draw"
                      />
                      {/* Pulsing Live Endpoint at Now */}
                      <circle cx="280" cy="14" r="7" fill="#F59E0B" opacity="0.3" className="animate-radar" />
                      <circle cx="280" cy="14" r="3.5" fill="#F59E0B" className="animate-pulse" />
                    </g>
                  )}

                  {/* Codeforces Area & Spline */}
                  {showCodeforces && (
                    <g className="transition-opacity duration-300">
                      <path
                        d="M 20 62 Q 85 52 150 44 T 280 22 L 280 68 L 20 68 Z"
                        fill="url(#cfGlowP1)"
                      />
                      <path
                        d="M 20 62 Q 85 52 150 44 T 280 22"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-draw"
                      />
                      {/* Pulsing Live Endpoint at Now */}
                      <circle cx="280" cy="22" r="7" fill="#3B82F6" opacity="0.3" className="animate-radar" />
                      <circle cx="280" cy="22" r="3.5" fill="#3B82F6" className="animate-pulse" />
                    </g>
                  )}

                  {/* Interactive Invisible Hover Triggers along the 5 data points */}
                  {CHART_DATA.map((pt, idx) => (
                    <g key={idx} onMouseEnter={() => setHoveredPointIndex(idx)}>
                      <rect
                        x={pt.x - 20}
                        y={0}
                        width={40}
                        height={70}
                        fill="transparent"
                        className="cursor-pointer"
                      />
                      {/* Active hover crosshair and points */}
                      {hoveredPointIndex === idx && (
                        <>
                          <line
                            x1={pt.x}
                            y1={5}
                            x2={pt.x}
                            y2={65}
                            stroke="#60A5FA"
                            strokeWidth="1.2"
                            strokeDasharray="2 2"
                          />
                          {showLeetCode && (
                            <circle cx={pt.x} cy={pt.lcY} r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                          )}
                          {showCodeforces && (
                            <circle cx={pt.x} cy={pt.cfY} r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                          )}
                        </>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip upon hover */}
                {hoveredPointIndex !== null && (
                  <div 
                    className="absolute -top-3 z-30 transform -translate-x-1/2 bg-[#0F172A] border border-blue-500/50 rounded-lg px-2.5 py-1 shadow-2xl text-[10px] pointer-events-none whitespace-nowrap animate-fade-in-up"
                    style={{ left: `${(CHART_DATA[hoveredPointIndex].x / 300) * 100}%` }}
                  >
                    <div className="font-semibold text-slate-300 border-b border-slate-700/60 pb-0.5 mb-0.5">
                      {CHART_DATA[hoveredPointIndex].month}
                    </div>
                    <div className="flex gap-2 font-mono">
                      {showLeetCode && (
                        <span className="text-amber-400">LC: {CHART_DATA[hoveredPointIndex].lc}</span>
                      )}
                      {showCodeforces && (
                        <span className="text-blue-400">CF: {CHART_DATA[hoveredPointIndex].cf}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline month labels */}
              <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-mono px-2">
                {CHART_DATA.map((pt, idx) => (
                  <span 
                    key={idx} 
                    className={hoveredPointIndex === idx ? 'text-blue-400 font-bold' : idx === CHART_DATA.length - 1 ? 'text-blue-400 font-bold' : ''}
                  >
                    {pt.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: Contest Radar & Live Countdown */}
        {activeSlide === 1 && (
          <div className="w-full bg-[#090E1A]/95 backdrop-blur-md rounded-2xl border border-blue-900/40 p-5 shadow-[0_0_35px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slide-panel">
            {/* Ambient beam */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <Calendar className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Upcoming Global Contests</h4>
                  <span className="text-[11px] text-slate-400">Auto-synced across 4 platforms</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono">
                3 This Week
              </span>
            </div>

            {/* Featured Live Countdown Card */}
            <div className="my-3 bg-gradient-to-r from-blue-950/50 to-indigo-950/40 rounded-xl p-3.5 border border-blue-800/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <PlatformIcons platform="codeforces" className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Codeforces Round 998 (Div. 2)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Starts In
                </span>
              </div>

              {/* Ticking Countdown Boxes */}
              <div className="grid grid-cols-4 gap-2 text-center my-2">
                <div className="bg-[#090D16] p-1.5 rounded-lg border border-slate-800">
                  <span className="text-sm font-extrabold text-white font-mono">14</span>
                  <span className="text-[9px] text-slate-500 block uppercase">Hours</span>
                </div>
                <div className="bg-[#090D16] p-1.5 rounded-lg border border-slate-800">
                  <span className="text-sm font-extrabold text-white font-mono">22</span>
                  <span className="text-[9px] text-slate-500 block uppercase">Mins</span>
                </div>
                <div className="bg-[#090D16] p-1.5 rounded-lg border border-slate-800">
                  <span className="text-sm font-extrabold text-blue-400 font-mono">{secondsTick < 10 ? `0${secondsTick}` : secondsTick}</span>
                  <span className="text-[9px] text-slate-500 block uppercase">Secs</span>
                </div>
                <div className="bg-[#090D16] p-1.5 rounded-lg border border-slate-800">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">2.0h</span>
                  <span className="text-[9px] text-slate-500 block uppercase">Length</span>
                </div>
              </div>
            </div>

            {/* Upcoming Queue List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0D1322] border border-slate-800/80 hover:border-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <PlatformIcons platform="leetcode" className="w-4 h-4" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Weekly Contest 438</span>
                    <span className="text-[10px] text-slate-500">Sunday • 08:00 AM IST</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                  in 2d 18h
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0D1322] border border-slate-800/80 hover:border-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <PlatformIcons platform="atcoder" className="w-4 h-4" />
                  <div>
                    <span className="font-semibold text-slate-200 block">AtCoder Beginner Contest 392</span>
                    <span className="text-[10px] text-slate-500">Saturday • 17:30 PM IST</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/40">
                  in 4d 06h
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: Problem Insights & Difficulty Breakdown */}
        {activeSlide === 2 && (
          <div className="w-full bg-[#090E1A]/95 backdrop-blur-md rounded-2xl border border-blue-900/40 p-5 shadow-[0_0_35px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slide-panel">
            {/* Ambient beam */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Target className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Problem Solving Mastery</h4>
                  <span className="text-[11px] text-slate-400">Unified across all linked platforms</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {easyCount + mediumCount + hardCount} Total
              </span>
            </div>

            {/* Difficulty Breakdown Bars */}
            <div className="my-3.5 space-y-2.5">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Easy (Fundamentals)
                  </span>
                  <span className="font-mono text-slate-300">{easyCount} solved (32%)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700" style={{ width: '32%' }}></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Medium (Interview Standard)
                  </span>
                  <span className="font-mono text-slate-300">{mediumCount} solved (50%)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style={{ width: '50%' }}></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Hard (Competitive Mastery)
                  </span>
                  <span className="font-mono text-slate-300">{hardCount} solved (18%)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>

            {/* Top Algorithmic Topic Badges */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                Top Algorithmic Tags
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/50 text-blue-300 border border-blue-800/40 flex items-center gap-1">
                  <span>Dynamic Prog.</span> <span className="font-mono text-[10px] text-blue-400 font-bold">312</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 flex items-center gap-1">
                  <span>Graphs & Trees</span> <span className="font-mono text-[10px] text-indigo-400 font-bold">240</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                  <span>Greedy & Math</span> <span className="font-mono text-[10px] text-emerald-400 font-bold">198</span>
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Carousel Controls & Indicator Dots */}
      <div className="pt-2 flex items-center justify-between border-t border-blue-900/30">
        <div className="flex items-center gap-2">
          {FEATURE_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveSlide(index)}
              aria-label={`Jump to preview panel ${index + 1}: ${tab.title}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === index 
                  ? 'w-8 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]' 
                  : 'w-2.5 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Auto-cycling 5s</span>
          <button 
            onClick={() => setActiveSlide((prev) => (prev + 1) % FEATURE_TABS.length)}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:brightness-125 font-semibold transition-all cursor-pointer group"
          >
            <span>Next insight</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
