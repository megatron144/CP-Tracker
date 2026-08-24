import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import ProductPreview from '../components/ProductPreview';
import { PlatformIcons } from '../components/PlatformIcons';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

    // Store or remove remembered email
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#090D16] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Outer fluid container scaling from 375px to 1440px */}
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

                {/* Social Auth Divider */}
                <div className="relative flex items-center justify-center pt-2">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-[#0D1322] px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Or sign in with
                  </span>
                  <div className="border-t border-slate-800 w-full"></div>
                </div>

                {/* General Account Authentication Shortcut */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('developer@cptracker.io');
                      setPassword('password123');
                    }}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#090E1A] hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <PlatformIcons platform="github" className="w-4 h-4" />
                    <span>Continue with GitHub</span>
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

      {/* Forgot Password Interactive Modal */}
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
