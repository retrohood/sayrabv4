import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  LogOut,
  User,
  ShieldCheck,
  CheckCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminHeader({
  activeTab,
  subFilter,
  onOpenSidebar,
  notifications,
  onMarkNotificationRead,
  globalSearch,
  setGlobalSearch,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Overview & Platform KPIs';
      case 'organizations':
        return subFilter && subFilter !== 'all'
          ? `Organizations — ${subFilter.charAt(0).toUpperCase() + subFilter.slice(1)}`
          : 'Organization Verification & Governance';
      case 'users':
        return 'Platform User Directory & Access Control';
      case 'campaigns':
        return 'Campaign Oversight & Moderation';
      case 'orders':
        return 'Order Management & Fulfillment Tracking';
      case 'transactions':
        return 'Payment Transactions & Fraud Monitoring';
      case 'payouts':
        return 'Withdrawal & Payout Management (50/45/5 Split)';
      case 'manufacturers':
        return subFilter && subFilter !== 'partners'
          ? `Manufacturers — ${subFilter.charAt(0).toUpperCase() + subFilter.slice(1)}`
          : 'Manufacturing Partners & Capacity';
      case 'reports':
        return 'Financial & Operational Reports';
      case 'notifications':
        return 'System Notifications & Audit Log';
      case 'settings':
        return 'Platform Configuration & Commission Rules';
      default:
        return 'Admin Portal';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="h-20 px-4 sm:px-8 bg-white border-b border-[#e5e9e3] flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#10182b] tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-xs text-[#64748b] hidden sm:block">
            Sayrab Central Administration &bull; Automated 50/45/5 Revenue Split Governance
          </p>
        </div>
      </div>

      {/* Right section: Search, Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Filter/Search input */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search records, orgs, users..."
            className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] focus:border-[#89ca2e] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] outline-none transition-colors"
          />
        </div>

        {/* View Public Site button */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#64748b] hover:text-[#367c35] hover:bg-[#f7f9f5] rounded-xl transition-colors border border-transparent hover:border-[#e5e9e3]"
          title="Open Public Website"
        >
          <span>Live Site</span>
          <ExternalLink size={13} />
        </Link>

        {/* Notification Bell with Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] border border-[#e5e9e3] relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full bg-[#89ca2e] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e5e9e3] rounded-2xl shadow-xl z-50 p-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3] mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#10182b]">Admin Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#89ca2e]/20 text-[#367c35] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onMarkNotificationRead('all')}
                  className="text-xs text-[#367c35] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => onMarkNotificationRead(n._id)}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                        !n.isRead
                          ? 'bg-[#89ca2e]/10 border-[#89ca2e]/30'
                          : 'bg-[#f7f9f5] border-[#e5e9e3]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#10182b]">{n.title}</span>
                        <span className="text-[10px] text-[#64748b] shrink-0">Recent</span>
                      </div>
                      <p className="text-[#64748b] mt-1 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-[#64748b]">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Admin Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-[#e5e9e3] hover:bg-[#f7f9f5] transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-[#89ca2e]/20 text-[#367c35] border border-[#89ca2e]/40 font-bold flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <div className="text-xs font-bold text-[#10182b] leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Administrator'}
              </div>
              <div className="text-[10px] text-[#367c35] font-semibold">
                Super Admin
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e5e9e3] rounded-2xl shadow-xl z-50 p-2 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-[#e5e9e3] mb-1">
                <p className="text-xs font-bold text-[#10182b]">{user?.fullName || 'Admin User'}</p>
                <p className="text-[11px] text-[#64748b] truncate">{user?.email || 'admin@sayrab.com'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
