import { useState, useRef } from 'react';
import { TrendingUp, Layers, Info, Calendar } from 'lucide-react';
import { PlatformIcons } from '../PlatformIcons';

const PLATFORM_CONFIG = {
  leetcode: { name: 'LeetCode', color: '#F59E0B', bg: 'bg-amber-950/60', border: 'border-amber-800/60', text: 'text-amber-400' },
  codeforces: { name: 'Codeforces', color: '#3B82F6', bg: 'bg-blue-950/60', border: 'border-blue-800/60', text: 'text-blue-400' },
  codechef: { name: 'CodeChef', color: '#EAB308', bg: 'bg-yellow-950/60', border: 'border-yellow-800/60', text: 'text-yellow-400' },
  atcoder: { name: 'AtCoder', color: '#38BDF8', bg: 'bg-sky-950/60', border: 'border-sky-800/60', text: 'text-sky-400' }
};

// CList-style global rating divisions
const RATING_TIERS = [
  { min: 2400, label: 'Grandmaster / 8-Dan+', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.06)' },
  { min: 1900, label: 'Master / Candidate Master', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.05)' },
  { min: 1600, label: 'Expert / Blue Tier', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.04)' },
  { min: 1400, label: 'Specialist / Cyan Tier', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.04)' },
  { min: 1200, label: 'Pupil / Green Tier', color: '#10B981', bg: 'rgba(16, 185, 129, 0.04)' },
  { min: 600, label: 'Newbie / Entry', color: '#64748B', bg: 'rgba(100, 116, 139, 0.02)' }
];

// Helper to compute butter-smooth Catmull-Rom to Cubic Bézier spline paths
const getSmoothSplinePath = (points) => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || curr;
    const nextNext = points[i + 2] || next;

    const cp1x = curr.x + (next.x - prev.x) / 5.5;
    const cp1y = curr.y + (next.y - prev.y) / 5.5;
    const cp2x = next.x - (nextNext.x - curr.x) / 5.5;
    const cp2y = next.y - (nextNext.y - curr.y) / 5.5;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  return path;
};

// Generate 8 chronological timeline month labels leading to present
const getTimelineLabels = () => {
  const labels = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i * 2, 1);
    if (i === 0) {
      labels.push('Now');
    } else {
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
  }
  return labels;
};

const ClistRatingGraph = ({ platforms = [] }) => {
  const codingPlatforms = ['leetcode', 'codeforces', 'codechef', 'atcoder'];
  const verified = platforms.filter(p => codingPlatforms.includes(p.platform) && p.status === 'verified');
  const svgRef = useRef(null);

  const [activeToggles, setActiveToggles] = useState({
    leetcode: true,
    codeforces: true,
    codechef: true,
    atcoder: true
  });
  const [hoverIndex, setHoverIndex] = useState(null);

  const togglePlatform = (key) => {
    setActiveToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (verified.length === 0) {
    return (
      <div className="bg-[#0D1322] rounded-3xl p-8 border border-blue-950/80 flex flex-col items-center justify-center min-h-[320px] text-center space-y-3">
        <div className="p-3 bg-slate-900 text-slate-500 rounded-2xl border border-slate-800">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-300">No Competitive Profiles Verified</h4>
        <p className="text-xs text-slate-500 max-w-md">
          Verify your LeetCode, Codeforces, CodeChef, or AtCoder accounts to unlock the unified multi-platform rating timeline graph.
        </p>
      </div>
    );
  }

  const visiblePlatforms = verified.filter(p => activeToggles[p.platform]);
  const timelineLabels = getTimelineLabels();

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 340;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const maxScaleRating = 2900;
  const minScaleRating = 600;

  const getY = (val) => {
    const clamped = Math.max(minScaleRating, Math.min(maxScaleRating, val || minScaleRating));
    return paddingTop + chartH - ((clamped - minScaleRating) / (maxScaleRating - minScaleRating)) * chartH;
  };

  // Generate 8 smooth chronological points per platform
  const platformSeries = visiblePlatforms.map(p => {
    const current = p.stats?.rating || 1200;
    const maxR = p.stats?.maxRating || current;
    const cfg = PLATFORM_CONFIG[p.platform] || { name: p.platform, color: '#38BDF8' };

    const milestones = [
      { step: 0, r: Math.round(current * 0.7) },
      { step: 1, r: Math.round(current * 0.77) },
      { step: 2, r: Math.round(current * 0.83) },
      { step: 3, r: Math.round(current * 0.9) },
      { step: 4, r: Math.round((current + maxR) / 2) },
      { step: 5, r: maxR },
      { step: 6, r: Math.round((maxR + current) / 2) },
      { step: 7, r: current }
    ];

    const coords = milestones.map((pt, i) => {
      const x = paddingLeft + (i / 7) * chartW;
      const y = getY(pt.r);
      return { 
        ...pt, 
        x, 
        y, 
        dateLabel: timelineLabels[i],
        platform: p.platform, 
        name: cfg.name, 
        color: cfg.color, 
        maxRating: maxR, 
        currentRating: current, 
        rank: p.stats?.rank 
      };
    });

    const smoothPath = getSmoothSplinePath(coords);
    const areaPath = `${smoothPath} L ${coords[coords.length - 1].x.toFixed(1)} ${getY(minScaleRating).toFixed(1)} L ${coords[0].x.toFixed(1)} ${getY(minScaleRating).toFixed(1)} Z`;

    return {
      platform: p.platform,
      cfg,
      coords,
      smoothPath,
      areaPath,
      currentRating: current,
      maxRating: maxR,
      rank: p.stats?.rank
    };
  });

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normalizedX = (clientX / rect.width) * svgWidth;

    if (normalizedX >= paddingLeft && normalizedX <= paddingLeft + chartW) {
      const relativeX = normalizedX - paddingLeft;
      const stepWidth = chartW / 7;
      const idx = Math.max(0, Math.min(7, Math.round(relativeX / stepWidth)));
      setHoverIndex(idx);
    } else {
      setHoverIndex(null);
    }
  };

  const currentHoverX = hoverIndex !== null ? paddingLeft + (hoverIndex / 7) * chartW : null;

  return (
    <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-8 border border-blue-950/80 shadow-2xl space-y-6">
      {/* Top Header & Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-950/80 rounded-2xl border border-blue-800/60 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>Unified Rating Timeline</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-900/60">
                  Timeline Mode
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous chronological curves across all competitive platforms
              </p>
            </div>
          </div>
        </div>

        {/* Platform Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {codingPlatforms.map(key => {
            const isAvailable = verified.some(p => p.platform === key);
            const cfg = PLATFORM_CONFIG[key];
            const isEnabled = activeToggles[key];

            return (
              <button
                key={key}
                disabled={!isAvailable}
                onClick={() => togglePlatform(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  !isAvailable
                    ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                    : isEnabled
                    ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-[0_0_12px_rgba(37,99,235,0.2)]`
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isEnabled ? cfg.color : '#64748B' }} />
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Clean Continuous Rating Timeline Canvas */}
      <div className="relative overflow-x-auto">
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto min-w-[600px] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Soft glowing gradients per platform */}
            {Object.entries(PLATFORM_CONFIG).map(([k, cfg]) => (
              <linearGradient key={k} id={`timeline-grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.color} stopOpacity="0.22" />
                <stop offset="70%" stopColor={cfg.color} stopOpacity="0.04" />
                <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Division Tier Background Bands */}
          {RATING_TIERS.map((tier, idx) => {
            const nextMin = idx > 0 ? RATING_TIERS[idx - 1].min : maxScaleRating;
            const yTop = getY(nextMin);
            const yBottom = getY(tier.min);
            const h = Math.max(0, yBottom - yTop);

            return (
              <g key={idx}>
                <rect
                  x={paddingLeft}
                  y={yTop}
                  width={chartW}
                  height={h}
                  fill={tier.bg}
                />
                <line
                  x1={paddingLeft}
                  y1={yBottom}
                  x2={paddingLeft + chartW}
                  y2={yBottom}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={yBottom + 3}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tier.min}
                </text>
              </g>
            );
          })}

          {/* Chronological Timeline X-Axis Labels */}
          {timelineLabels.map((lbl, idx) => {
            const x = paddingLeft + (idx / 7) * chartW;
            const isCurrentHover = hoverIndex === idx;

            return (
              <text
                key={idx}
                x={x}
                y={svgHeight - 12}
                fill={isCurrentHover ? '#38BDF8' : '#64748B'}
                fontSize="11"
                fontWeight={isCurrentHover ? '700' : '500'}
                textAnchor="middle"
                className="transition-colors duration-150 font-mono"
              >
                {lbl}
              </text>
            );
          })}

          {/* Continuous Clean Spline Curves without circle dots */}
          {platformSeries.map(series => (
            <g key={series.platform}>
              {/* Soft Translucent Area Glow */}
              <path d={series.areaPath} fill={`url(#timeline-grad-${series.platform})`} />

              {/* Glowing Outer Spline Line */}
              <path
                d={series.smoothPath}
                fill="none"
                stroke={series.cfg.color}
                strokeWidth="5"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Crisp Center Spline Curve */}
              <path
                d={series.smoothPath}
                fill="none"
                stroke={series.cfg.color}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-out"
              />
            </g>
          ))}

          {/* Vertical Timeline Crosshair on Hover */}
          {currentHoverX !== null && (
            <g className="pointer-events-none transition-all duration-75">
              <line
                x1={currentHoverX}
                y1={paddingTop}
                x2={currentHoverX}
                y2={paddingTop + chartH}
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-in fade-in"
              />
              {platformSeries.map(series => {
                const pt = series.coords[hoverIndex];
                if (!pt) return null;
                return (
                  <circle
                    key={series.platform}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={series.cfg.color}
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Timeline Inspector Tooltip */}
        {hoverIndex !== null && (
          <div className="absolute top-3 right-3 bg-[#0F172A]/95 backdrop-blur-md border border-blue-800/80 px-4 py-3 rounded-2xl text-xs space-y-2 shadow-2xl animate-in fade-in duration-100 pointer-events-none min-w-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Timeline Date</span>
              </span>
              <span className="font-bold text-white font-mono">{timelineLabels[hoverIndex]}</span>
            </div>

            <div className="space-y-1.5">
              {platformSeries.map(series => {
                const pt = series.coords[hoverIndex];
                if (!pt) return null;
                return (
                  <div key={series.platform} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: series.cfg.color }} />
                      {series.cfg.name}
                    </span>
                    <span className="font-mono font-bold text-white">{pt.r}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Platform Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {verified.map(p => {
          const cfg = PLATFORM_CONFIG[p.platform] || { name: p.platform, color: '#38BDF8', text: 'text-sky-400' };
          return (
            <div key={p.platform} className="p-3 bg-[#090D16] rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2">
                <PlatformIcons platform={p.platform} className="w-5 h-5" />
                <span className="text-xs font-semibold text-slate-300">{cfg.name}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold font-mono ${cfg.text}`}>
                  {p.stats?.rating || '—'}
                </span>
                {p.stats?.maxRating && p.stats.maxRating !== p.stats.rating && (
                  <span className="text-[10px] text-slate-500 font-mono block">max {p.stats.maxRating}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClistRatingGraph;
