import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Megaphone,
  ShoppingBag,
  CreditCard,
  Coins,
  Factory,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Clock,
  Ban,
  CheckCircle2,
  FileCheck2,
  Truck,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  subFilter,
  setSubFilter,
  kpis,
  isOpen,
  setIsOpen,
}) {
  const [orgOpen, setOrgOpen] = useState(true);
  const [manOpen, setManOpen] = useState(true);

  const handleNav = (tab, sub = null) => {
    setActiveTab(tab);
    if (sub !== null) setSubFilter(sub);
    setIsOpen(false);
  };

  const navItemClass = (tab, sub = null) => {
    const isActive =
      sub !== null
        ? activeTab === tab && subFilter === sub
        : activeTab === tab && (subFilter === null || subFilter === 'all');
    return `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
    }`;
  };

  const subItemClass = (tab, sub) => {
    const isActive = activeTab === tab && subFilter === sub;
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600 pl-2.5 dark:bg-emerald-950/40 dark:text-emerald-300'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
    }`;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                Sayrab <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold uppercase tracking-wider">Admin</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Platform Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
          {/* Dashboard */}
          <div onClick={() => handleNav('dashboard', 'all')} className={navItemClass('dashboard', 'all')}>
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </div>

          {/* Organizations Tree */}
          <div className="space-y-1 pt-1">
            <div
              onClick={() => setOrgOpen(!orgOpen)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <div
                className="flex items-center gap-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav('organizations', 'all');
                }}
              >
                <Building2 size={18} className={activeTab === 'organizations' ? 'text-emerald-600' : ''} />
                <span className={activeTab === 'organizations' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>Organizations</span>
              </div>
              <div className="flex items-center gap-1.5">
                {kpis?.pendingVerifications > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    {kpis.pendingVerifications}
                  </span>
                )}
                {orgOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>

            {orgOpen && (
              <div className="pl-6 pr-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 py-1">
                <div onClick={() => handleNav('organizations', 'pending')} className={subItemClass('organizations', 'pending')}>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-amber-500" />
                    <span>Pending Verification</span>
                  </div>
                  {kpis?.pendingVerifications > 0 && (
                    <span className="text-[10px] font-semibold text-amber-600">{kpis.pendingVerifications}</span>
                  )}
                </div>
                <div onClick={() => handleNav('organizations', 'verified')} className={subItemClass('organizations', 'verified')}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Verified</span>
                  </div>
                </div>
                <div onClick={() => handleNav('organizations', 'suspended')} className={subItemClass('organizations', 'suspended')}>
                  <div className="flex items-center gap-2">
                    <Ban size={13} className="text-rose-500" />
                    <span>Suspended</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users */}
          <div onClick={() => handleNav('users', 'all')} className={navItemClass('users', 'all')}>
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>Users</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">{kpis?.totalUsers || ''}</span>
          </div>

          {/* Campaigns */}
          <div onClick={() => handleNav('campaigns', 'all')} className={navItemClass('campaigns', 'all')}>
            <div className="flex items-center gap-3">
              <Megaphone size={18} />
              <span>Campaigns</span>
            </div>
            {kpis?.activeCampaigns > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {kpis.activeCampaigns}
              </span>
            )}
          </div>

          {/* Orders */}
          <div onClick={() => handleNav('orders', 'all')} className={navItemClass('orders', 'all')}>
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} />
              <span>Orders</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">{kpis?.totalOrders || ''}</span>
          </div>

          {/* Transactions */}
          <div onClick={() => handleNav('transactions', 'all')} className={navItemClass('transactions', 'all')}>
            <div className="flex items-center gap-3">
              <CreditCard size={18} />
              <span>Transactions</span>
            </div>
          </div>

          {/* Payouts (Highlighted / Most Important) */}
          <div onClick={() => handleNav('payouts', 'all')} className={navItemClass('payouts', 'all')}>
            <div className="flex items-center gap-3">
              <Coins size={18} className="text-amber-500" />
              <span className="font-semibold">Payouts (50/45/5)</span>
            </div>
            {kpis?.pendingPayouts > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                {kpis.pendingPayouts}
              </span>
            )}
          </div>

          {/* Manufacturers Tree */}
          <div className="space-y-1 pt-1">
            <div
              onClick={() => setManOpen(!manOpen)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <div
                className="flex items-center gap-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNav('manufacturers', 'partners');
                }}
              >
                <Factory size={18} className={activeTab === 'manufacturers' ? 'text-emerald-600' : ''} />
                <span className={activeTab === 'manufacturers' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>Manufacturers</span>
              </div>
              <div className="flex items-center gap-1.5">
                {manOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>

            {manOpen && (
              <div className="pl-6 pr-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 py-1">
                <div onClick={() => handleNav('manufacturers', 'techpacks')} className={subItemClass('manufacturers', 'techpacks')}>
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={13} className="text-indigo-500" />
                    <span>Techpacks</span>
                  </div>
                </div>
                <div onClick={() => handleNav('manufacturers', 'production')} className={subItemClass('manufacturers', 'production')}>
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-amber-500" />
                    <span>Production</span>
                  </div>
                </div>
                <div onClick={() => handleNav('manufacturers', 'shipping')} className={subItemClass('manufacturers', 'shipping')}>
                  <div className="flex items-center gap-2">
                    <Truck size={13} className="text-emerald-500" />
                    <span>Shipping</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reports */}
          <div onClick={() => handleNav('reports', 'all')} className={navItemClass('reports', 'all')}>
            <div className="flex items-center gap-3">
              <BarChart3 size={18} />
              <span>Reports</span>
            </div>
          </div>

          {/* Notifications */}
          <div onClick={() => handleNav('notifications', 'all')} className={navItemClass('notifications', 'all')}>
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
          </div>

          {/* Settings */}
          <div onClick={() => handleNav('settings', 'all')} className={navItemClass('settings', 'all')}>
            <div className="flex items-center gap-3">
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
              <Sparkles size={14} />
              <span>Revenue Split Active</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              50% Org &bull; 45% Manufacturer &bull; 5% Platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
