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
    <header className="h-20 px-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize">
            {getTitle()}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Sayrab Central Administration &bull; Automated 50/45/5 Split System
          </p>
        </div>
      </div>

      {/* Right section: Search, Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Filter/Search input */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search records, orgs, users..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-colors"
          />
        </div>

        {/* View Public Site button */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Open Public Website"
        >
          <span>Live Site</span>
          <ExternalLink size={14} />
        </Link>

        {/* Notification Bell with Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Admin Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onMarkNotificationRead('all')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => onMarkNotificationRead(n._id)}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        !n.isRead
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-l-2 border-emerald-500'
                          : 'bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">Just now</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">No new notifications</p>
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
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-emerald-600/20">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {user?.fullName || 'Administrator'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Super Admin
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.fullName || 'Admin User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@sayrab.com'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
