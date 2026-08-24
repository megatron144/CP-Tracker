import { Target, Info } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from '../PlatformIcons';

const PLATFORM_THEMES = {
  leetcode: { bar: 'bg-amber-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]', text: 'text-amber-400' },
  codeforces: { bar: 'bg-blue-500', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]', text: 'text-blue-400' },
  codechef: { bar: 'bg-yellow-500', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]', text: 'text-yellow-400' },
  atcoder: { bar: 'bg-sky-500', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.3)]', text: 'text-sky-400' },
  gfg: { bar: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]', text: 'text-emerald-400' },
  github: { bar: 'bg-purple-500', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]', text: 'text-purple-400' }
};

const PlatformBreakdownBar = ({ platforms = [] }) => {
  const verified = platforms.filter(p => p.status === 'verified');
  const maxSolved = Math.max(1, ...verified.map(p => p.stats?.totalSolved || 0));
  const totalVolume = verified.reduce((acc, p) => acc + (p.stats?.totalSolved || 0), 0);

  if (verified.length === 0) return null;

  return (
    <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-7 border border-blue-950/80 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Problems Solved Volume</h3>
            <span className="p-1 text-slate-500 hover:text-slate-300 transition-colors" title="Volume comparison of solved problems and repositories per platform">
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Distribution of {totalVolume.toLocaleString()} total solved problems and repositories</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-400">
          <Target className="w-3.5 h-3.5" />
          <span>{totalVolume.toLocaleString()} Total</span>
        </div>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-4 pt-1">
        {verified.map((p, idx) => {
          const solved = p.stats?.totalSolved || 0;
          const pct = Math.round((solved / maxSolved) * 100);
          const meta = PLATFORM_META[p.platform] || { name: p.platform };
          const theme = PLATFORM_THEMES[p.platform] || { bar: 'bg-blue-500', glow: '', text: 'text-blue-400' };

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <PlatformIcons platform={p.platform} className="w-4 h-4" />
                  <span>{meta.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${theme.text}`}>{solved.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({p.platform === 'github' ? 'repos' : 'solved'})
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-3 bg-[#090D16] rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar} ${theme.glow}`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformBreakdownBar;
