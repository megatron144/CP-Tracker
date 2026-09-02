import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Activity, Lock, Mail, Eye, EyeOff, AlertCircle, 
  CheckCircle2, Loader2, KeyRound, Sparkles, 
  Calendar, TrendingUp, Target, Flame, Zap, BarChart3, 
  ShieldCheck, Radio, Layers, LayoutDashboard, 
  ChevronDown, ExternalLink, Clock, Trophy, Award, 
  HelpCircle, ArrowUpRight, Check
} from 'lucide-react';
import ProductPreview from '../components/ProductPreview';
import { PlatformIcons } from '../components/PlatformIcons';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Safe Brand Icons
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
  </svg>
);

// Mock Platform Mastery Data for Donut Visualizers
const PLATFORM_MASTERY_MOCK = [
  {
    platform: 'leetcode',
    name: 'LeetCode',
    total: 1482,
    segments: [
      { label: 'Easy', count: 480, color: '#10B981', pct: 32 },
      { label: 'Medium', count: 742, color: '#F59E0B', pct: 50 },
      { label: 'Hard', count: 260, color: '#F43F5E', pct: 18 }
    ]
  },
  {
    platform: 'codeforces',
    name: 'Codeforces',
    total: 435,
    segments: [
      { label: 'Div. 3', count: 210, color: '#3B82F6', pct: 48 },
      { label: 'Div. 2', count: 180, color: '#6366F1', pct: 41 },
      { label: 'Div. 1', count: 45, color: '#A855F7', pct: 11 }
    ]
  },
  {
    platform: 'codechef',
    name: 'CodeChef',
    total: 247,
    segments: [
      { label: '1★ - 2★', count: 120, color: '#EAB308', pct: 49 },
      { label: '3★ - 4★', count: 95, color: '#F97316', pct: 38 },
      { label: '5★+', count: 32, color: '#EF4444', pct: 13 }
    ]
  },
  {
    platform: 'atcoder',
    name: 'AtCoder',
    total: 250,
    segments: [
      { label: 'ABC (Beginner)', count: 160, color: '#06B6D4', pct: 64 },
      { label: 'ARC (Regular)', count: 72, color: '#38BDF8', pct: 29 },
      { label: 'AGC (Grand)', count: 18, color: '#0284C7', pct: 7 }
    ]
  },
  {
    platform: 'gfg',
    name: 'GeeksforGeeks',
    total: 805,
    segments: [
      { label: 'Basic & Easy', count: 400, color: '#10B981', pct: 50 },
      { label: 'Medium', count: 320, color: '#14B8A6', pct: 40 },
      { label: 'Hard', count: 85, color: '#059669', pct: 10 }
    ]
  }
];

// Mock Upcoming Contests
const UPCOMING_CONTESTS_MOCK = [
  {
    id: 1,
    platform: 'codeforces',
    name: 'Codeforces Round 998 (Div. 2)',
    time: 'Tomorrow, 08:05 PM IST',
    duration: '2.0 hours',
    inHours: '14h 22m',
    badge: 'Rated for Div. 2'
  },
  {
    id: 2,
    platform: 'leetcode',
    name: 'Weekly Contest 438',
    time: 'Sunday, 08:00 AM IST',
    duration: '1.5 hours',
    inHours: '2d 18h',
    badge: 'Rated Global'
  },
  {
    id: 3,
    platform: 'codechef',
    name: 'Starters 174 (Div. 2 & 3)',
    time: 'Wednesday, 08:00 PM IST',
    duration: '2.0 hours',
    inHours: '3d 04h',
    badge: 'Rated for 4★ & Below'
  },
  {
    id: 4,
    platform: 'atcoder',
    name: 'AtCoder Beginner Contest 392',
    time: 'Saturday, 05:30 PM IST',
    duration: '100 mins',
    inHours: '4d 06h',
    badge: 'Rated for < 2000'
  }
];

// Mock Connected Platform Accounts
const CONNECTED_PLATFORMS_MOCK = [
  {
    platform: 'leetcode',
    name: 'LeetCode',
    handle: 'alex_coder',
    solved: '1,482',
    currentRating: '2,150',
    maxRating: '2,190',
    contests: '38',
    tier: 'Guardian (Top 1.2%)',
    topFinishes: [
      { rank: '48th', name: 'Biweekly Contest 142', date: 'Jan 2026' },
      { rank: '112th', name: 'Weekly Contest 428', date: 'Dec 2025' }
    ]
  },
  {
    platform: 'codeforces',
    name: 'Codeforces',
    handle: 'alex_cf',
    solved: '435',
    currentRating: '1,840',
    maxRating: '1,920',
    contests: '44',
    tier: 'Candidate Master',
    topFinishes: [
      { rank: '84th', name: 'Round 982 (Div. 2)', date: 'Jan 2026' },
      { rank: '142nd', name: 'Educational Round 171', date: 'Nov 2025' }
    ]
  },
  {
    platform: 'codechef',
    name: 'CodeChef',
    handle: 'alex_chef',
    solved: '247',
    currentRating: '1,980',
    maxRating: '2,015',
    contests: '26',
    tier: '4★ Division 1',
    topFinishes: [
      { rank: '32nd', name: 'Starters 168 (Div. 2)', date: 'Dec 2025' },
      { rank: '58th', name: 'Cook-Off 159', date: 'Oct 2025' }
    ]
  },
  {
    platform: 'atcoder',
    name: 'AtCoder',
    handle: 'alex_atc',
    solved: '250',
    currentRating: '1,620',
    maxRating: '1,680',
    contests: '22',
    tier: 'Cyan / 4-kyu',
    topFinishes: [
      { rank: '184th', name: 'ABC 384', date: 'Jan 2026' },
      { rank: '210th', name: 'ARC 188', date: 'Nov 2025' }
    ]
  },
  {
    platform: 'gfg',
    name: 'GeeksforGeeks',
    handle: 'alex_gfg',
    solved: '805',
    currentRating: '2,040',
    maxRating: '2,080',
    contests: '12',
    tier: 'Institute Rank #1',
    topFinishes: [
      { rank: '14th', name: 'GFG Weekly Contest 180', date: 'Jan 2026' },
      { rank: '29th', name: 'Job-A-Thon 36', date: 'Dec 2025' }
    ]
  }
];

// FAQ Data
const FAQ_ITEMS = [
  {
    question: "Is CP Tracker free to use?",
    answer: "Yes! All core features—including automated multi-platform syncing, unified telemetry graphs, contest radar, and public profile sharing—are 100% free forever. Optional advanced telemetry and team benchmarking features will be available later."
  },
  {
    question: "Which platforms does it sync with?",
    answer: "CP Tracker seamlessly integrates with Codeforces, LeetCode, AtCoder, CodeChef, and GeeksforGeeks. We are continuously adding more platforms (such as HackerRank and Kattis) based on community feedback."
  },
  {
    question: "How does Contest Radar know which contests to show?",
    answer: "Contest Radar continuously queries and normalizes official scheduling APIs and public contest feeds across all verified platforms, automatically converting start times to your local timezone."
  },
  {
    question: "How do I verify a platform account?",
    answer: "Depending on the platform, you either paste a short unique verification token into your profile bio / about-me section or make a quick throwaway submission on an unrated starter problem. CP Tracker confirms ownership automatically in seconds."
  },
  {
    question: "How often does my data refresh?",
    answer: "Telemetry data refreshes in near real-time. New problem submissions, rating changes, and contest rank updates are synchronized automatically within minutes of official publication."
  },
  {
    question: "Is my data private?",
    answer: "Yes, absolute privacy is guaranteed. Your personal telemetry dashboard is private by default. Only you have access to your private metrics unless you explicitly choose to generate and share your custom public portfolio link."
  }
];

const Login = () => {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('cptracker_remember_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return !!localStorage.getItem('cptracker_remember_email');
    } catch {
      return false;
    }
  });
  
  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  
  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Showcase section active tab & filters
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview'); // 'overview' | 'contests' | 'rating' | 'platforms'
  const [ratingTimeRange, setRatingTimeRange] = useState('1Y'); // '6M' | '1Y' | 'All'
  const [contestFilter, setContestFilter] = useState('all'); // 'all' | 'codeforces' | 'leetcode' | 'codechef' | 'atcoder'
  
  // FAQ accordion state (one open at a time)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pure derived validation
  const trimmedEmail = email.trim();
  const isEmailValid = trimmedEmail.length > 0 && EMAIL_REGEX.test(trimmedEmail);
  const emailError = emailTouched 
    ? (!trimmedEmail 
        ? 'Email is required' 
        : (!EMAIL_REGEX.test(trimmedEmail) ? 'Please enter a valid email address (e.g. name@domain.com)' : ''))
    : '';

  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setEmailTouched(true);

    if (!isFormValid || isSubmitting || isLoginSuccess) return;

    setIsSubmitting(true);

    if (rememberMe) {
      localStorage.setItem('cptracker_remember_email', trimmedEmail);
    } else {
      localStorage.removeItem('cptracker_remember_email');
    }
    
    const result = await login(trimmedEmail, password);
    
    if (result.success) {
      setIsLoginSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { state: { showUpcomingContests: true, isPostLogin: true } });
      }, 650);
    } else {
      setGeneralError(result.error || 'Invalid credentials. Please verify and try again.');
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(forgotEmail.trim())) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2800);
  };

  // Filtered contests
  const filteredContests = UPCOMING_CONTESTS_MOCK.filter(c => {
    if (contestFilter === 'all') return true;
    return c.platform === contestFilter;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#090D16] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center select-text">
      
      {/* =========================================================================
          1. TOP SECTION: Split-Screen Login Card (Unchanged Behavior & Styling)
          ========================================================================= */}
      <div className="w-full max-w-6xl animate-fade-in-up">
        
        {/* Mobile/Tablet Compact Product Teaser Banner (<1024px) */}
        <div className="lg:hidden">
          <ProductPreview isCompact={true} />
        </div>

        {/* Main Split-Screen Card */}
        <div className="bg-[#0D1322]/95 backdrop-blur-xl border border-blue-950/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Interactive Login Form */}
          <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-blue-950/80">
            <div className="w-full max-w-md mx-auto space-y-7">
              
              {/* Header with Activity Heartbeat Icon */}
              <div className="text-left space-y-2">
                <div className="inline-flex items-center gap-2 p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                  <Activity className="w-7 h-7 text-blue-400 animate-heartbeat" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-400">
                  Access your synchronized CP telemetry and contest stats.
                </p>
              </div>

              {/* Server/General Error Banner */}
              {generalError && (
                <div 
                  role="alert" 
                  className="flex items-start gap-3 bg-red-950/60 text-red-200 text-xs sm:text-sm p-3.5 rounded-xl border border-red-800/80 animate-fade-in-up shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{generalError}</div>
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label 
                      htmlFor="login-email" 
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Email address <span className="text-blue-400">*</span>
                    </label>
                    {emailTouched && isEmailValid && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 animate-fade-in-up">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                      </span>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={emailTouched && !!emailError}
                      aria-describedby={emailError ? "email-error-msg" : undefined}
                      className={`w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-[#090E1A] border rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
                        emailTouched && emailError
                          ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:scale-[1.005]'
                      }`}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                    />
                  </div>

                  {/* Real-time Email Inline Validation Message */}
                  {emailTouched && emailError && (
                    <p 
                      id="email-error-msg" 
                      role="alert" 
                      className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-fade-in-up"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label 
                      htmlFor="login-password" 
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Password <span className="text-blue-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      aria-required="true"
                      className="w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-[#090E1A] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:scale-[1.005]"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* Show/Hide Password Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-400 focus:outline-none transition-colors cursor-pointer min-w-[44px] justify-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-1">
                  <label 
                    htmlFor="remember-me" 
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 cursor-pointer select-none group min-h-[32px]"
                  >
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-[#090E1A] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                    />
                    <span className="group-hover:text-white transition-colors">Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting || isLoginSuccess}
                    className={`w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer ${
                      isLoginSuccess
                        ? 'bg-emerald-600 border border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-[1.01]'
                        : !isFormValid || isSubmitting
                        ? 'bg-blue-600/50 opacity-60 cursor-not-allowed border border-blue-500/20'
                        : 'bg-blue-600 hover:bg-blue-500 hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                    }`}
                  >
                    {isLoginSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-100 animate-bounce" />
                        <span className="font-bold">Signed in!</span>
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign in to Dashboard</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Sign up alternate footer */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <p className="text-xs sm:text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Product Showcase & Feature Carousel (Desktop >=1024px) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#090D16] via-[#0B101E] to-[#0E162A] relative">
            <ProductPreview isCompact={false} />
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. DASHBOARD FEATURE SHOWCASE SECTION: "Everything in one dashboard"
          ========================================================================= */}
      <section className="w-full max-w-6xl mt-14 sm:mt-20 lg:mt-24 space-y-8 animate-fade-in-up">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-xs font-semibold text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Command Center Preview</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">one dashboard</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Your unified competitive programming command center & live portfolio analytics.
          </p>
        </div>

        {/* Dashboard Preview Shell Card */}
        <div className="bg-[#0D1322]/95 backdrop-blur-xl border border-blue-950/80 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] space-y-6">
          
          {/* Dashboard Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/90">
            <div className="flex flex-wrap items-center gap-2 bg-[#090E1A] p-1.5 rounded-2xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveDashboardTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeDashboardTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Unified Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDashboardTab('contests')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeDashboardTab === 'contests'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Upcoming Contests</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  4 Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDashboardTab('rating')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeDashboardTab === 'rating'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Rating & Mastery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDashboardTab('platforms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeDashboardTab === 'platforms'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connected Platforms</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  5/5
                </span>
              </button>
            </div>

            {/* Live Telemetry Ping */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All platform nodes synced</span>
            </div>
          </div>

          {/* TAB 1: UNIFIED OVERVIEW */}
          {activeDashboardTab === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Top 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-[#090E1A]/95 p-4 rounded-2xl border border-blue-900/40 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Linked Profiles</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">5 / 5</div>
                  <span className="text-[11px] text-emerald-400 mt-1 inline-block">100% verified & active</span>
                </div>

                <div className="bg-[#090E1A]/95 p-4 rounded-2xl border border-blue-900/40 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Solved</span>
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">2,184</div>
                  <span className="text-[11px] text-blue-400 mt-1 inline-block">+34 solved this month</span>
                </div>

                <div className="bg-[#090E1A]/95 p-4 rounded-2xl border border-blue-900/40 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Rating</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">2,240</div>
                  <span className="text-[11px] text-slate-400 mt-1 inline-block">Candidate Master (CF)</span>
                </div>

                <div className="bg-[#090E1A]/95 p-4 rounded-2xl border border-blue-900/40 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Contests</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">142</div>
                  <span className="text-[11px] text-rose-400 mt-1 inline-block">98.4% participation rate</span>
                </div>
              </div>

              {/* Multi-Platform Contest Rating Graph */}
              <div className="bg-[#090E1A]/95 p-5 sm:p-6 rounded-2xl border border-blue-900/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Multi-Platform Contest Rating Graph</span>
                    </h3>
                    <p className="text-xs text-slate-400">Unified rating trajectories normalized across competitive platforms</p>
                  </div>

                  {/* Time Range Toggle */}
                  <div className="flex items-center gap-1 bg-[#0D1322] p-1 rounded-xl border border-slate-800 text-xs">
                    {['6M', '1Y', 'All'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setRatingTimeRange(range)}
                        className={`px-3 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                          ratingTimeRange === range
                            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Rating Curves */}
                <div className="relative h-48 sm:h-60 w-full bg-[#0D1322]/80 rounded-xl p-3 border border-slate-800/80">
                  <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cfGlowFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lcGlowFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    <line x1="20" y1="35" x2="480" y2="35" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="20" y1="80" x2="480" y2="80" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="20" y1="125" x2="480" y2="125" stroke="#1E293B" strokeDasharray="3 3" strokeWidth="0.8" />

                    {/* Codeforces Line & Area (Blue) */}
                    <path d="M 30 140 Q 140 120 250 90 T 470 45 L 470 170 L 30 170 Z" fill="url(#cfGlowFull)" />
                    <path d="M 30 140 Q 140 120 250 90 T 470 45" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" className="animate-chart-draw" />
                    <circle cx="470" cy="45" r="4" fill="#3B82F6" stroke="#fff" strokeWidth="1.5" />

                    {/* LeetCode Line & Area (Amber) */}
                    <path d="M 30 125 Q 140 95 250 70 T 470 30 L 470 170 L 30 170 Z" fill="url(#lcGlowFull)" />
                    <path d="M 30 125 Q 140 95 250 70 T 470 30" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="animate-chart-draw" />
                    <circle cx="470" cy="30" r="4" fill="#F59E0B" stroke="#fff" strokeWidth="1.5" />

                    {/* CodeChef Line (Yellow) */}
                    <path d="M 30 150 Q 140 135 250 110 T 470 65" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />
                    <circle cx="470" cy="65" r="3.5" fill="#EAB308" stroke="#fff" strokeWidth="1" />

                    {/* AtCoder Line (Cyan) */}
                    <path d="M 30 160 Q 140 145 250 130 T 470 95" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="470" cy="95" r="3.5" fill="#06B6D4" stroke="#fff" strokeWidth="1" />

                    {/* GeeksforGeeks Line (Emerald) */}
                    <path d="M 30 135 Q 140 115 250 85 T 470 55" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="470" cy="55" r="3.5" fill="#10B981" stroke="#fff" strokeWidth="1" />
                  </svg>

                  {/* Rating Legend Badges */}
                  <div className="absolute top-3 right-3 flex flex-wrap gap-2 text-[11px] font-mono bg-[#090D16]/90 p-2 rounded-xl border border-slate-800 shadow-lg">
                    <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> LeetCode 2,150</span>
                    <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Codeforces 1,840</span>
                    <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> CodeChef 1,980</span>
                    <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> AtCoder 1,620</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> GFG 2,040</span>
                  </div>
                </div>
              </div>

              {/* 5 Individual Platform Mastery Charts (Donut Visualizers) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Individual Platform Mastery Charts</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Difficulty & Division Breakdowns</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {PLATFORM_MASTERY_MOCK.map((item, idx) => (
                    <div key={idx} className="bg-[#090E1A]/95 p-4 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <PlatformIcons platform={item.platform} className="w-5 h-5" />
                            <span className="text-xs font-bold text-white">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-blue-400">{item.total}</span>
                        </div>

                        {/* Donut SVG Visualizer */}
                        <div className="relative w-24 h-24 mx-auto my-2">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#1E293B" strokeWidth="4" />
                            {/* Segment 1 */}
                            <circle 
                              cx="18" cy="18" r="14" fill="none" stroke={item.segments[0].color} strokeWidth="4"
                              strokeDasharray={`${item.segments[0].pct} 100`} strokeDashoffset="0"
                            />
                            {/* Segment 2 */}
                            <circle 
                              cx="18" cy="18" r="14" fill="none" stroke={item.segments[1].color} strokeWidth="4"
                              strokeDasharray={`${item.segments[1].pct} 100`} strokeDashoffset={`-${item.segments[0].pct}`}
                            />
                            {/* Segment 3 */}
                            <circle 
                              cx="18" cy="18" r="14" fill="none" stroke={item.segments[2].color} strokeWidth="4"
                              strokeDasharray={`${item.segments[2].pct} 100`} strokeDashoffset={`-${item.segments[0].pct + item.segments[1].pct}`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">Solved</span>
                            <span className="text-xs font-extrabold text-white font-mono">{item.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Legend Rows */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                        {item.segments.map((seg, sIdx) => (
                          <div key={sIdx} className="flex justify-between items-center text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}></span>
                              <span>{seg.label}</span>
                            </span>
                            <span className="font-semibold text-slate-200">{seg.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Practice Streak Heatmap + Problems Solved Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Practice & Activity Streak Heatmap */}
                <div className="lg:col-span-7 bg-[#090E1A]/95 p-5 rounded-2xl border border-blue-900/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Practice & Activity Streak</span>
                      </h4>
                      <p className="text-xs text-slate-400">Multi-platform submission consistency heatmap</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400/20" /> 42 Days Active
                      </span>
                    </div>
                  </div>

                  {/* GitHub-style Heatmap Grid */}
                  <div className="p-3 bg-[#0D1322] rounded-xl border border-slate-800/80 overflow-x-auto">
                    <div className="flex gap-1 min-w-[380px]">
                      {Array.from({ length: 24 }).map((_, col) => (
                        <div key={col} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }).map((_, row) => {
                            const intensity = (col * 7 + row) % 5;
                            const colors = ['bg-[#131B2E]', 'bg-emerald-950', 'bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400'];
                            return (
                              <div
                                key={row}
                                className={`w-2.5 h-2.5 rounded-xs transition-colors ${colors[intensity]}`}
                                title={`Activity level ${intensity}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>268 active practice days in last year</span>
                    <span className="text-emerald-400">Longest Streak: 89 days</span>
                  </div>
                </div>

                {/* Problems Solved Volume Bars */}
                <div className="lg:col-span-5 bg-[#090E1A]/95 p-5 rounded-2xl border border-blue-900/40 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>Problems Solved Volume</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">2,184 Total</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>LeetCode</span>
                        <span>1,482 (68%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#0D1322] rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>GeeksforGeeks</span>
                        <span>805 (37%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#0D1322] rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '37%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Codeforces</span>
                        <span>435 (20%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#0D1322] rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>AtCoder & CodeChef</span>
                        <span>497 (23%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#0D1322] rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: UPCOMING CONTESTS / CONTEST RADAR */}
          {activeDashboardTab === 'contests' && (
            <div className="space-y-5 animate-fade-in-up">
              
              {/* Post-Login Briefing Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/50 p-4 sm:p-5 rounded-2xl border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 shrink-0">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Post-Login Briefing</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Sync
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      You have 4 rounds scheduled across your linked platforms in the next 72 hours.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-blue-300 bg-blue-950/90 px-3 py-1.5 rounded-xl border border-blue-800 shrink-0">
                  Auto-timezone: IST (UTC+5:30)
                </div>
              </div>

              {/* Platform Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', name: 'All Platforms', count: 4 },
                  { id: 'codeforces', name: 'Codeforces', count: 1 },
                  { id: 'leetcode', name: 'LeetCode', count: 1 },
                  { id: 'codechef', name: 'CodeChef', count: 1 },
                  { id: 'atcoder', name: 'AtCoder', count: 1 }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setContestFilter(pill.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      contestFilter === pill.id
                        ? 'bg-blue-600/90 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-[#090E1A] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{pill.name}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#0D1322] text-[10px] font-mono border border-slate-800">
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Contests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredContests.map((contest) => (
                  <div 
                    key={contest.id}
                    className="bg-[#090E1A]/95 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformIcons platform={contest.platform} className="w-5 h-5" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                            {contest.platform}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-900/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Starts in {contest.inHours}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{contest.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{contest.time} • Length: {contest.duration}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-blue-300 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
                        {contest.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert("Auto-reminder set! You'll be notified 15 minutes before contest kickoff.")}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Set Reminder</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: RATING TIMELINE & MASTERY */}
          {activeDashboardTab === 'rating' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-[#090E1A]/95 p-5 sm:p-6 rounded-2xl border border-blue-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Rating Milestones & Progression Tiers</span>
                    </h3>
                    <p className="text-xs text-slate-400">Historical milestone breakthroughs and percentile trajectory</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800/60">
                    Top 2.1% Global Tier
                  </span>
                </div>

                {/* Milestone Progression Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#0D1322] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Milestone 1</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Knight Tier Achieved</h4>
                    <span className="text-xs font-mono text-amber-400">LeetCode 1,850 • Nov 2025</span>
                  </div>

                  <div className="bg-[#0D1322] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Milestone 2</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Candidate Master</h4>
                    <span className="text-xs font-mono text-blue-400">Codeforces 1,920 • Dec 2025</span>
                  </div>

                  <div className="bg-[#0D1322] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Milestone 3</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Guardian Master (Active)</h4>
                    <span className="text-xs font-mono text-emerald-400">LeetCode 2,150 • Jan 2026</span>
                  </div>
                </div>

                {/* Topic Mastery Distribution */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Algorithmic Topic Mastery Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-[#0D1322] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Dynamic Prog.</span>
                      <span className="text-sm font-bold text-blue-400">312 Solved</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[85%]"></div>
                      </div>
                    </div>

                    <div className="bg-[#0D1322] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Graphs & Trees</span>
                      <span className="text-sm font-bold text-indigo-400">240 Solved</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[78%]"></div>
                      </div>
                    </div>

                    <div className="bg-[#0D1322] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Greedy & Math</span>
                      <span className="text-sm font-bold text-emerald-400">198 Solved</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[90%]"></div>
                      </div>
                    </div>

                    <div className="bg-[#0D1322] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Segment Trees & Binary</span>
                      <span className="text-sm font-bold text-rose-400">145 Solved</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full w-[65%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED PLATFORMS */}
          {activeDashboardTab === 'platforms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
              {CONNECTED_PLATFORMS_MOCK.map((acc, idx) => (
                <div 
                  key={idx}
                  className="bg-[#090E1A]/95 p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)] transition-all duration-300 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <PlatformIcons platform={acc.platform} className="w-6 h-6" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                        <span className="text-xs text-slate-400 font-mono">@{acc.handle}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  </div>

                  {/* 4 Stat Tiles */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Solved</span>
                      <span className="text-sm font-bold text-white block">{acc.solved}</span>
                    </div>
                    <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Rating</span>
                      <span className="text-sm font-bold text-blue-400 block">{acc.currentRating}</span>
                    </div>
                    <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Contests</span>
                      <span className="text-sm font-bold text-white block">{acc.contests}</span>
                    </div>
                    <div className="bg-[#0D1322] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Max Rating</span>
                      <span className="text-sm font-bold text-amber-400 block">{acc.maxRating}</span>
                    </div>
                  </div>

                  {/* Top Contest Finishes */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-2 font-mono">
                      Top Contest Finishes
                    </span>
                    <div className="space-y-1.5">
                      {acc.topFinishes.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-center justify-between text-xs bg-[#0D1322]/80 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-300 text-[11px] truncate max-w-[140px]">{f.name}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
                            Rank {f.rank}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          3. FAQ SECTION (Accordion Style with useState)
          ========================================================================= */}
      <section className="w-full max-w-4xl mt-16 sm:mt-24 space-y-8 animate-fade-in-up">
        
        {/* FAQ Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-xs font-semibold text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Questions</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to know about syncing, account verification, and competitive telemetry.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-[#0D1322]/90 border border-blue-950/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-800/60 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 transition-transform duration-300 shrink-0 ${isOpen ? 'transform rotate-180 bg-blue-600/20 border-blue-400/40' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-fade-in-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          4. FOOTER & CONTACT SECTION
          ========================================================================= */}
      <footer className="w-full max-w-6xl mt-20 sm:mt-28 pt-8 pb-6 border-t border-slate-800/80 flex flex-col items-center space-y-5 text-center animate-fade-in-up">
        
        {/* Social & Contact Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/megatron144"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile (megatron144)"
            className="p-2.5 bg-[#0D1322] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-xl border border-slate-800 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
          >
            <GithubIcon className="w-5 h-5" />
          </a>

          <a
            href="https://www.linkedin.com/in/aditya-raj26/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile (aditya-raj26)"
            className="p-2.5 bg-[#0D1322] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-xl border border-slate-800 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>

          <a
            href="mailto:adityarajj6811@gmail.com"
            aria-label="Send Email to adityarajj6811@gmail.com"
            className="p-2.5 bg-[#0D1322] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-xl border border-slate-800 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Built-by attribution */}
        <p className="text-xs sm:text-sm text-slate-400">
          Built by <span className="font-semibold text-slate-200">Aditya Raj</span> — feel free to reach out.
        </p>

        {/* Copyright notice & branding */}
        <p className="text-[11px] text-slate-500 font-mono">
          © {new Date().getFullYear()} CP Tracker • Modern Competitive Programming Telemetry & Live Portfolio
        </p>
      </footer>

      {/* =========================================================================
          5. FORGOT PASSWORD MODAL (Preserved Unchanged)
          ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0D1322] border border-blue-900/60 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">Enter your email to receive recovery instructions</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-emerald-200">Reset instructions sent!</h4>
                <p className="text-xs text-emerald-300/80">
                  If an account exists for {forgotEmail}, you will receive an email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Your account email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#090E1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
