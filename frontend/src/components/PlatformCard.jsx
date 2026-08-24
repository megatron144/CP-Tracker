import { useState } from 'react';
import { 
  Copy, Check, Trash2, Clock, CheckCircle2, ShieldAlert, 
  ExternalLink, ShieldCheck, Loader2, RotateCw, Award, 
  Trophy, Target, Flame, Calendar, Edit3
} from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';
import { API_BASE_URL, getStoredToken } from '../config/api';

const PlatformCard = ({ platformData, onUnlink, onVerifySuccess, onSyncSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [syncError, setSyncError] = useState('');

  const { platform, handle, status, verificationCode, createdAt, stats } = platformData;
  const meta = PLATFORM_META[platform] || {
    name: platform,
    category: 'Developer Platform',
    bioField: 'Profile Bio'
  };

  const isVerified = status === 'verified';
  const cleanDisplayHandle = (handle || '')
    .replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '')
    .replace(/^https?:\/\/(www\.)?codeforces\.com\/profile\//i, '')
    .replace(/^https?:\/\/(www\.)?codechef\.com\/users\//i, '')
    .replace(/^https?:\/\/(www\.)?atcoder\.jp\/users\//i, '')
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@+/, '')
    .replace(/\/+$/, '');

  const profileLink = meta?.profileUrl ? meta.profileUrl(cleanDisplayHandle) : '#';
  const editLink = meta?.editUrl ? meta.editUrl(cleanDisplayHandle) : '#';

  const handleCopy = async () => {
    if (!verificationCode) return;
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to unlink ${meta.name} (@${cleanDisplayHandle})?`)) {
      setUnlinking(true);
      await onUnlink(platform);
      setUnlinking(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/verify/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || (!data.verified && !data.success)) {
        throw new Error(data.message || 'Verification failed. Make sure the code is saved in your profile bio.');
      }

      if (onVerifySuccess) {
        onVerifySuccess(data.platforms, data.message);
      }
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/sync/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to synchronize platform data');
      }

      if (onSyncSuccess) {
        onSyncSuccess(data.platforms, data.message);
      }
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Never synced';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-[#0D1322] rounded-2xl border border-blue-950/80 hover:border-blue-700/50 shadow-lg hover:shadow-[0_0_25px_rgba(37,99,235,0.15)] transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5 border-b border-blue-950/60 bg-[#0B1120]/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shrink-0 shadow-inner">
              <PlatformIcons platform={platform} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base tracking-wide">{meta.name}</h4>
              </div>
              <a
                href={profileLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline mt-0.5 font-mono group"
                title={`Open @${cleanDisplayHandle} on ${meta.name}`}
              >
                <span>@{cleanDisplayHandle}</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Status Badge */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Verification Code OR Normalized Stats Grid */}
      <div className="p-5 bg-[#090E1A]/80 flex-1 space-y-3.5">
        {!isVerified ? (
          <div className="bg-[#0F172A] p-4 rounded-xl border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Verification Code
              </span>
              <span className="text-[10px] text-blue-400 font-medium">Step 1 of 2</span>
            </div>

            {/* Code Box + Copy */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#090D16] border border-blue-900/60 rounded-lg px-3 py-2 text-center font-mono text-base font-bold tracking-widest text-blue-300 select-all shadow-inner">
                {verificationCode}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shrink-0 cursor-pointer"
                title="Copy verification code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Open Profile/Settings Button */}
            <a
              href={editLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-blue-950/70 hover:bg-blue-900/60 border border-blue-800/60 hover:border-blue-500/60 rounded-lg text-xs font-semibold text-blue-200 hover:text-white transition-all shadow-xs group"
            >
              <span>Open @{cleanDisplayHandle} on {meta.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Guidance Text */}
            <div className="text-[11px] text-slate-400 leading-relaxed bg-[#0B1120] p-2 rounded-lg border border-slate-800/80 space-y-0.5">
              <p>
                👉 Paste code in: <strong className="text-slate-200">{meta.name} {meta.bioField}</strong>
              </p>
              {meta.editGuide && (
                <p className="text-slate-400">
                  📍 <span className="text-blue-300 font-medium">{meta.editGuide}</span>
                </p>
              )}
            </div>

            {/* Verification Error Notice */}
            {verifyError && (
              <div className="p-2.5 bg-red-950/70 border border-red-800/80 rounded-lg text-xs text-red-300 leading-relaxed animate-in fade-in duration-200">
                {verifyError}
              </div>
            )}
          </div>
        ) : platform === 'github' ? (
          /* GITHUB VERIFIED: Repos, Stars, Max Commits/Month, Followers */
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Stat 1: Public Repositories */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Public Repos</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {stats?.extra?.publicRepos !== undefined ? stats.extra.publicRepos : stats?.totalSolved || 0}
                </span>
              </div>

              {/* Stat 2: Total Stars */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Total Stars</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-lg font-extrabold text-amber-300 tracking-tight">
                  ★ {stats?.extra?.totalStars !== undefined ? stats.extra.totalStars : stats?.rating || 0}
                </span>
              </div>

              {/* Stat 3: Max Commits in a Month */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Peak Commits/Mo</span>
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {stats?.extra?.maxMonthlyCommits ? `${stats.extra.maxMonthlyCommits}` : '—'}
                </span>
              </div>

              {/* Stat 4: Followers & Forks */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Followers</span>
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {stats?.extra?.followers !== undefined ? stats.extra.followers : stats?.maxRating || 0}
                </span>
              </div>
            </div>

            {/* Breakdown Pill */}
            <div className="flex items-center justify-between gap-1.5 p-2 bg-[#0B1120] rounded-xl border border-slate-800/80 text-[11px]">
              <span className="text-amber-300 font-semibold">★ {stats?.extra?.totalStars || 0} Stars</span>
              <span className="text-blue-300 font-semibold">🍴 {stats?.extra?.totalForks || 0} Forks</span>
              <span className="text-purple-300 font-semibold">💻 {stats?.extra?.topLanguage || 'Code'}</span>
            </div>

            {syncError && (
              <div className="p-2.5 bg-red-950/70 border border-red-800/80 rounded-lg text-xs text-red-300 leading-relaxed animate-in fade-in duration-200">
                {syncError}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD VERIFIED STATE: Competitive Programming Stats */
          <div className="space-y-3.5">
            {/* Stats Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Stat 1: Rating / Score */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Rating / Score</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-white tracking-tight">
                    {stats?.rating !== null && stats?.rating !== undefined ? stats.rating.toLocaleString() : '—'}
                  </span>
                  {stats?.maxRating && stats.maxRating !== stats.rating && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (max {stats.maxRating})
                    </span>
                  )}
                </div>
              </div>

              {/* Stat 2: Total Solved */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Solved</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {stats?.totalSolved !== null && stats?.totalSolved !== undefined ? stats.totalSolved.toLocaleString() : '0'}
                </span>
              </div>

              {/* Stat 3: Rank / Tier / Badge */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Rank / Tier</span>
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-300 truncate block">
                  {stats?.rank || (stats?.rating ? `${stats.rating} Rated` : 'Active')}
                </span>
              </div>

              {/* Stat 4: Contests Participated */}
              <div className="p-3 bg-[#0F172A] rounded-xl border border-blue-950/70 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Contests</span>
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {stats?.contestsGiven || 0}
                </span>
              </div>
            </div>

            {/* Top 3 Best Contest Finishes Widget for All Coding Platforms */}
            {['leetcode', 'codeforces', 'codechef', 'atcoder'].includes(platform) && (
              <div className="p-2.5 bg-[#0B1120] rounded-xl border border-blue-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Trophy className="w-3.5 h-3.5" />
                    Best Contest Finishes
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  {stats?.extra?.topRanks && stats.extra.topRanks.length > 0 ? (
                    stats.extra.topRanks.slice(0, 3).map((rk, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] truncate flex-1 text-center border ${
                          idx === 0
                            ? 'bg-amber-950/50 text-amber-300 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : idx === 1
                            ? 'bg-slate-800/60 text-slate-200 border-slate-700'
                            : 'bg-orange-950/40 text-orange-300 border-orange-900/50'
                        }`}
                      >
                        {idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : '🥉 '}
                        {rk}
                      </span>
                    ))
                  ) : (
                    <div className="flex items-center justify-between w-full gap-1.5">
                      <span className="px-2 py-1 rounded-lg font-semibold text-[11px] bg-amber-950/40 text-amber-300 border border-amber-900/50 flex-1 text-center">
                        🥇 {stats?.rank || (stats?.rating ? `#${stats.rating}` : 'Top Rank')}
                      </span>
                      {stats?.maxRating && (
                        <span className="px-2 py-1 rounded-lg font-semibold text-[11px] bg-slate-800/60 text-slate-200 border border-slate-700 flex-1 text-center">
                          🥈 Max {stats.maxRating}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-lg font-semibold text-[11px] bg-orange-950/30 text-orange-300 border border-orange-900/40 flex-1 text-center">
                        🥉 Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync Error Notice */}
            {syncError && (
              <div className="p-2.5 bg-red-950/70 border border-red-800/80 rounded-lg text-xs text-red-300 leading-relaxed animate-in fade-in duration-200">
                {syncError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-[#0B1120] border-t border-blue-950/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1">
          {isVerified ? (
            <>
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formatTimeAgo(stats?.lastSynced)}</span>
            </>
          ) : (
            <span>Linked {new Date(createdAt || Date.now()).toLocaleDateString()}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {/* Verified Actions: Sync Now Button */}
          {isVerified && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 hover:border-blue-500 text-blue-300 hover:text-white rounded-lg font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Fetch fresh live statistics from platform"
            >
              <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}

          {/* Pending Actions: Verify Bio Button */}
          {!isVerified && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
              title="Verify that code is in your bio"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Bio</span>
                </>
              )}
            </button>
          )}

          {/* Delete / Unlink Button */}
          <button
            onClick={handleDelete}
            disabled={unlinking}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title={`Unlink ${meta.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformCard;
