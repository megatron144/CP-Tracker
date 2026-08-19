import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await signup(name, email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#090D16] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#0D1322] p-8 sm:p-10 rounded-3xl border border-blue-950/80 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-950/50 text-red-300 text-sm p-3.5 rounded-xl border border-red-800/60">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-[#090E1A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
