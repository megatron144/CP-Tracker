import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, Target, Flame, Layers, ExternalLink, ShieldCheck, 
  Share2, Check, ArrowRight, Code2, Globe, Sparkles, Loader2,
  Calendar, Award
} from 'lucide-react';
import ClistRatingGraph from '../components/charts/ClistRatingGraph';
import PlatformPieChartsGrid from '../components/charts/PlatformPieChartsGrid';
import ActivityHeatmap from '../components/charts/ActivityHeatmap';
import { PlatformIcons, PLATFORM_META } from '../components/PlatformIcons';
import { API_BASE_URL } from '../config/api';

const PublicProfile = () => {
  const { username, id } = useParams();
  const targetIdentifier = username || id;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/profile/public/${encodeURIComponent(targetIdentifier)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Developer portfolio not found');
        }

        setProfileData(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (targetIdentifier) {
      fetchPublicProfile();
    }
  }, [targetIdentifier]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading Developer Portfolio...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-3xl inline-block text-red-400">
          <Code2 className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-black text-white">Profile Not Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The developer profile <strong className="text-slate-200">@{targetIdentifier}</strong> does not exist or hasn't verified any platforms yet.
        </p>
        <div className="pt-2">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
          >
            <span>Create Your Own Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { name, verifiedPlatforms = [], createdAt } = profileData;
  const totalSolved = verifiedPlatforms.reduce((acc, p) => acc + (p.stats?.totalSolved || 0), 0);
  const peakRating = verifiedPlatforms.length > 0 
    ? Math.max(0, ...verifiedPlatforms.map(p => p.stats?.maxRating || p.stats?.rating || 0))
    : 0;
  const totalContests = verifiedPlatforms.reduce((acc, p) => acc + (p.stats?.contestsGiven || 0), 0);

  const initial = name ? name.charAt(0).toUpperCase() : 'D';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100 animate-in fade-in duration-300">
      {/* Hero Portfolio Header */}
      <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-8 border border-blue-950/80 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
              {initial}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Developer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-3">
                <span>@{targetIdentifier}</span>
                <span>•</span>
                <span>Joined {new Date(createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
            </button>
          </div>
        </div>

        {/* Unified Quick Metrics */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-950/60">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-blue-950 text-blue-400 rounded-xl border border-blue-900/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Platforms</p>
              <p className="text-xl font-extrabold text-white">{verifiedPlatforms.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900/50">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Solved</p>
              <p className="text-xl font-extrabold text-emerald-400">{totalSolved.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-900/50">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Rating</p>
              <p className="text-xl font-extrabold text-amber-300">{peakRating > 0 ? peakRating.toLocaleString() : '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl border border-purple-900/50">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contests Given</p>
              <p className="text-xl font-extrabold text-purple-300">{totalContests.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Rating Timeline Chart */}
      <ClistRatingGraph platforms={verifiedPlatforms} />

      {/* 2. Individual Platform Mastery Charts */}
      <PlatformPieChartsGrid platforms={verifiedPlatforms} />

      {/* 3. 52-Week Practice Heatmap */}
      <ActivityHeatmap platforms={verifiedPlatforms} />

      {/* 4. Verified Platform Public Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Verified Profiles</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
              {verifiedPlatforms.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Direct public links to profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifiedPlatforms.map((platformData) => {
            const meta = PLATFORM_META[platformData.platform] || { name: platformData.platform };
            const profileLink = meta?.profileUrl ? meta.profileUrl(platformData.handle) : '#';

            return (
              <div 
                key={platformData.platform}
                className="bg-[#0D1322] rounded-2xl border border-blue-950/80 hover:border-blue-700/50 shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                      <PlatformIcons platform={platformData.platform} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{meta.name}</h4>
                      <a
                        href={profileLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        <span>@{platformData.handle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    Verified
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Rating */}
                  <div className="p-2.5 bg-[#090D16] rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Rating</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {platformData.stats?.rating !== null && platformData.stats?.rating !== undefined ? platformData.stats.rating.toLocaleString() : '—'}
                    </span>
                  </div>

                  {/* Solved */}
                  <div className="p-2.5 bg-[#090D16] rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Solved
                    </span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {platformData.stats?.totalSolved || 0}
                    </span>
                  </div>
                </div>

                {/* Best Contest Finishes Pill */}
                {platformData.stats?.extra?.topRanks && platformData.stats.extra.topRanks.length > 0 && (
                  <div className="p-2.5 bg-[#090D16] rounded-xl border border-blue-900/40 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Best Contest Finishes
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {platformData.stats.extra.topRanks.slice(0, 3).map((rk, i) => (
                        <span 
                          key={i} 
                          title={typeof rk === 'object' ? `${rk.contestName || ''} (${rk.date || ''})` : String(rk)}
                          className="px-2 py-0.5 rounded bg-[#0F172A] text-slate-200 border border-slate-700 font-bold flex-1 text-center truncate font-mono text-[10px]"
                        >
                          {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : '🥉 '}
                          {typeof rk === 'object' ? `#${rk.rank}` : rk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Link Button */}
                <a
                  href={profileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-950/40 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-900/50 hover:border-blue-500 transition-all"
                >
                  <span>View Official {meta.name} Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-[#0D1322] to-indigo-950/80 p-8 rounded-3xl border border-blue-900/50 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Powered by CP-Tracker</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">Track & Share Your Competitive Coding Journey</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Unify your ratings, track submission streaks, and build a verified developer portfolio.
        </p>
        <div className="pt-2">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Create Free Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
