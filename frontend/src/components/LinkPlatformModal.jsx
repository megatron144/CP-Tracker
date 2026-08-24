import { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Info, Code2, FileCode, CheckCircle2, Loader2 } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';
import { API_BASE_URL, getStoredToken } from '../config/api';

const LinkPlatformModal = ({ isOpen, onClose, onLinkSuccess, defaultPlatform = 'codeforces' }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform);
  const [handle, setHandle] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
    setError('');
    setHandle('');
    setIsUnverified(false);
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const currentMeta = PLATFORM_META[selectedPlatform] || {};

  const handleSubmit = async (e, forceMethod) => {
    if (e) e.preventDefault();
    if (!handle.trim() && forceMethod !== 'oauth') {
      setError('Please enter a username / handle');
      return;
    }

    setLoading(true);
    setError('');

    const targetMethod = isUnverified 
      ? 'self_report' 
      : (forceMethod || currentMeta.primaryMethod || 'bio');

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/platforms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          handle: handle.trim() || 'developer',
          isUnverified: isUnverified || targetMethod === 'self_report',
          verificationMethod: targetMethod
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to link platform');
      }

      onLinkSuccess(data.platforms);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up select-none">
      <div className="bg-[#0D1322] w-full max-w-lg rounded-2xl shadow-2xl border border-blue-900/60 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-950/80 bg-[#090E1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Connect Platform
              </h3>
              <p className="text-xs text-slate-400">Adaptive platform-aware account linking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={(e) => handleSubmit(e)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/50 border border-red-800/60 rounded-xl">
              {error}
            </div>
          )}

          {/* Platform Selector Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(PLATFORM_META).map((key) => {
                const meta = PLATFORM_META[key];
                const isSelected = selectedPlatform === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(key);
                      setError('');
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/60 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.25)] ring-1 ring-blue-500'
                        : 'border-slate-800 bg-[#090E1A] hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <PlatformIcons platform={key} className="w-5 h-5 shrink-0" />
                    <span className="text-xs truncate font-semibold">{meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method Explanation Badge Banner */}
          <div className="p-3 bg-[#090E1A] border border-blue-950 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-blue-400 font-bold">
              <span className="flex items-center gap-1.5">
                {currentMeta.primaryMethod === 'submission' ? (
                  <Code2 className="w-4 h-4 text-blue-400" />
                ) : currentMeta.primaryMethod === 'oauth' ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                ) : (
                  <FileCode className="w-4 h-4 text-amber-400" />
                )}
                Verification: {currentMeta.methodLabel}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {currentMeta.methodReason}
            </p>
            {currentMeta.disclaimer && (
              <p className="text-amber-400/90 text-[10px] pt-1 border-t border-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {currentMeta.disclaimer}
              </p>
            )}
          </div>

          {/* Handle Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {currentMeta.name} Username / Handle
            </label>
            <input
              type="text"
              placeholder={currentMeta.placeholder}
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Unverified Self-Report Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={isUnverified}
                onChange={(e) => setIsUnverified(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-[#090E1A] text-blue-600 cursor-pointer"
              />
              <span>Add as Unverified without code (Personal tracking only)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {currentMeta.primaryMethod === 'oauth' && !isUnverified ? (
              <button
                type="button"
                onClick={() => handleSubmit(null, 'oauth')}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlatformIcons platform={selectedPlatform} className="w-4 h-4" />}
                <span>Connect with {currentMeta.name}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !handle.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isUnverified
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{isUnverified ? 'Save as Unverified' : 'Continue to Verification'}</span>
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default LinkPlatformModal;
