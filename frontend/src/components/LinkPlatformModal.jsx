import { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { PlatformIcons, PLATFORM_META } from './PlatformIcons';

const LinkPlatformModal = ({ isOpen, onClose, onLinkSuccess, defaultPlatform = 'leetcode' }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(defaultPlatform);
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultPlatform) {
      setSelectedPlatform(defaultPlatform);
    }
    setError('');
    setHandle('');
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const currentMeta = PLATFORM_META[selectedPlatform] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError('Please enter a username / handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('http://localhost:5001/api/profile/platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          handle: handle.trim()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-2xl border border-blue-900/50 overflow-hidden text-slate-100">
        {/* Header - High Contrast Black & Blue */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/40 bg-[#0B1120]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Connect Platform
              </h3>
              <p className="text-xs text-blue-300/80">Link your competitive programming or dev profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-950/50 border border-red-800/60 rounded-xl">
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/60 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.25)] ring-1 ring-blue-500'
                        : 'border-slate-800 bg-[#0B1120] hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <PlatformIcons platform={key} className="w-5 h-5 shrink-0" />
                    <span className="text-xs truncate font-medium">{meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Pitch Banner */}
          <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl flex items-start gap-3">
            <PlatformIcons platform={selectedPlatform} className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">
              {currentMeta.pitch}
            </p>
          </div>

          {/* Handle Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {currentMeta.name} Username / Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={currentMeta.placeholder}
              required
              className="w-full px-3.5 py-2.5 bg-[#0B1120] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              In Phase 3, you'll verify this by placing a temporary code in your {currentMeta.bioField}.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Code...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Link {currentMeta.name}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkPlatformModal;
