import { Plus, ArrowRight } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';

const UnlinkedPlatformCard = ({ platformKey, onConnect }) => {
  const meta = PLATFORM_META[platformKey] || {
    name: platformKey,
    category: 'Platform',
    pitch: 'Connect this platform to supercharge your developer profile.'
  };

  return (
    <div className="group relative bg-[#0D1322]/90 hover:bg-[#111A2E] rounded-2xl border border-dashed border-slate-800 hover:border-blue-500/60 p-5 shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 group-hover:bg-blue-950/80 border border-slate-800 group-hover:border-blue-800/60 rounded-xl transition-all shrink-0">
              <PlatformIcons platform={platformKey} className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all duration-200" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm group-hover:text-blue-400 transition-colors">
                {meta.name}
              </h4>
            </div>
          </div>

          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            Available
          </span>
        </div>

        {/* Alluring pitch message */}
        <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-3">
          {meta.pitch}
        </p>
      </div>

      {/* Connect CTA Button */}
      <button
        onClick={() => onConnect(platformKey)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-950/40 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-900/50 hover:border-blue-500 transition-all shadow-xs group-hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Connect {meta.name}</span>
        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
      </button>
    </div>
  );
};

export default UnlinkedPlatformCard;
