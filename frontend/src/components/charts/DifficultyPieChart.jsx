import { useState } from 'react';
import { PieChart as PieIcon, Info } from 'lucide-react';

const DifficultyPieChart = ({ platforms = [] }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Aggregate difficulties from verified platforms (LeetCode + others with breakdown)
  let easy = 0;
  let medium = 0;
  let hard = 0;

  platforms.filter(p => p.status === 'verified').forEach(p => {
    if (p.stats?.extra) {
      easy += parseInt(p.stats.extra.easy, 10) || 0;
      medium += parseInt(p.stats.extra.medium, 10) || 0;
      hard += parseInt(p.stats.extra.hard, 10) || 0;
    }
  });

  const total = easy + medium + hard;

  if (total === 0) {
    return (
      <div className="bg-[#0D1322] rounded-3xl p-6 border border-blue-950/80 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <div className="p-3 bg-slate-900 text-slate-500 rounded-2xl border border-slate-800">
          <PieIcon className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-300">No Difficulty Breakdown Yet</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Verify your LeetCode profile to visualize your Easy, Medium, and Hard problem mastery distribution.
        </p>
      </div>
    );
  }

  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = 100 - easyPct - medPct;

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const easyOffset = 0;
  const easyDash = (easy / total) * circumference;

  const medOffset = -easyDash;
  const medDash = (medium / total) * circumference;

  const hardOffset = -(easyDash + medDash);
  const hardDash = (hard / total) * circumference;

  return (
    <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-7 border border-blue-950/80 shadow-xl flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Difficulty Distribution</h3>
            <span className="p-1 text-slate-500 hover:text-slate-300 transition-colors" title="Aggregated distribution of solved problems by difficulty tier">
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Global mastery breakdown across difficulty tiers</p>
        </div>
      </div>

      {/* Donut and Center Count */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
            />

            {/* Easy Segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${easyDash} ${circumference}`}
              strokeDashoffset={easyOffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onMouseEnter={() => setHoveredSlice({ label: 'Easy', count: easy, pct: easyPct, color: '#10B981' })}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* Medium Segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={`${medDash} ${circumference}`}
              strokeDashoffset={medOffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onMouseEnter={() => setHoveredSlice({ label: 'Medium', count: medium, pct: medPct, color: '#F59E0B' })}
              onMouseLeave={() => setHoveredSlice(null)}
            />

            {/* Hard Segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#EF4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${hardDash} ${circumference}`}
              strokeDashoffset={hardOffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300 hover:opacity-80"
              onMouseEnter={() => setHoveredSlice({ label: 'Hard', count: hard, pct: hardPct, color: '#EF4444' })}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black text-white tracking-tight font-mono">
              {hoveredSlice ? hoveredSlice.count : total.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {hoveredSlice ? `${hoveredSlice.label} (${hoveredSlice.pct}%)` : 'Solved'}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown List */}
        <div className="w-full sm:w-auto space-y-3 text-xs">
          {/* Easy Pill */}
          <div className="p-3 rounded-2xl bg-[#090D16] border border-emerald-950/70 flex items-center justify-between gap-6 hover:border-emerald-700/60 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="font-semibold text-slate-200">Easy</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white font-mono text-sm">{easy.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-mono ml-1.5">({easyPct}%)</span>
            </div>
          </div>

          {/* Medium Pill */}
          <div className="p-3 rounded-2xl bg-[#090D16] border border-amber-950/70 flex items-center justify-between gap-6 hover:border-amber-700/60 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <span className="font-semibold text-slate-200">Medium</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white font-mono text-sm">{medium.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-mono ml-1.5">({medPct}%)</span>
            </div>
          </div>

          {/* Hard Pill */}
          <div className="p-3 rounded-2xl bg-[#090D16] border border-red-950/70 flex items-center justify-between gap-6 hover:border-red-700/60 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              <span className="font-semibold text-slate-200">Hard</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white font-mono text-sm">{hard.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-mono ml-1.5">({hardPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyPieChart;
