import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">CP-Tracker</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Hello, {user.name}
                </span>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors text-sm">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-2 rounded-md transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 transition-colors text-sm">
                  Log in
                </Link>
                <Link to="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm">
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
