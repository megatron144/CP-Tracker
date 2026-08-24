import { useState } from 'react';
import { 
  Copy, Check, Trash2, Clock, CheckCircle2, ShieldAlert, 
  ExternalLink, Loader2, RotateCw, 
  Trophy, Target, Flame, Calendar, Code2, FileCode, Info
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
  const [activeMethod, setActiveMethod] = useState(platformData?.verificationMethod || 'auto');

  const { platform, handle, status, verificationCode, stats } = platformData;
  const meta = PLATFORM_META[platform] || {
    name: platform,
    category: 'Developer Platform',
    bioField: 'Profile Bio'
  };

  const isVerified = status === 'verified';
  const isUnverified = status === 'unverified';
  const isPending = status === 'pending';

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

  const handleCopy = async (textToCopy) => {
    const text = textToCopy || verificationCode;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to unlink ${meta.name} (@${cleanDisplayHandle})?`)) {
      setUnlinking(true);
      await onUnlink(platform);
      setUnlinking(false);
    }
  };

  const handleVerify = async (methodOverride) => {
    setVerifying(true);
    setVerifyError('');
    const method = methodOverride || (activeMethod === 'auto' ? meta.primaryMethod : activeMethod);

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/verify/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });

      const data = await res.json();
      if (!res.ok || (!data.verified && !data.success)) {
        throw new Error(data.message || 'Verification token not found yet.');
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

  const currentMethod = activeMethod === 'auto' ? (meta.primaryMethod || 'bio') : activeMethod;

  return (
    <div className="bg-[#0D1322] rounded-2xl border border-blue-950/80 hover:border-blue-700/50 shadow-lg hover:shadow-[0_0_25px_rgba(37,99,235,0.15)] transition-all duration-200 overflow-hidden flex flex-col justify-between select-none">
      
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : isUnverified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono" title="Self-reported for personal tracking">
              <ShieldAlert className="w-3.5 h-3.5" />
              Unverified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Verification Steps OR Stats Grid */}
      <div className="p-5 bg-[#090E1A]/80 flex-1 space-y-3.5">
        
        {/* PENDING VERIFICATION STATE */}
        {isPending && (
          <div className="bg-[#0F172A] p-4 rounded-xl border border-blue-900/40 space-y-3">
            
            {/* Method switch tabs - only for platforms supporting both submission and bio (Codeforces & AtCoder) */}
            {['codeforces', 'atcoder'].includes(platform) && (
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                <span className="font-semibold text-slate-400">Method:</span>
                <div className="flex items-center gap-1 bg-[#090E1A] p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setActiveMethod('submission')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      currentMethod === 'submission' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Submission
                  </button>
                  <button
                    onClick={() => setActiveMethod('bio')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      currentMethod === 'bio' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Profile Code
                  </button>
                </div>
              </div>
            )}

            {/* Submission guide */}
            {currentMethod === 'submission' && meta.problemTarget ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-blue-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Submit comment on {meta.problemTarget.name}:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#090D16] border border-blue-900/60 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-blue-300 truncate">
                    // {verificationCode}
                  </div>
                  <button
                    onClick={() => handleCopy(`// ${verificationCode}\n#include <iostream>\nint main() { return 0; }`)}
                    className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-blue-500/40 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Direct link to specific problem */}
                <a
                  href={meta.problemTarget.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600/30 hover:bg-blue-600 border border-blue-500/50 hover:border-blue-400 rounded-xl text-xs font-semibold text-blue-200 hover:text-white transition-all shadow-xs group cursor-pointer"
                >
                  <span>Submit to {meta.problemTarget.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {platform === 'codechef' && meta.disclaimer && (
                  <p className="text-[10px] text-yellow-400/90 flex items-center gap-1 pt-1">
                    <Info className="w-3 h-3 shrink-0" />
                    {meta.disclaimer}
                  </p>
                )}
              </div>
            ) : (
              /* Bio code guide */
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    Paste code into {meta.bioField}:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#090D16] border border-amber-900/60 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-amber-300 truncate">
                    {verificationCode}
                  </div>
                  <button
                    onClick={() => handleCopy(verificationCode)}
                    className="px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-amber-500/40 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <a
                  href={editLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-950/70 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg text-xs text-amber-200"
                >
                  <span>Open {meta.name} Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {verifyError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-900/60">
                {verifyError}
              </p>
            )}

            {/* Verify CTA */}
            <button
              onClick={() => handleVerify()}
              disabled={verifying}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Check Verification Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* UNVERIFIED STATE NOTICE (Stats available for personal tracking) */}
        {isUnverified && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span>Personal Tracking Mode</span>
              <button
                onClick={() => handleVerify()}
                disabled={verifying}
                className="text-[11px] text-amber-200 underline hover:text-white cursor-pointer"
              >
                {verifying ? 'Verifying...' : 'Verify Now →'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Stats are displayed for your private dashboard. Verify ownership to unlock trusted leaderboard rank badges.
            </p>
          </div>
        )}

        {/* STATS DISPLAY (For both verified and unverified) */}
        {(isVerified || isUnverified) && (
          <div className="space-y-3">
            {stats && (stats.totalSolved > 0 || stats.rating > 0 || stats.contestsGiven > 0) ? (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Problems Solved</span>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                    {stats.totalSolved?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Current Rating</span>
                  </div>
                  <p className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">
                    {stats.rating ? stats.rating.toLocaleString() : '—'}
                  </p>
                </div>

                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Flame className="w-3.5 h-3.5 text-purple-400" />
                    <span>Contests</span>
                  </div>
                  <p className="text-lg font-extrabold text-purple-300 font-mono mt-0.5">
                    {stats.contestsGiven || 0}
                  </p>
                </div>

                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Max Rating</span>
                  </div>
                  <p className="text-lg font-extrabold text-blue-300 font-mono mt-0.5">
                    {stats.maxRating ? stats.maxRating.toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#0B1120] rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <p>No statistics cached yet.</p>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Statistics Now</span>
                </button>
              </div>
            )}
          </div>
        )}

        {syncError && (
          <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-900/60">
            {syncError}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-[#090D16] border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          {formatTimeAgo(stats?.lastSynced)}
        </span>

        <div className="flex items-center gap-2">
          {(isVerified || isUnverified) && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Synchronize stats"
            >
              <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={unlinking}
            className="p-2 text-red-400/80 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Unlink platform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PlatformCard;
