import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, ShieldCheck, Layers, RotateCw, 
  Trophy, Target, Flame, BarChart2, Grid, Share2, Calendar, Edit3
} from 'lucide-react';
import PlatformCard from '../components/PlatformCard';
import UnlinkedPlatformCard from '../components/UnlinkedPlatformCard';
import LinkPlatformModal from '../components/LinkPlatformModal';
import EditProfileModal from '../components/EditProfileModal';
import UpcomingContests from '../components/UpcomingContests';
import LinkAccountsHub from '../components/LinkAccountsHub';
import ClistRatingGraph from '../components/charts/ClistRatingGraph';
import PlatformPieChartsGrid from '../components/charts/PlatformPieChartsGrid';
import ActivityHeatmap from '../components/charts/ActivityHeatmap';
import PlatformBreakdownBar from '../components/charts/PlatformBreakdownBar';
import { PLATFORM_META } from '../components/PlatformIcons';
import { API_BASE_URL, getStoredToken } from '../config/api';

const ALL_PLATFORMS = Object.keys(PLATFORM_META);

const Dashboard = () => {
  const { user, updateDisplayName } = useContext(AuthContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.showLinkAccounts) return 'link_accounts';
    if (location.state?.showUpcomingContests) return 'contests';
    return 'overview';
  }); // 'overview', 'contests', 'link_accounts', 'analytics', 'platforms'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedDefaultPlatform, setSelectedDefaultPlatform] = useState('leetcode');
  const [notification, setNotification] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
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

  const handleVerifySuccess = (updatedPlatforms, msg) => {
    setProfile(prev => ({ ...prev, platforms: updatedPlatforms }));
    showNotification(msg || 'Platform ownership verified and stats synchronized!');
  };

  const handleSyncSuccess = (updatedPlatforms, msg) => {
    setProfile(prev => ({ ...prev, platforms: updatedPlatforms }));
    showNotification(msg || 'Platform statistics updated successfully!');
  };

  const handleSyncAll = async () => {
    const verified = (profile?.platforms || []).filter(p => p.status === 'verified');
    if (verified.length === 0) {
      showNotification('Verify at least one platform before synchronizing.');
      return;
    }

    setSyncingAll(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/sync-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to synchronize all platforms');
      }

      setProfile(prev => ({ ...prev, platforms: data.platforms }));
      showNotification(data.message || 'All platform statistics synchronized!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleUnlink = async (platformKey) => {
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE_URL}/api/profile/platforms/${platformKey}`, {
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

  const linkedPlatforms = (profile?.platforms || []).filter(p => ALL_PLATFORMS.includes(p.platform));
  const linkedPlatformKeys = linkedPlatforms.map(p => p.platform);
  const unlinkedPlatformKeys = ALL_PLATFORMS.filter(key => !linkedPlatformKeys.includes(key));

  const verifiedPlatforms = linkedPlatforms.filter(p => p.status === 'verified');
  const verifiedCount = verifiedPlatforms.length;

  // Aggregated live statistics
  const totalSolvedAll = verifiedPlatforms.reduce((acc, p) => acc + (p.stats?.totalSolved || 0), 0);
  const peakRatingAll = verifiedPlatforms.length > 0 
    ? Math.max(0, ...verifiedPlatforms.map(p => p.stats?.maxRating || p.stats?.rating || 0))
    : 0;
  const totalContestsAll = verifiedPlatforms.reduce((acc, p) => acc + (p.stats?.contestsGiven || 0), 0);

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
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>Welcome, {profile?.name || user?.name || 'Developer'}!</span>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="p-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 hover:text-white border border-blue-800/60 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
                  title="Edit Display Name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
                Unified Portfolio
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Your unified competitive programming command center & live portfolio analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Upcoming Contests Radar Shortcut */}
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer border ${
                activeTab === 'contests'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-blue-300 hover:text-white border border-blue-900/60 hover:border-blue-500/50'
              }`}
              title="Open Live Upcoming Contests Radar"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Contest Radar</span>
            </button>

            {/* Share Public Portfolio Button */}
            <button
              onClick={() => {
                const username = profile?.email ? profile.email.split('@')[0] : (user?.email ? user.email.split('@')[0] : profile?._id);
                const publicUrl = `${window.location.origin}/u/${username}`;
                navigator.clipboard.writeText(publicUrl);
                showNotification(`Public Portfolio link copied to clipboard: /u/${username}`);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1120] hover:bg-slate-800/80 text-emerald-400 hover:text-emerald-300 border border-emerald-900/60 hover:border-emerald-500/50 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
              title="Copy shareable public profile link"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </button>

            {/* Global Sync All Button */}
            {verifiedCount > 0 && (
              <button
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1120] hover:bg-slate-800/80 text-blue-300 hover:text-white border border-blue-900/60 hover:border-blue-500/50 font-semibold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                title="Synchronize all verified platforms now"
              >
                <RotateCw className={`w-4 h-4 ${syncingAll ? 'animate-spin text-blue-400' : ''}`} />
                <span>{syncingAll ? 'Syncing All...' : 'Sync All'}</span>
              </button>
            )}

            {/* Link Platform Modal Trigger */}
            <button
              onClick={() => openConnectModal('leetcode')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Link Platform</span>
            </button>
          </div>
        </div>

        {/* Quick Aggregated Stats Bar */}
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Solved / Repos</p>
              <p className="text-xl font-extrabold text-emerald-400">{totalSolvedAll.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-900/50">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Rating</p>
              <p className="text-xl font-extrabold text-amber-300">{peakRatingAll > 0 ? peakRatingAll.toLocaleString() : '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#090E1A]/80 border border-blue-950/50">
            <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl border border-purple-900/50">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Contests</p>
              <p className="text-xl font-extrabold text-purple-300">{totalContestsAll.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-blue-950/80 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-[#0B1120] text-slate-400 hover:text-white hover:bg-slate-900 border border-blue-950/60'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Unified Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('contests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'contests'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-[#0B1120] text-blue-300 hover:text-white hover:bg-slate-900 border border-blue-950/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Upcoming Contests</span>
          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-[#0B1120] text-slate-400 hover:text-white hover:bg-slate-900 border border-blue-950/60'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Rating Timeline & Mastery</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'platforms'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-[#0B1120] text-slate-400 hover:text-white hover:bg-slate-900 border border-blue-950/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Connected Platforms ({linkedPlatforms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('link_accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeTab === 'link_accounts'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'bg-[#0B1120] text-blue-300 hover:text-white hover:bg-slate-900 border border-blue-950/60'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Account Linking Hub</span>
        </button>
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

      {/* VIEW: LINK ACCOUNTS HUB */}
      {activeTab === 'link_accounts' && (
        <LinkAccountsHub
          userPlatforms={profile?.platforms || []}
          onUpdatePlatforms={handleLinkSuccess}
          onContinueToDashboard={() => setActiveTab('overview')}
        />
      )}

      {/* VIEW: UPCOMING CONTESTS SCREEN */}
      {activeTab === 'contests' && (
        <UpcomingContests 
          username={profile?.name || user?.name || 'Coder'} 
          onContinueToDashboard={() => setActiveTab('overview')} 
        />
      )}

      {/* VIEW: OVERVIEW OR ANALYTICS (Charts & Visualizations) */}
      {(activeTab === 'overview' || activeTab === 'analytics') && (
        <div className="space-y-6">
          {/* 1. Combined Unified Multi-Platform Rating Graph (CList Style) */}
          <ClistRatingGraph platforms={linkedPlatforms} />

          {/* 2. Individual Mastery Pie / Donut Charts for LeetCode, Codeforces, CodeChef, AtCoder */}
          <PlatformPieChartsGrid platforms={linkedPlatforms} />

          {/* 3. 52-Week Activity Heatmap + Volume Breakdown Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ActivityHeatmap platforms={linkedPlatforms} />
            </div>
            <div className="lg:col-span-5">
              <PlatformBreakdownBar platforms={linkedPlatforms} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW: OVERVIEW OR PLATFORMS (Platform Cards List) */}
      {(activeTab === 'overview' || activeTab === 'platforms') && (
        <>
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
                  Paste the code into each profile's bio before verification, then sync live statistics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {linkedPlatforms.map((platformData) => (
                  <PlatformCard
                    key={platformData.platform}
                    platformData={platformData}
                    onUnlink={handleUnlink}
                    onVerifySuccess={handleVerifySuccess}
                    onSyncSuccess={handleSyncSuccess}
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
        </>
      )}

      {/* Link Platform Modal */}
      <LinkPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLinkSuccess={handleLinkSuccess}
        defaultPlatform={selectedDefaultPlatform}
      />

      {/* Edit Profile / Display Name Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={profile?.name || user?.name || ''}
        onUpdateSuccess={(newName) => {
          setProfile(prev => ({ ...prev, name: newName }));
          if (updateDisplayName) updateDisplayName(newName);
          showNotification(`Display name updated to '${newName}'.`);
        }}
      />
    </div>
  );
};

export default Dashboard;
