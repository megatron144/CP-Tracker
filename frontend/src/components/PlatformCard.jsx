import { useState } from 'react';
import { Copy, Check, Trash2, Clock, CheckCircle2, ShieldAlert, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';

const PlatformCard = ({ platformData, onUnlink, onVerifySuccess }) => {
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const { platform, handle, status, verificationCode, createdAt } = platformData;
  const meta = PLATFORM_META[platform] || {
    name: platform,
    category: 'Developer Platform',
    bioField: 'Profile Bio'
  };

  const isVerified = status === 'verified';
  const profileLink = meta.profileUrl ? meta.profileUrl(handle) : '#';
  const editLink = meta.editUrl ? meta.editUrl(handle) : profileLink;

  const handleCopy = () => {
    if (!verificationCode) return;
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to unlink ${meta.name} (@${handle})?`)) {
      setUnlinking(true);
      await onUnlink(platform);
      setUnlinking(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError('');

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`http://localhost:5001/api/profile/verify/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed. Please ensure the code is in your bio.');
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
                <span className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-900/50">
                  {meta.category}
                </span>
              </div>
              <a
                href={profileLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline mt-0.5 font-mono group"
                title={`Open @${handle} on ${meta.name}`}
              >
                <span>@{handle}</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Status Badge */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
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

      {/* Card Body: Verification Code / Instructions */}
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
              <span>Open @{handle} on {meta.name}</span>
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
        ) : (
          <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-900/50 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-200 font-medium">
              Profile ownership verified. Stats synchronization is active!
            </p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-[#0B1120] border-t border-blue-950/60 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Linked {new Date(createdAt || Date.now()).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
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
