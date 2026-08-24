import { useState, useEffect } from 'react';
import { 
  X, User, Sparkles, Check, 
  Loader2, AlertCircle, Info
} from 'lucide-react';
import { API_BASE_URL, getStoredToken } from '../config/api';

export const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  currentName = '', 
  onUpdateSuccess 
}) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setName(currentName || '');
    setError('');
    setTouched(false);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2 && trimmedName.length <= 30;
  const validationError = touched 
    ? (trimmedName.length === 0 
        ? 'Display name cannot be empty' 
        : (trimmedName.length < 2 ? 'Display name must be at least 2 characters' : (trimmedName.length > 30 ? 'Display name must not exceed 30 characters' : '')))
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid || loading) return;

    setLoading(true);
    setError('');

    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: trimmedName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update display name');
      }

      if (onUpdateSuccess) {
        onUpdateSuccess(trimmedName);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayNamePreview = trimmedName || 'Your Name';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up select-none">
      <div className="bg-[#0D1322] w-full max-w-lg rounded-2xl shadow-2xl border border-blue-900/60 overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-950/80 bg-[#090E1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Account Settings & Display Name
              </h3>
              <p className="text-xs text-slate-400">Customize how you appear across CP-Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs text-red-300 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Display Name Input Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label 
                htmlFor="edit-display-name" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Display Name <span className="text-blue-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${
                trimmedName.length > 30 ? 'text-red-400' : 'text-slate-500'
              }`}>
                {trimmedName.length} / 30
              </span>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                id="edit-display-name"
                type="text"
                value={name}
                maxLength={35}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onBlur={() => setTouched(true)}
                placeholder="e.g. aditya or alex_coder"
                className={`w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-[#090E1A] border rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                  validationError
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                }`}
              />
            </div>

            {validationError && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 animate-fade-in-up">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            )}

            {/* Helper Text to Clarify Distinction */}
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>
                This is just your display name on CP-Tracker — it won't change your linked Codeforces, LeetCode, AtCoder, CodeChef, or GFG platform usernames.
              </span>
            </p>
          </div>

          {/* Live Previews Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Live Name Preview
            </span>

            {/* Preview 1: Welcome Greeting */}
            <div className="bg-[#090E1A] p-3.5 rounded-xl border border-blue-950/80 space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">
                Dashboard Greeting:
              </span>
              <p className="text-base font-bold text-white tracking-tight">
                Welcome back, <span className="text-blue-400 font-extrabold">{displayNamePreview}</span> 👋
              </p>
            </div>

            {/* Preview 2: Peer Profile Card */}
            <div className="bg-[#090E1A] p-3.5 rounded-xl border border-blue-950/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                  {displayNamePreview.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{displayNamePreview}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 font-mono">
                      Master
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Competitive Programmer
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Peak Rating</span>
                <span className="text-xs font-mono font-bold text-amber-300">2,150</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
