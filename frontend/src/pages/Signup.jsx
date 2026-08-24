import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import ProductPreview from '../components/ProductPreview';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state triggers
  const [emailTouched, setEmailTouched] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pure derived validation
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const isNameValid = trimmedName.length >= 2;
  const isEmailValid = trimmedEmail.length > 0 && EMAIL_REGEX.test(trimmedEmail);
  const emailError = emailTouched 
    ? (!trimmedEmail 
        ? 'Email is required' 
        : (!EMAIL_REGEX.test(trimmedEmail) ? 'Please enter a valid email address (e.g. name@domain.com)' : ''))
    : '';
  const isPasswordValid = password.length >= 6;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setEmailTouched(true);

    if (!isFormValid) return;

    setIsSubmitting(true);
    
    const result = await signup(trimmedName, trimmedEmail, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setGeneralError(result.error || 'Registration failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#090D16] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Outer fluid container */}
      <div className="w-full max-w-6xl animate-fade-in-up">
        
        {/* Mobile/Tablet Compact Product Teaser (<1024px) */}
        <div className="lg:hidden">
          <ProductPreview isCompact={true} />
        </div>

        {/* Main Split-Screen Card */}
        <div className="bg-[#0D1322]/95 backdrop-blur-xl border border-blue-950/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Interactive Sign Up Form */}
          <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-blue-950/80">
            <div className="w-full max-w-md mx-auto space-y-7">
              
              {/* Header */}
              <div className="text-left space-y-2">
                <div className="inline-flex items-center gap-2 p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                  <Activity className="w-7 h-7 text-blue-400 animate-heartbeat" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-slate-400">
                  Track your competitive programming journey in one unified profile.
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

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="signup-name" 
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Full Name <span className="text-blue-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      aria-required="true"
                      className="w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-[#090E1A] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:scale-[1.005]"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label 
                      htmlFor="signup-email" 
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
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={emailTouched && !!emailError}
                      aria-describedby={emailError ? "signup-email-error" : undefined}
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

                  {emailTouched && emailError && (
                    <p 
                      id="signup-email-error" 
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
                      htmlFor="signup-password" 
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Password <span className="text-blue-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Min 6 characters</span>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      aria-required="true"
                      className="w-full min-h-[46px] pl-10 pr-11 py-2.5 bg-[#090E1A] border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:scale-[1.005]"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
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

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all duration-200 cursor-pointer ${
                      !isFormValid || isSubmitting
                        ? 'bg-blue-600/50 opacity-60 cursor-not-allowed border border-blue-500/20'
                        : 'bg-blue-600 hover:bg-blue-500 hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account & Start Tracking</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Login Alternate */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <p className="text-xs sm:text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Preview */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#090D16] via-[#0B101E] to-[#0E162A] relative">
            <ProductPreview isCompact={false} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
