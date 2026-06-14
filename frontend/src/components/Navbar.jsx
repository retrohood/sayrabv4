import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/start-campaign', label: 'Start a Campaign' },
  { to: '/store', label: 'Merchandise Store' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About Us' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#89ca2e' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/sayrab.png" alt="Sayrab" className="h-20 w-auto" />
            <span className="font-bold text-xl text-white hidden sm:block drop-shadow-sm">Sayrab</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/20'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-white/90 hover:text-white"
                >
                  {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-white/30 rounded-lg hover:bg-white/90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-semibold text-slate-800 bg-white rounded-lg hover:bg-white/90 transition-colors shadow-sm"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-white/20">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'text-white bg-white/20' : 'text-white/90'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-2 border-t border-white/20">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm text-white/90"
                  >
                    Dashboard — {user.fullName}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-100 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-white"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
