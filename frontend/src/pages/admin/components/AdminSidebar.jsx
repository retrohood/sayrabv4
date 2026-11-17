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
import { Link } from 'react-router-dom';

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
    return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      isActive
        ? 'bg-[#89ca2e]/10 text-[#367c35] border-r-4 border-[#89ca2e] shadow-xs'
        : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
    }`;
  };

  const subItemClass = (tab, sub) => {
    const isActive = activeTab === tab && subFilter === sub;
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? 'bg-[#89ca2e]/15 text-[#367c35] font-bold border-l-2 border-[#89ca2e] pl-2.5'
        : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
    }`;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#e5e9e3] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 border-b border-[#e5e9e3] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img
                src="/sayrab.png"
                alt="Sayrab"
                className="h-20 w-auto object-contain py-1"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#89ca2e]/15 text-[#367c35] font-black uppercase tracking-wider border border-[#89ca2e]/30">
                Admin
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] lg:hidden cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {/* 1. Dashboard */}
            <div onClick={() => handleNav('dashboard', 'all')} className={navItemClass('dashboard', 'all')}>
              <div className="flex items-center gap-3">
                <LayoutDashboard size={17} className={activeTab === 'dashboard' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Dashboard</span>
              </div>
            </div>

            {/* 2. Organizations Tree */}
            <div className="space-y-1 pt-1">
              <div
                onClick={() => setOrgOpen(!orgOpen)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] cursor-pointer"
              >
                <div
                  className="flex items-center gap-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNav('organizations', 'all');
                  }}
                >
                  <Building2 size={17} className={activeTab === 'organizations' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                  <span className={activeTab === 'organizations' ? 'text-[#367c35]' : ''}>
                    Organizations
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {kpis?.pendingVerifications > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {kpis.pendingVerifications}
                    </span>
                  )}
                  {orgOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>
              </div>

              {orgOpen && (
                <div className="pl-6 pr-1 space-y-1 border-l-2 border-[#e5e9e3] ml-4 py-1">
                  <div onClick={() => handleNav('organizations', 'pending')} className={subItemClass('organizations', 'pending')}>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-500" />
                      <span>Pending Verification</span>
                    </div>
                    {kpis?.pendingVerifications > 0 && (
                      <span className="text-[10px] font-bold text-amber-600">{kpis.pendingVerifications}</span>
                    )}
                  </div>
                  <div onClick={() => handleNav('organizations', 'verified')} className={subItemClass('organizations', 'verified')}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#367c35]" />
                      <span>Verified</span>
                    </div>
                  </div>
                  <div onClick={() => handleNav('organizations', 'suspended')} className={subItemClass('organizations', 'suspended')}>
                    <div className="flex items-center gap-2">
                      <Ban size={13} className="text-red-500" />
                      <span>Suspended</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Users */}
            <div onClick={() => handleNav('users', 'all')} className={navItemClass('users', 'all')}>
              <div className="flex items-center gap-3">
                <Users size={17} className={activeTab === 'users' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Users</span>
              </div>
              <span className="text-[10px] text-[#64748b] font-bold">{kpis?.totalUsers || ''}</span>
            </div>

            {/* 4. Campaigns */}
            <div onClick={() => handleNav('campaigns', 'all')} className={navItemClass('campaigns', 'all')}>
              <div className="flex items-center gap-3">
                <Megaphone size={17} className={activeTab === 'campaigns' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Campaigns</span>
              </div>
              {kpis?.activeCampaigns > 0 && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35] font-bold">
                  {kpis.activeCampaigns}
                </span>
              )}
            </div>

            {/* 5. Orders */}
            <div onClick={() => handleNav('orders', 'all')} className={navItemClass('orders', 'all')}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={17} className={activeTab === 'orders' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Orders</span>
              </div>
              <span className="text-[10px] text-[#64748b] font-bold">{kpis?.totalOrders || ''}</span>
            </div>

            {/* 6. Transactions */}
            <div onClick={() => handleNav('transactions', 'all')} className={navItemClass('transactions', 'all')}>
              <div className="flex items-center gap-3">
                <CreditCard size={17} className={activeTab === 'transactions' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Transactions</span>
              </div>
            </div>

            {/* 7. Payouts (50/45/5) */}
            <div onClick={() => handleNav('payouts', 'all')} className={navItemClass('payouts', 'all')}>
              <div className="flex items-center gap-3">
                <Coins size={17} className="text-amber-500" />
                <span>Payouts (50/45/5)</span>
              </div>
              {kpis?.pendingPayouts > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  {kpis.pendingPayouts}
                </span>
              )}
            </div>

            {/* 8. Manufacturers Tree */}
            <div className="space-y-1 pt-1">
              <div
                onClick={() => setManOpen(!manOpen)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] cursor-pointer"
              >
                <div
                  className="flex items-center gap-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNav('manufacturers', 'partners');
                  }}
                >
                  <Factory size={17} className={activeTab === 'manufacturers' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                  <span className={activeTab === 'manufacturers' ? 'text-[#367c35]' : ''}>
                    Manufacturers
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {manOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>
              </div>

              {manOpen && (
                <div className="pl-6 pr-1 space-y-1 border-l-2 border-[#e5e9e3] ml-4 py-1">
                  <div onClick={() => handleNav('manufacturers', 'techpacks')} className={subItemClass('manufacturers', 'techpacks')}>
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={13} className="text-[#367c35]" />
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
                      <Truck size={13} className="text-[#367c35]" />
                      <span>Shipping</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 9. Reports */}
            <div onClick={() => handleNav('reports', 'all')} className={navItemClass('reports', 'all')}>
              <div className="flex items-center gap-3">
                <BarChart3 size={17} className={activeTab === 'reports' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Reports</span>
              </div>
            </div>

            {/* 10. Notifications */}
            <div onClick={() => handleNav('notifications', 'all')} className={navItemClass('notifications', 'all')}>
              <div className="flex items-center gap-3">
                <Bell size={17} className={activeTab === 'notifications' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Notifications</span>
              </div>
            </div>

            {/* 11. Settings */}
            <div onClick={() => handleNav('settings', 'all')} className={navItemClass('settings', 'all')}>
              <div className="flex items-center gap-3">
                <Settings size={17} className={activeTab === 'settings' ? 'text-[#367c35]' : 'text-[#64748b]'} />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info card */}
        <div className="p-4 border-t border-[#e5e9e3]">
          <div className="p-3 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/25">
            <div className="flex items-center gap-2 text-[#367c35] font-bold text-xs mb-1">
              <Sparkles size={14} />
              <span>Revenue Split Active</span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-tight">
              50% Org &bull; 45% Manufacturer &bull; 5% Sayrab Platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
