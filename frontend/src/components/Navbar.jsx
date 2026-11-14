import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Sparkles, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFundraiserUser } from '../utils/format';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isFundraiser = isFundraiserUser(user);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/start-campaign', label: 'Start a Campaign' },
    { to: '/store', label: 'Merch Store' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/about', label: 'About Us' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#89ca2e] text-[#10182b] shadow-md border-b border-[#7bb926] transition-all">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to={user?.role === 'manufacturer' ? '/manufacturer' : user?.role === 'admin' ? '/admin' : '/'}
            className="flex items-center gap-2.5 shrink-0 group py-1"
          >
            <img
              src="/sayrab.png"
              alt="Sayrab"
              className="h-20 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-2xl text-[#10182b] tracking-tight hidden sm:block">
              Sayrab<span className="text-[#367c35]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#7bb926]/40 p-1.5 rounded-2xl border border-[#367c35]/20">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#10182b] text-white shadow-sm'
                      : 'text-[#10182b] hover:bg-[#10182b]/10 hover:text-[#10182b]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action / Auth Button */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-4 py-2 bg-[#10182b] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#172033] transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-[#89ca2e] animate-pulse"></span>
                  <span className="max-w-[130px] truncate">{user.fullName || 'My Account'}</span>
                  <ChevronDown size={14} className={`transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-[#172033] rounded-2xl shadow-2xl border border-[#e5e9e3] py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-[#e5e9e3]">
                      <p className="text-xs text-[#64748b]">Signed in as</p>
                      <p className="text-sm font-bold truncate text-[#10182b]">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-[#89ca2e]/20 text-[#367c35]">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
                      >
                        <Shield size={14} className="text-[#367c35]" /> Admin Portal
                      </Link>
                    )}

                    {user.role === 'manufacturer' && (
                      <Link
                        to="/manufacturer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
                      >
                        <Sparkles size={14} className="text-[#367c35]" /> Manufacturer Portal
                      </Link>
                    )}

                    <Link
                      to={user.role === 'manufacturer' ? '/manufacturer' : user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
                    >
                      <User size={14} className="text-[#367c35]" />
                      {isFundraiser ? 'Fundraiser Dashboard' : 'Donor Dashboard'}
                    </Link>

                    <div className="border-t border-[#e5e9e3] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2.5 bg-[#10182b] hover:bg-[#172033] text-white text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-[#10182b] hover:bg-[#7bb926]/50 rounded-xl transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu (Contains all 6 items) */}
        {open && (
          <div className="lg:hidden pb-5 pt-2 border-t border-[#7bb926] space-y-1.5 animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#10182b] text-white'
                      : 'text-[#10182b] hover:bg-[#7bb926]/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-[#7bb926] space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-1 text-xs text-[#10182b] font-medium">
                    Signed in as <strong className="font-bold">{user.fullName || user.email}</strong>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-[#10182b] bg-white/40 rounded-xl"
                    >
                      Admin Portal
                    </Link>
                  )}
                  {user.role === 'manufacturer' && (
                    <Link
                      to="/manufacturer"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-[#10182b] bg-white/40 rounded-xl"
                    >
                      Manufacturer Portal
                    </Link>
                  )}
                  <Link
                    to={user.role === 'manufacturer' ? '/manufacturer' : user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm font-bold text-white bg-[#10182b] rounded-xl text-center"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-sm font-bold text-rose-800 hover:text-rose-900"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="block text-center px-4 py-2.5 text-sm font-extrabold text-white bg-[#10182b] rounded-xl shadow-md"
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
