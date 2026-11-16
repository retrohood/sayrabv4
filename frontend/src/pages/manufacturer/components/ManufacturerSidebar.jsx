import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  LayoutDashboard,
  Package,
  FileText,
  Truck,
  DollarSign,
  TrendingUp,
  Bell,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ManufacturerSidebar({
  activeTab,
  setActiveTab,
  counts = {},
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotations', label: 'Quotations', icon: Calculator, badge: counts.pendingQuotations },
    { id: 'orders', label: 'Production Orders', icon: Package, badge: counts.activeOrders },
    { id: 'techpacks', label: 'Techpacks', icon: FileText, badge: counts.pendingTechpacks },
    { id: 'shipping', label: 'Shipping & Logistics', icon: Truck, badge: counts.readyToShip },
    { id: 'payments', label: 'Payments & Split (45%)', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: counts.unreadAlerts },
    { id: 'profile', label: 'Manufacturer Profile', icon: User },
  ];

  return (
    <aside
      className={`w-64 flex-shrink-0 transition-transform md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full absolute md:relative'
      } flex flex-col justify-between shadow-2xl md:shadow-none min-h-screen md:min-h-0 bg-[#10182b] text-slate-200 border-r border-[#1e2a42]`}
    >
      <div>
        {/* Brand Header with strict h-20 Logo */}
        <div className="p-5 border-b border-[#1e2a42] bg-[#0c1322]">
          <Link
            to="/manufacturer"
            onClick={() => setIsSidebarOpen?.(false)}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
          >
            <img
              src="/sayrab.png"
              alt="Sayrab"
              className="h-20 w-auto object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-base leading-tight text-white block truncate">
                Sayrab<span className="text-[#89ca2e]">.</span>
              </span>
              <span className="text-[10px] text-[#0ea5c6] font-black uppercase tracking-wider block">
                Manufacturer Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Workflow Engine Panel */}
        <div className="m-4 p-3.5 rounded-2xl bg-[#0c1322] border border-[#1e2a42] text-xs shadow-inner">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-white text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#89ca2e] animate-pulse"></span>
              Workflow Engine
            </span>
            <span className="text-[10px] font-bold text-[#89ca2e] bg-[#89ca2e]/15 border border-[#89ca2e]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Revenue Allocation:{' '}
            <strong className="text-[#0ea5c6] font-bold">45% per unit</strong>
          </p>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen?.(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#89ca2e]/20 to-[#0ea5c6]/20 border border-[#89ca2e]/40 text-[#89ca2e] font-extrabold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#89ca2e]' : 'text-[#0ea5c6]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#89ca2e] text-[#10182b] font-black shadow-xs'
                        : 'bg-[#0ea5c6]/15 text-[#0ea5c6] border border-[#0ea5c6]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#89ca2e]" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Account Card & Logout */}
      <div className="p-4 border-t border-[#1e2a42] bg-[#0c1322]">
        <div className="flex items-center gap-3 mb-3 p-2.5 bg-[#10182b] rounded-xl border border-[#1e2a42]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0ea5c6] to-[#367c35] border border-[#0ea5c6]/40 flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0">
            {user?.companyName
              ? user.companyName[0].toUpperCase()
              : user?.fullName
              ? user.fullName[0].toUpperCase()
              : 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.companyName || user?.fullName || 'Apex TexCraft'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#89ca2e]" />
              <p className="text-[10px] text-[#0ea5c6] font-medium truncate">
                Verified Partner (45%)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 bg-rose-950/20 border border-rose-800/30 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
