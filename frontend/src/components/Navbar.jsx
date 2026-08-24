import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, UserCircle, Menu, X, Settings } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

const Navbar = () => {
  const { user, logout, updateDisplayName } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleProfileUpdate = (newName) => {
    if (updateDisplayName) {
      updateDisplayName(newName);
    }
  };

  return (
    <nav className="bg-[#0D1322]/90 backdrop-blur-md border-b border-blue-900/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo with Heartbeat Animation */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="p-2 bg-blue-600/20 group-hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Activity className="h-5 w-5 text-blue-400 group-hover:text-blue-300 animate-heartbeat transition-colors" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                CP<span className="text-blue-500">-Tracker</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                {/* User Display Name Pill / Settings trigger */}
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  title="Click to edit Display Name"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 hover:border-blue-500/60 text-xs text-blue-200 hover:text-white transition-all cursor-pointer group shadow-xs"
                >
                  <UserCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">{user.name}</span>
                  <Settings className="w-3 h-3 text-blue-400/80 group-hover:rotate-45 transition-transform" />
                </button>

                <Link 
                  to="/dashboard" 
                  className="text-slate-300 hover:text-white hover:bg-blue-950/50 font-medium px-3.5 py-2 rounded-xl transition-colors text-sm min-h-[44px] inline-flex items-center"
                >
                  Dashboard
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 font-medium px-3.5 py-2 rounded-xl transition-colors text-sm min-h-[44px] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-300 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-slate-800/50 transition-colors text-sm min-h-[44px] inline-flex items-center"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 hover:bg-blue-500 hover:brightness-110 active:scale-[0.98] text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm shadow-[0_0_20px_rgba(37,99,235,0.35)] min-h-[44px] inline-flex items-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button (<640px) */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-slate-800 animate-fade-in-up space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsEditProfileOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-sm font-semibold text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircle className="w-5 h-5 text-blue-400" />
                    <span>{user.name}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-mono">Edit Name →</span>
                </button>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile / Display Name Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={user?.name || ''}
        onUpdateSuccess={handleProfileUpdate}
      />
    </nav>
  );
};

export default Navbar;
