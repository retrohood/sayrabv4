import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  HeartHandshake,
  ExternalLink,
  ShoppingCart,
} from 'lucide-react';
import { useCartCount } from '../../../utils/cart';

export default function DashboardHeader({
  user,
  logout,
  isSidebarOpen,
  setIsSidebarOpen,
  unreadCount = 0,
  onOpenNotifications,
  onOpenCart,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isFundraiser = user?.role === 'fundraiser' || user?.role === 'manager';
  const cartCount = useCartCount(user?._id);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#e5e9e3] shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img
              src="/sayrab.png"
              alt="Sayrab"
              className="h-20 w-auto object-contain py-1"
            />
          </Link>

          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ml-2 ${
            isFundraiser
              ? 'bg-[#89ca2e]/10 text-[#367c35] border-[#89ca2e]/30'
              : 'bg-[#367c35]/10 text-[#367c35] border-[#367c35]/30'
          }">
            {isFundraiser ? (
              <>
                <ShieldCheck size={14} className="text-[#367c35]" />
                <span>Verified Fundraiser</span>
              </>
            ) : (
              <>
                <HeartHandshake size={14} className="text-[#367c35]" />
                <span>Donor Portal</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Quick Links, Notifications & Profile Menu */}
        <div className="flex items-center gap-3">
          <Link
            to="/campaigns"
            className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#367c35] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#f7f9f5]"
          >
            <span>Public Site</span>
            <ExternalLink size={13} />
          </Link>

          {/* Notification Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] border border-[#e5e9e3] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#89ca2e] text-white text-[10px] font-black h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button (Buyer / Donor) */}
          {!isFundraiser && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] border border-[#e5e9e3] transition-colors cursor-pointer group"
              aria-label="View shopping cart"
              title="Shopping Cart"
            >
              <ShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#367c35] text-white text-[10px] font-black h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-[#e5e9e3] hover:bg-[#f7f9f5] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#89ca2e]/20 border border-[#89ca2e]/40 text-[#367c35] font-bold text-xs flex items-center justify-center">
                {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block text-left leading-tight pr-1">
                <span className="block text-xs font-bold text-[#10182b] truncate max-w-[120px]">
                  {user?.fullName || 'My Account'}
                </span>
                <span className="block text-[10px] text-[#64748b] capitalize">
                  {user?.role || 'User'}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#64748b]" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#e5e9e3] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#e5e9e3]">
                  <p className="text-xs font-bold text-[#10182b] truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-[#64748b] truncate">{user?.email}</p>
                </div>

                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <ExternalLink size={14} className="text-[#64748b]" />
                  <span>Visit Homepage</span>
                </Link>

                {!isFundraiser && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onOpenCart) onOpenCart();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs text-[#10182b] hover:bg-[#f7f9f5] transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart size={14} className="text-[#367c35]" />
                      <span>My Shopping Cart</span>
                    </span>
                    {cartCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#367c35] text-white font-black">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
