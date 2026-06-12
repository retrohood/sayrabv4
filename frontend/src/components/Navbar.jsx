import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/sayrab.png" alt="Sayrab" className="h-10 w-auto" />
            <span className="font-bold text-xl text-primary-700 hidden sm:block">Sayrab</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
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
                  className="text-sm font-medium text-slate-600 hover:text-primary-700"
                >
                  {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-slate-100">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'text-primary-700 bg-primary-50' : 'text-slate-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-100">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-600"
                  >
                    Dashboard — {user.fullName}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-primary-700"
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
