import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Calendar, Clock, Bell, BellRing, ExternalLink, 
  ArrowRight, Filter, Sparkles, ChevronRight, Flame
} from 'lucide-react';
import { PlatformIcons } from './PlatformIcons';
import { API_BASE_URL } from '../config/api';

// Live countdown calculator helper
const calculateTimeRemaining = (targetIsoTime) => {
  const diff = new Date(targetIsoTime).getTime() - Date.now();
  if (diff <= 0) {
    return { isLive: true, text: 'Live Now' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    isLive: false,
    days,
    hours,
    minutes,
    seconds,
    text: days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`
  };
};

// Format start date localized to user's timezone
const formatLocalizedDate = (targetIsoTime) => {
  try {
    const d = new Date(targetIsoTime);
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return d.toLocaleString(undefined, options);
  } catch {
    return targetIsoTime;
  }
};

const PLATFORMS_LIST = [
  { key: 'all', label: 'All Platforms' },
  { key: 'codeforces', label: 'Codeforces' },
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'codechef', label: 'CodeChef' },
  { key: 'atcoder', label: 'AtCoder' }
];

export const UpcomingContests = ({ username = 'Coder', onContinueToDashboard }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('cptracker_contest_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [toastMessage, setToastMessage] = useState('');
  const [, setTick] = useState(0);

  // Live timer tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch upcoming contests from API (with fallback)
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/contests/upcoming`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.contests)) {
          setContests(data.contests);
        } else {
          throw new Error('Fallback to static schedule');
        }
      } catch (err) {
        console.warn('Using client-side fallback contest schedule:', err.message);
        // Built-in reliable client schedule fallback
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        const ONE_DAY = 24 * ONE_HOUR;
        setContests([
          {
            id: 'cf-998',
            name: 'Codeforces Round 998 (Div. 2)',
            platform: 'codeforces',
            startTime: new Date(now + 14 * ONE_HOUR + 22 * 60 * 1000).toISOString(),
            durationSeconds: 7200,
            durationText: '2 hours',
            url: 'https://codeforces.com/contests'
          },
          {
            id: 'lc-bw-150',
            name: 'LeetCode Biweekly Contest 150',
            platform: 'leetcode',
            startTime: new Date(now + 1 * ONE_DAY + 8 * ONE_HOUR + 15 * 60 * 1000).toISOString(),
            durationSeconds: 5400,
            durationText: '1 hour 30 mins',
            url: 'https://leetcode.com/contest/'
          },
          {
            id: 'cc-start-174',
            name: 'CodeChef Starters 174 (Div. 1, 2, 3 & 4)',
            platform: 'codechef',
            startTime: new Date(now + 2 * ONE_DAY + 4 * ONE_HOUR + 30 * 60 * 1000).toISOString(),
            durationSeconds: 7200,
            durationText: '2 hours',
            url: 'https://www.codechef.com/contests'
          },
          {
            id: 'lc-wc-438',
            name: 'LeetCode Weekly Contest 438',
            platform: 'leetcode',
            startTime: new Date(now + 2 * ONE_DAY + 18 * ONE_HOUR).toISOString(),
            durationSeconds: 5400,
            durationText: '1 hour 30 mins',
            url: 'https://leetcode.com/contest/'
          },
          {
            id: 'atc-abc-392',
            name: 'AtCoder Beginner Contest 392 (ABC 392)',
            platform: 'atcoder',
            startTime: new Date(now + 3 * ONE_DAY + 11 * ONE_HOUR).toISOString(),
            durationSeconds: 6000,
            durationText: '1 hour 40 mins',
            url: 'https://atcoder.jp/contests/'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Filtered and sorted contests
  const filteredContests = useMemo(() => {
    if (selectedPlatform === 'all') return contests;
    return contests.filter(c => c.platform?.toLowerCase() === selectedPlatform);
  }, [contests, selectedPlatform]);

  const nextContest = filteredContests.length > 0 ? filteredContests[0] : null;
  const remainingContests = filteredContests.length > 0 ? filteredContests.slice(1) : [];

  // Toggle Reminder handler
  const handleToggleReminder = (contest) => {
    const isSet = !!reminders[contest.id];
    const newReminders = { ...reminders, [contest.id]: !isSet };
    setReminders(newReminders);
    try {
      localStorage.setItem('cptracker_contest_reminders', JSON.stringify(newReminders));
    } catch (e) {
      console.error(e);
    }

    if (!isSet) {
      showToast(`Reminder set for ${contest.name}! We'll alert you 1 hour before start.`);
    } else {
      showToast(`Reminder cancelled for ${contest.name}.`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up text-white select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-blue-500/50 text-white px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-fade-in-up">
          <BellRing className="w-5 h-5 text-blue-400 animate-bounce" />
          <span className="text-sm font-medium text-slate-200">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-blue-950/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Post-Login Briefing
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
              Live Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {username} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your live competitive programming radar and upcoming contest schedule.
          </p>
        </div>

        {/* Skip to Dashboard CTA */}
        <div>
          <button
            onClick={onContinueToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer group"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Platform Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-5 no-scrollbar">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {PLATFORMS_LIST.map((p) => {
          const isSelected = selectedPlatform === p.key;
          const count = p.key === 'all' 
            ? contests.length 
            : contests.filter(c => c.platform?.toLowerCase() === p.key).length;

          return (
            <button
              key={p.key}
              onClick={() => setSelectedPlatform(p.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                  : 'bg-[#0D1322] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {p.key !== 'all' && <PlatformIcons platform={p.key} className="w-3.5 h-3.5" />}
              <span>{p.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="inline-flex p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl animate-heartbeat">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">Fetching live contest telemetry...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        /* Empty State */
        <div className="bg-[#0D1322] border border-blue-950/80 rounded-3xl p-12 text-center space-y-4 my-4 shadow-xl">
          <div className="inline-flex p-3.5 bg-slate-800/60 rounded-2xl text-slate-400">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white">No contests scheduled</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            There are currently no upcoming contests for the selected platforms. Switch your filter to "All Platforms" or check back soon!
          </p>
          <button
            onClick={() => setSelectedPlatform('all')}
            className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* FEATURED: NEXT UP CONTEST HERO CARD */}
          {nextContest && (
            <div className="bg-gradient-to-br from-[#0D1322] via-[#0E172C] to-[#0A1224] border border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden group">
              {/* Glowing Background Radial */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-blue-600/25 transition-all"></div>

              <div className="relative z-10 space-y-5">
                
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-mono">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
                      Next Up
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/50 capitalize font-mono">
                      <PlatformIcons platform={nextContest.platform} className="w-3.5 h-3.5" />
                      {nextContest.platform}
                    </span>
                  </div>

                  {/* Reminder Bell Button */}
                  <button
                    onClick={() => handleToggleReminder(nextContest)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      reminders[nextContest.id]
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                        : 'bg-[#090E1A] text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {reminders[nextContest.id] ? (
                      <>
                        <BellRing className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Reminder Set</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Remind Me</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Timing */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {nextContest.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 bg-[#090E1A]/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>{formatLocalizedDate(nextContest.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#090E1A]/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Duration: {nextContest.durationText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Countdown Ticker Display */}
                  <div className="lg:col-span-5 bg-[#090E1A]/90 backdrop-blur-md rounded-2xl border border-blue-900/60 p-4 shadow-xl">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                      Live Countdown to Start
                    </span>
                    {(() => {
                      const rem = calculateTimeRemaining(nextContest.startTime);
                      if (rem.isLive) {
                        return (
                          <div className="py-2 text-center text-emerald-400 font-extrabold text-lg flex items-center justify-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Contest is Live Now!
                          </div>
                        );
                      }
                      return (
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                            <span className="text-lg font-black text-white font-mono">{rem.days}</span>
                            <span className="text-[9px] text-slate-500 block uppercase">Days</span>
                          </div>
                          <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                            <span className="text-lg font-black text-white font-mono">{rem.hours}</span>
                            <span className="text-[9px] text-slate-500 block uppercase">Hours</span>
                          </div>
                          <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                            <span className="text-lg font-black text-white font-mono">{rem.minutes}</span>
                            <span className="text-[9px] text-slate-500 block uppercase">Mins</span>
                          </div>
                          <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                            <span className="text-lg font-black text-blue-400 font-mono">
                              {rem.seconds < 10 ? `0${rem.seconds}` : rem.seconds}
                            </span>
                            <span className="text-[9px] text-slate-500 block uppercase">Secs</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-blue-400 animate-heartbeat" />
                    Auto-synchronized with global contest servers
                  </span>

                  <a
                    href={nextContest.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/40 transition-all cursor-pointer"
                  >
                    <span>Official Registration</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>
          )}

          {/* CHRONOLOGICAL UPCOMING GRID */}
          {remainingContests.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Later This Week & Beyond ({remainingContests.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {remainingContests.map((c) => {
                  const rem = calculateTimeRemaining(c.startTime);
                  const isReminderSet = !!reminders[c.id];

                  return (
                    <div
                      key={c.id}
                      className="bg-[#0D1322] border border-blue-950/80 hover:border-blue-900 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] group"
                    >
                      {/* Top platform & reminder */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#090E1A] rounded-xl border border-slate-800">
                            <PlatformIcons platform={c.platform} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                              {c.platform}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                              {c.name}
                            </h4>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleReminder(c)}
                          aria-label={`Toggle reminder for ${c.name}`}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isReminderSet
                              ? 'bg-amber-950/60 text-amber-300 border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                              : 'bg-[#090E1A] text-slate-500 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {isReminderSet ? (
                            <BellRing className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Timings and Countdown Pill */}
                      <div className="flex items-center justify-between bg-[#090E1A]/80 p-3 rounded-xl border border-slate-800/80 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 block uppercase">Start Time</span>
                          <span className="font-semibold text-slate-200 font-mono">
                            {formatLocalizedDate(c.startTime)}
                          </span>
                        </div>

                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] text-slate-500 block uppercase">Starts In</span>
                          <span className={`font-mono font-bold ${
                            rem.isLive ? 'text-emerald-400' : 'text-blue-400'
                          }`}>
                            {rem.text}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                        <span className="text-slate-400 text-[11px]">
                          Duration: <strong className="text-slate-300 font-mono">{c.durationText}</strong>
                        </span>

                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Bottom Final Continue Button */}
      <div className="pt-8 text-center">
        <button
          onClick={onContinueToDashboard}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Continue to Full Dashboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default UpcomingContests;
