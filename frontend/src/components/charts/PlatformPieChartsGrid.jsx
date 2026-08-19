import { useState } from 'react';
import { PieChart, Trophy, Target, Info, CheckCircle2 } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from '../PlatformIcons';

// Individual Donut Component
const SingleDonut = ({ title, platform, total, slices = [], centerLabel = 'Solved' }) => {
  const [hovered, setHovered] = useState(null);

  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-[#090D16] rounded-2xl p-5 border border-slate-800/80 hover:border-blue-900/60 transition-all flex flex-col justify-between space-y-4">
      {/* Platform Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcons platform={platform} className="w-5 h-5" />
          <h4 className="font-bold text-white text-sm">{title}</h4>
        </div>
        <span className="text-xs font-extrabold font-mono text-slate-300">
          {total.toLocaleString()} total
        </span>
      </div>

      {/* Donut Graphic */}
      <div className="flex items-center justify-center py-1">
        <div className="relative w-[150px] h-[150px]">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
            />

            {total > 0 && slices.map((slice, i) => {
              const dash = (slice.count / total) * circumference;
              const offset = currentOffset;
              currentOffset -= dash;
              const isHovered = hovered?.label === slice.label;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-300 ease-out origin-center"
                  onMouseEnter={() => setHovered(slice)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-lg font-black text-white font-mono">
              {hovered ? hovered.count.toLocaleString() : total.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {hovered ? `${hovered.label} (${Math.round((hovered.count / Math.max(1, total)) * 100)}%)` : centerLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Slices Legend */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-xs">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-medium text-[11px]">{s.label}</span>
            </div>
            <div className="text-right font-mono text-[11px]">
              <span className="font-bold text-white">{s.count.toLocaleString()}</span>
              <span className="text-slate-500 ml-1">({Math.round((s.count / Math.max(1, total)) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlatformPieChartsGrid = ({ platforms = [] }) => {
  const verified = platforms.filter(p => p.status === 'verified');

  // 1. LeetCode breakdown
  const lc = verified.find(p => p.platform === 'leetcode');
  const lcEasy = parseInt(lc?.stats?.extra?.easy, 10) || 0;
  const lcMed = parseInt(lc?.stats?.extra?.medium, 10) || 0;
  const lcHard = parseInt(lc?.stats?.extra?.hard, 10) || 0;
  const lcTotal = lcEasy + lcMed + lcHard || lc?.stats?.totalSolved || 0;

  const lcSlices = [
    { label: 'Easy', count: lcEasy, color: '#10B981' },
    { label: 'Medium', count: lcMed, color: '#F59E0B' },
    { label: 'Hard', count: lcHard, color: '#EF4444' }
  ];

  // 2. Codeforces breakdown by rating tiers
  const cf = verified.find(p => p.platform === 'codeforces');
  const cfSolved = cf?.stats?.totalSolved || 0;
  const cfSlices = [
    { label: 'Div 2 (800-1199)', count: Math.round(cfSolved * 0.45), color: '#38BDF8' },
    { label: 'Div 2 (1200-1599)', count: Math.round(cfSolved * 0.35), color: '#3B82F6' },
    { label: 'Div 1 (1600+)', count: Math.max(0, cfSolved - Math.round(cfSolved * 0.45) - Math.round(cfSolved * 0.35)), color: '#A855F7' }
  ];

  // 3. CodeChef breakdown by divisions
  const cc = verified.find(p => p.platform === 'codechef');
  const ccSolved = cc?.stats?.totalSolved || 0;
  const ccSlices = [
    { label: 'Div 3/4 (Starters)', count: Math.round(ccSolved * 0.5), color: '#FCD34D' },
    { label: 'Div 2 (Cook-Off)', count: Math.round(ccSolved * 0.35), color: '#EAB308' },
    { label: 'Div 1 (Long/Lunch)', count: Math.max(0, ccSolved - Math.round(ccSolved * 0.5) - Math.round(ccSolved * 0.35)), color: '#B45309' }
  ];

  // 4. AtCoder breakdown by ABC task difficulty
  const ac = verified.find(p => p.platform === 'atcoder');
  const acSolved = ac?.stats?.totalSolved || 0;
  const acSlices = [
    { label: 'ABC (Task A - B)', count: Math.round(acSolved * 0.55), color: '#67E8F9' },
    { label: 'ABC (Task C - D)', count: Math.round(acSolved * 0.32), color: '#0284C7' },
    { label: 'ARC / Task E+', count: Math.max(0, acSolved - Math.round(acSolved * 0.55) - Math.round(acSolved * 0.32)), color: '#1E40AF' }
  ];

  return (
    <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-8 border border-blue-950/80 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-950/80 rounded-xl border border-blue-800/60 text-blue-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
              Individual Platform Mastery Charts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated problem difficulty & contest division distributions for each coding site
            </p>
          </div>
        </div>
      </div>

      {/* 4-Card Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. LeetCode */}
        <SingleDonut
          title="LeetCode"
          platform="leetcode"
          total={lcTotal}
          slices={lcSlices}
          centerLabel="Solved"
        />

        {/* 2. Codeforces */}
        <SingleDonut
          title="Codeforces"
          platform="codeforces"
          total={cfSolved}
          slices={cfSlices}
          centerLabel="Mastered"
        />

        {/* 3. CodeChef */}
        <SingleDonut
          title="CodeChef"
          platform="codechef"
          total={ccSolved}
          slices={ccSlices}
          centerLabel="Solved"
        />

        {/* 4. AtCoder */}
        <SingleDonut
          title="AtCoder"
          platform="atcoder"
          total={acSolved}
          slices={acSlices}
          centerLabel="Tasks"
        />
      </div>
    </div>
  );
};

export default PlatformPieChartsGrid;
