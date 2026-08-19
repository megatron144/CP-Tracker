import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#0D1322]/90 backdrop-blur-md border-b border-blue-900/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-blue-600/20 group-hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Activity className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                CP<span className="text-blue-500">-Tracker</span>
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-900/40 text-xs text-blue-200">
                  <UserCircle className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-slate-300">{user.name}</span>
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-slate-300 hover:text-white hover:bg-blue-950/50 font-medium px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 font-medium px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-300 hover:text-white font-medium px-3.5 py-1.5 transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl font-medium transition-all text-sm shadow-[0_0_20px_rgba(37,99,235,0.35)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
