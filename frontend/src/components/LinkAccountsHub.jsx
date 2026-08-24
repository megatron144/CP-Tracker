import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, Copy, Check, ExternalLink, 
  RotateCw, ArrowRight, ShieldAlert, Sparkles, 
  Code2, FileCode, CheckCheck, Loader2, Info, ChevronRight
} from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';
import { API_BASE_URL, getStoredToken } from '../config/api';

const ALL_PLATFORMS = ['codeforces', 'leetcode', 'codechef', 'atcoder', 'gfg'];

export const LinkAccountsHub = ({ 
  userPlatforms = [], 
  onUpdatePlatforms, 
  onContinueToDashboard,
  isOnboarding = false 
}) => {
  const [localPlatforms, setLocalPlatforms] = useState(null);
  const platforms = localPlatforms !== null ? localPlatforms : userPlatforms;
  const [handles, setHandles] = useState({});
  const [activeMethod, setActiveMethod] = useState({}); // { [platform]: 'submission' | 'bio' | 'oauth' | 'self_report' }
  const [isUnverifiedReport, setIsUnverifiedReport] = useState({});
  const [loadingAction, setLoadingAction] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);
  const [pollingStatus, setPollingStatus] = useState({});
  const [errorStatus, setErrorStatus] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  
  // Track start time for 10-minute polling timeout
  const pollingStartTimes = useRef({});

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Get current record for a platform
  const getRecord = (platformKey) => {
    return platforms.find(p => p.platform?.toLowerCase() === platformKey.toLowerCase());
  };

  // Background auto-polling for pending platforms (every 15s with 10-minute timeout)
  useEffect(() => {
    const pendingPlatforms = platforms.filter(p => p.status === 'pending');
    if (pendingPlatforms.length === 0) return;

    const interval = setInterval(() => {
      pendingPlatforms.forEach(p => {
        const pKey = p.platform;
        const now = Date.now();
        if (!pollingStartTimes.current[pKey]) {
          pollingStartTimes.current[pKey] = now;
        }

        // 10-minute timeout check
        if (now - pollingStartTimes.current[pKey] > 10 * 60 * 1000) {
          setErrorStatus(prev => ({
            ...prev,
            [pKey]: 'Verification timed out (10 minutes). Please verify your submission contains the token and click "Check Verification Now" to retry.'
          }));
          return;
        }

        // Trigger silent poll
        silentPollVerify(pKey);
      });
    }, 16000);

    return () => clearInterval(interval);
  }, [platforms]);

  // Silent background verification poll
  const silentPollVerify = async (platformKey) => {
    const rec = getRecord(platformKey);
    if (!rec || rec.status !== 'pending') return;

    const method = activeMethod[platformKey] || rec.verificationMethod || PLATFORM_META[platformKey]?.primaryMethod || 'bio';

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/verify/${platformKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });

      const data = await res.json();
      if (res.ok && (data.verified || data.success)) {
        setLocalPlatforms(data.platforms);
        if (onUpdatePlatforms) onUpdatePlatforms(data.platforms);
        showToast(`🎉 Verified ${PLATFORM_META[platformKey]?.name || platformKey} account (@${rec.handle})!`);
      }
    } catch {}
  };

  // Link handle
  const handleLinkPlatform = async (platformKey, methodOverride, isSelfReport = false) => {
    const handleInput = handles[platformKey]?.trim();
    if (!handleInput) {
      setErrorStatus(prev => ({ ...prev, [platformKey]: 'Please enter a valid handle / username' }));
      return;
    }

    setLoadingAction(prev => ({ ...prev, [platformKey]: true }));
    setErrorStatus(prev => ({ ...prev, [platformKey]: '' }));

    // For CodeChef, method is strictly submission
    let method = methodOverride || activeMethod[platformKey] || PLATFORM_META[platformKey]?.primaryMethod || 'bio';
    if (platformKey === 'codechef') method = 'submission';

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/platforms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: platformKey,
          handle: handleInput,
          isUnverified: isSelfReport || isUnverifiedReport[platformKey],
          verificationMethod: isSelfReport ? 'self_report' : method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to link platform');

      setLocalPlatforms(data.platforms);
      pollingStartTimes.current[platformKey] = Date.now();
      if (onUpdatePlatforms) onUpdatePlatforms(data.platforms);

      if (isSelfReport || isUnverifiedReport[platformKey]) {
        showToast(`Added @${handleInput} as Unverified for personal tracking.`);
      } else if (method === 'oauth') {
        showToast(`✅ Successfully connected and verified @${handleInput} via OAuth!`);
      } else {
        showToast(`Linked @${handleInput}. Follow the verification step below to confirm ownership.`);
      }
    } catch (err) {
      setErrorStatus(prev => ({ ...prev, [platformKey]: err.message }));
    } finally {
      setLoadingAction(prev => ({ ...prev, [platformKey]: false }));
    }
  };

  // Verify platform ownership (manual trigger)
  const handleVerify = async (platformKey, methodOverride) => {
    const rec = getRecord(platformKey);
    if (!rec) return;

    setPollingStatus(prev => ({ ...prev, [platformKey]: true }));
    setErrorStatus(prev => ({ ...prev, [platformKey]: '' }));

    let method = methodOverride || activeMethod[platformKey] || rec.verificationMethod || PLATFORM_META[platformKey]?.primaryMethod || 'bio';
    if (platformKey === 'codechef') method = 'submission';

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/verify/${platformKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ method })
      });

      const data = await res.json();
      if (!res.ok || (!data.verified && !data.success)) {
        throw new Error(data.message || 'Submission with this code not found yet — this can take a minute after submitting.');
      }

      setLocalPlatforms(data.platforms);
      if (onUpdatePlatforms) onUpdatePlatforms(data.platforms);
      showToast(`🎉 Verified ${PLATFORM_META[platformKey]?.name || platformKey} account (@${rec.handle})!`);
    } catch (err) {
      setErrorStatus(prev => ({ ...prev, [platformKey]: err.message }));
    } finally {
      setPollingStatus(prev => ({ ...prev, [platformKey]: false }));
    }
  };

  // OAuth Connect simulation / direct connect
  const handleOAuthConnect = async (platformKey) => {
    const handleInput = handles[platformKey]?.trim() || 'developer';
    setLoadingAction(prev => ({ ...prev, [platformKey]: true }));
    setErrorStatus(prev => ({ ...prev, [platformKey]: '' }));

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/platforms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: platformKey,
          handle: handleInput,
          verificationMethod: 'oauth'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OAuth linking failed');

      setLocalPlatforms(data.platforms);
      if (onUpdatePlatforms) onUpdatePlatforms(data.platforms);
      showToast(`✅ Connected and verified ${PLATFORM_META[platformKey]?.name} account (@${handleInput})!`);
    } catch (err) {
      setErrorStatus(prev => ({ ...prev, [platformKey]: err.message }));
    } finally {
      setLoadingAction(prev => ({ ...prev, [platformKey]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up text-white select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-blue-500/50 text-white px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-slate-200">{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-blue-950/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Platform-Aware Verification
            </span>
            {isOnboarding && (
              <span className="text-xs text-slate-400 font-mono">Step 2 of 2</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Link Your Coding Accounts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your competitive programming handles with adaptive verification tailored to each platform.
          </p>
        </div>

        {/* Action Skip / Done */}
        <div>
          <button
            onClick={onContinueToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer group"
          >
            <span>{isOnboarding ? 'Skip to Dashboard' : 'Done & Return'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Platform Cards List */}
      <div className="grid grid-cols-1 gap-5 my-6">
        {ALL_PLATFORMS.map((platformKey) => {
          const meta = PLATFORM_META[platformKey] || {};
          const record = getRecord(platformKey);
          const isLinked = !!record;
          const status = record?.status || 'unlinked'; // 'verified', 'unverified', 'pending', 'unlinked'
          const handleVal = handles[platformKey] ?? (record?.handle || '');
          const currentMethod = platformKey === 'codechef' 
            ? 'submission' 
            : (activeMethod[platformKey] || record?.verificationMethod || meta.primaryMethod || 'bio');
          const verificationCode = record?.verificationCode || 'CPT-VERIFY-SAMPLE';
          const isPolling = !!pollingStatus[platformKey];
          const isLoading = !!loadingAction[platformKey];
          const errorMsg = errorStatus[platformKey];

          return (
            <div 
              key={platformKey}
              className={`bg-[#0D1322] border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xl relative overflow-hidden ${
                status === 'verified'
                  ? 'border-emerald-800/60 bg-gradient-to-r from-[#0D1322] to-[#0A1820]'
                  : status === 'unverified'
                  ? 'border-amber-800/60 bg-gradient-to-r from-[#0D1322] to-[#1A1608]'
                  : status === 'pending'
                  ? 'border-blue-700/60'
                  : 'border-blue-950/80 hover:border-slate-700'
              }`}
            >
              {/* Header: Platform Info & Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#090E1A] rounded-xl border border-slate-800">
                    <PlatformIcons platform={platformKey} className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{meta.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({meta.category})</span>
                    </div>
                    {/* Method Tooltip Reason */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-blue-400">{meta.methodLabel}</span>
                      <span title={meta.methodReason} className="cursor-help text-slate-500 hover:text-slate-300">
                        <Info className="w-3.5 h-3.5 inline" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {status === 'verified' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Verified
                    </span>
                  )}
                  {status === 'unverified' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-mono" title="Self-reported for personal tracking only">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Unverified (Personal)
                    </span>
                  )}
                  {status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.2)] font-mono animate-pulse">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      Waiting for Submission...
                    </span>
                  )}
                  {status === 'unlinked' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      Not Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-950/60 text-red-200 border border-red-800/80 text-xs flex items-start gap-2 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMsg}</div>
                </div>
              )}

              {/* CodeChef Disclaimer Note */}
              {platformKey === 'codechef' && meta.disclaimer && (
                <div className="mt-3 p-2.5 rounded-xl bg-yellow-950/30 border border-yellow-800/40 text-yellow-300/90 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>{meta.disclaimer}</span>
                </div>
              )}

              {/* CARD BODY ACCORDING TO STATE & METHOD */}

              {/* 1. NOT LINKED / ENTER HANDLE INPUT */}
              {!isLinked ? (
                <div className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {meta.name} Username / Handle
                      </label>
                      <input
                        type="text"
                        placeholder={meta.placeholder}
                        value={handleVal}
                        onChange={(e) => {
                          setHandles(prev => ({ ...prev, [platformKey]: e.target.value }));
                          setErrorStatus(prev => ({ ...prev, [platformKey]: '' }));
                        }}
                        className="w-full min-h-[44px] px-3.5 py-2 bg-[#090E1A] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    {/* Action Buttons based on Platform Capabilities */}
                    <div className="sm:col-span-4 flex flex-col justify-end pt-5">
                      {meta.primaryMethod === 'oauth' ? (
                        <button
                          onClick={() => handleOAuthConnect(platformKey)}
                          disabled={isLoading}
                          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-slate-600"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlatformIcons platform={platformKey} className="w-4 h-4" />}
                          <span>Connect with {meta.name}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLinkPlatform(platformKey, meta.primaryMethod, false)}
                          disabled={isLoading || !handleVal.trim()}
                          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Start Verification</span>}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unverified Option Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!isUnverifiedReport[platformKey]}
                        onChange={(e) => setIsUnverifiedReport(prev => ({ ...prev, [platformKey]: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-[#090E1A] text-blue-600"
                      />
                      <span>Add as Unverified without code (Personal tracking only)</span>
                    </label>

                    {isUnverifiedReport[platformKey] && (
                      <button
                        onClick={() => handleLinkPlatform(platformKey, 'self_report', true)}
                        className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                      >
                        Save Unverified →
                      </button>
                    )}
                  </div>
                </div>
              ) : status === 'verified' ? (
                /* 2. ALREADY VERIFIED CARD */
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#090E1A]/80 p-3.5 rounded-xl border border-emerald-900/40 text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white text-sm">@{record.handle}</span>
                      <span className="text-slate-400 block font-mono text-[11px]">
                        Verified via {record.verificationMethod === 'submission' ? 'Submission Telemetry' : (record.verificationMethod || 'Platform Telemetry')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={meta.profileUrl(record.handle)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* 3. PENDING VERIFICATION / ADAPTIVE VERIFY STEPS */
                <div className="mt-4 space-y-4">
                  
                  {/* Handle display */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/60">
                    <span className="text-slate-400">Account: <strong className="text-white font-mono">@{record.handle}</strong></span>
                    
                    {/* Method Switcher only for platforms supporting both submission and bio (Codeforces & AtCoder) */}
                    {['codeforces', 'atcoder'].includes(platformKey) && (
                      <div className="flex items-center gap-1 bg-[#090E1A] p-1 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          onClick={() => setActiveMethod(prev => ({ ...prev, [platformKey]: 'submission' }))}
                          className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                            currentMethod === 'submission'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Submission Method
                        </button>
                        <button
                          onClick={() => setActiveMethod(prev => ({ ...prev, [platformKey]: 'bio' }))}
                          className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                            currentMethod === 'bio'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Profile Code Method
                        </button>
                      </div>
                    )}

                    {platformKey === 'codechef' && (
                      <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                        Verify via Submission
                      </span>
                    )}
                  </div>

                  {/* METHOD A: SUBMISSION-BASED VERIFICATION */}
                  {currentMethod === 'submission' && meta.problemTarget ? (
                    <div className="bg-[#090E1A]/90 p-4 rounded-xl border border-blue-900/50 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-300 flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-blue-400" />
                          Step 1: Make a single throwaway submission
                        </span>
                        <a
                          href={meta.problemTarget.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                        >
                          <span>Open {meta.problemTarget.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-slate-400">
                        Submit a compile-error or wrong-answer solution containing this token as a code comment:
                      </p>

                      {/* Branded Token Code Copy Box */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0D1322] border border-blue-800/80 rounded-xl px-3 py-2 font-mono text-sm text-blue-300 font-bold tracking-wider">
                          // {verificationCode}
                        </div>
                        <button
                          onClick={() => handleCopy(`// ${verificationCode}\n#include <iostream>\nint main() { return 0; }`, platformKey)}
                          className="px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500/40 min-h-[40px]"
                        >
                          {copiedCode === platformKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedCode === platformKey ? 'Copied Snippet!' : 'Copy Code'}</span>
                        </button>
                      </div>

                      {/* Verify Action Button & Status */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => handleVerify(platformKey, 'submission')}
                          disabled={isPolling}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer min-h-[40px]"
                        >
                          {isPolling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Checking submission history...</span>
                            </>
                          ) : (
                            <>
                              <RotateCw className="w-4 h-4" />
                              <span>Check Verification Now</span>
                            </>
                          )}
                        </button>

                        <span className="text-[11px] text-slate-500 font-mono">
                          Auto-polling in background every ~15s
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* METHOD B: BIO / PROFILE CODE VERIFICATION (LeetCode & Fallback for Codeforces/AtCoder) */
                    <div className="bg-[#090E1A]/90 p-4 rounded-xl border border-blue-900/50 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-amber-400" />
                          Step 1: Add code to your {meta.name} profile
                        </span>
                        {meta.editUrl && (
                          <a
                            href={meta.editUrl()}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                          >
                            <span>Open {meta.name} Settings</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 text-[11px] text-slate-400">
                        <div className="bg-[#0D1322] p-2 rounded-lg border border-slate-800">
                          <span className="text-blue-400 font-bold block">1. Open Settings</span>
                          <span>{meta.editGuide}</span>
                        </div>
                        <div className="bg-[#0D1322] p-2 rounded-lg border border-slate-800">
                          <span className="text-blue-400 font-bold block">2. Paste Code</span>
                          <span>Paste token into field and save</span>
                        </div>
                        <div className="bg-[#0D1322] p-2 rounded-lg border border-slate-800">
                          <span className="text-blue-400 font-bold block">3. Click Verify</span>
                          <span>We automatically detect & confirm</span>
                        </div>
                      </div>

                      {/* Token Copy Box */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0D1322] border border-amber-800/80 rounded-xl px-3 py-2 font-mono text-sm text-amber-300 font-bold tracking-wider">
                          {verificationCode}
                        </div>
                        <button
                          onClick={() => handleCopy(verificationCode, platformKey)}
                          className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/40 min-h-[40px]"
                        >
                          {copiedCode === platformKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedCode === platformKey ? 'Copied Code!' : 'Copy Code'}</span>
                        </button>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => handleVerify(platformKey, 'bio')}
                          disabled={isPolling}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer min-h-[40px]"
                        >
                          {isPolling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Scanning profile bio...</span>
                            </>
                          ) : (
                            <>
                              <CheckCheck className="w-4 h-4" />
                              <span>I've added it, check now</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleLinkPlatform(platformKey, 'self_report', true)}
                          className="text-xs text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                        >
                          Switch to Unverified (Personal Tracking Only)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Continue Button */}
      <div className="pt-6 text-center border-t border-blue-950/80">
        <button
          onClick={onContinueToDashboard}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default LinkAccountsHub;
