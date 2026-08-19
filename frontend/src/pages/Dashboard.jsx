import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, ShieldCheck, Layers, Award, Activity } from 'lucide-react';
import PlatformCard from '../components/PlatformCard';
import UnlinkedPlatformCard from '../components/UnlinkedPlatformCard';
import LinkPlatformModal from '../components/LinkPlatformModal';
import { PLATFORM_META } from '../components/PlatformIcons';

const ALL_PLATFORMS = Object.keys(PLATFORM_META);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDefaultPlatform, setSelectedDefaultPlatform] = useState('leetcode');
  const [notification, setNotification] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('http://localhost:5001/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLinkSuccess = (updatedPlatforms) => {
    setProfile(prev => ({ ...prev, platforms: updatedPlatforms }));
    showNotification('Platform linked! Check the verification code on the card.');
  };

  const handleUnlink = async (platformKey) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`http://localhost:5001/api/profile/platforms/${platformKey}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to unlink platform');
      setProfile(prev => ({ ...prev, platforms: data.platforms }));
      showNotification(`${PLATFORM_META[platformKey]?.name || platformKey} unlinked successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const openConnectModal = (platformKey = 'leetcode') => {
    setSelectedDefaultPlatform(platformKey);
    setIsModalOpen(true);
  };

  const linkedPlatforms = profile?.platforms || [];
  const linkedPlatformKeys = linkedPlatforms.map(p => p.platform);
  const unlinkedPlatformKeys = ALL_PLATFORMS.filter(key => !linkedPlatformKeys.includes(key));

  const verifiedCount = linkedPlatforms.filter(p => p.status === 'verified').length;
  const pendingCount = linkedPlatforms.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-[#0D1322] rounded-3xl p-6 sm:p-8 border border-blue-950/80 shadow-xl relative overflow-hidden">
        {/* Subtle Blue Glow background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {profile?.name || user?.name}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-xs">
                Phase 2 Active
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Manage and verify your competitive programming & developer profiles in one unified black & blue hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openConnectModal('leetcode')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Link Platform</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-950/60">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-blue-950 text-blue-400 rounded-xl border border-blue-900/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Linked Profiles</p>
              <p className="text-xl font-extrabold text-white">{linkedPlatforms.length} / {ALL_PLATFORMS.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified</p>
              <p className="text-xl font-extrabold text-white">{verifiedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-900/50">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Bio Check</p>
              <p className="text-xl font-extrabold text-white">{pendingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl border border-purple-900/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Supported Platforms</p>
              <p className="text-xl font-extrabold text-white">{ALL_PLATFORMS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#0D1322] border border-blue-950/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/50 text-red-300 border border-red-800/60 rounded-2xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProfile} className="text-xs font-semibold underline hover:text-white">Retry</button>
        </div>
      )}

      {/* Section 1: Linked Platforms */}
      {linkedPlatforms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Your Connected Platforms</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
                {linkedPlatforms.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Paste the code into each profile's bio before Phase 3 verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {linkedPlatforms.map((platformData) => (
              <PlatformCard
                key={platformData.platform}
                platformData={platformData}
                onUnlink={handleUnlink}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Available Platforms to Connect */}
      {unlinkedPlatformKeys.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Available Platforms to Connect</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                {unlinkedPlatformKeys.length} available
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Connect all platforms to build your complete unified competitive developer portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unlinkedPlatformKeys.map((key) => (
              <UnlinkedPlatformCard
                key={key}
                platformKey={key}
                onConnect={openConnectModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Link Platform Modal */}
      <LinkPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLinkSuccess={handleLinkSuccess}
        defaultPlatform={selectedDefaultPlatform}
      />
    </div>
  );
};

export default Dashboard;
