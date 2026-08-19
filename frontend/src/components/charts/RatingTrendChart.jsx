import { useState } from 'react';
import { Trophy, TrendingUp, Info } from 'lucide-react';
import { PLATFORM_META } from '../PlatformIcons';

const PLATFORM_COLORS = {
  leetcode: '#F59E0B',
  codeforces: '#3B82F6',
  codechef: '#EAB308',
  atcoder: '#38BDF8',
  github: '#A855F7'
};

const RatingTrendChart = ({ platforms = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const verified = platforms.filter(p => p.status === 'verified' && p.stats?.rating);

  if (verified.length === 0) {
    return (
      <div className="bg-[#0D1322] rounded-3xl p-6 border border-blue-950/80 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <div className="p-3 bg-slate-900 text-slate-500 rounded-2xl border border-slate-800">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-300">No Rated Platforms Verified Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Link and verify LeetCode, Codeforces, CodeChef, or AtCoder to compare your live contest ratings and peak performances.
        </p>
      </div>
    );
  }

  // Find max rating across platforms for SVG scaling
  const maxVal = Math.max(2000, ...verified.map(p => Math.max(p.stats.rating || 0, p.stats.maxRating || 0)));

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Compute points
  const points = verified.map((p, idx) => {
    const x = paddingX + (idx / Math.max(1, verified.length - 1)) * chartW;
    const currentRating = p.stats.rating || 0;
    const maxRating = p.stats.maxRating || currentRating;
    const yCurrent = paddingY + chartH - (currentRating / maxVal) * chartH;
    const yMax = paddingY + chartH - (maxRating / maxVal) * chartH;

    return {
      platform: p.platform,
      name: PLATFORM_META[p.platform]?.name || p.platform,
      color: PLATFORM_COLORS[p.platform] || '#38BDF8',
      currentRating,
      maxRating,
      x,
      yCurrent,
      yMax
    };
  });

  return (
    <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-7 border border-blue-950/80 shadow-xl flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Rating Comparison & Peaks</h3>
            <span className="p-1 text-slate-500 hover:text-slate-300 transition-colors" title="Compares your active contest ratings and peak ratings across platforms">
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Live contest standing across your verified accounts</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-dashed border-amber-300 inline-block" />
            <span>Peak</span>
          </div>
        </div>
      </div>

      {/* SVG Multi-bar / Line Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[340px]">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + chartH * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Line Connections between platforms */}
          {points.length > 1 && (
            <path
              d={points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.yCurrent}`, '')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Platform Columns & Dots */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
              {/* Vertical guideline */}
              <line
                x1={pt.x}
                y1={paddingY}
                x2={pt.x}
                y2={paddingY + chartH}
                stroke="#334155"
                strokeWidth="1"
                opacity={hoveredPoint?.platform === pt.platform ? 0.8 : 0.2}
              />

              {/* Peak Rating Marker */}
              {pt.maxRating > pt.currentRating && (
                <circle
                  cx={pt.x}
                  cy={pt.yMax}
                  r="4.5"
                  fill="#F59E0B"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
              )}

              {/* Current Rating Dot */}
              <circle
                cx={pt.x}
                cy={pt.yCurrent}
                r={hoveredPoint?.platform === pt.platform ? '7' : '5.5'}
                fill={pt.color}
                stroke="#0F172A"
                strokeWidth="2"
                className="transition-all duration-200"
              />

              {/* Platform Name Label */}
              <text
                x={pt.x}
                y={svgHeight - 8}
                fill={hoveredPoint?.platform === pt.platform ? '#FFFFFF' : '#94A3B8'}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-[#0F172A] border border-blue-800 px-3 py-2 rounded-xl text-xs space-y-1 shadow-xl animate-in fade-in duration-150 pointer-events-none">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredPoint.color }} />
              {hoveredPoint.name}
            </p>
            <p className="text-slate-300">Current Rating: <strong className="text-blue-400 font-mono">{hoveredPoint.currentRating}</strong></p>
            <p className="text-slate-400 text-[11px]">Peak Milestone: <strong className="text-amber-400 font-mono">{hoveredPoint.maxRating}</strong></p>
          </div>
        )}
      </div>

      {/* Metric summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
        {points.map((pt, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{pt.name}</span>
            <span className="text-xs font-bold text-white font-mono">{pt.currentRating}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingTrendChart;
