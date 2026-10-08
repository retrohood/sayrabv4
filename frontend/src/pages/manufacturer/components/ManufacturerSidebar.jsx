import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  LayoutDashboard,
  Package,
  FileText,
  FlaskConical,
  Factory,
  Truck,
  DollarSign,
  TrendingUp,
  Bell,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ManufacturerSidebar({ activeTab, setActiveTab, counts = {}, isSidebarOpen, setIsSidebarOpen }) {
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
      } flex flex-col justify-between shadow-2xl md:shadow-none min-h-screen md:min-h-0 bg-slate-900 text-slate-300 border-r border-slate-800`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60">
          <Link to="/manufacturer" onClick={() => setIsSidebarOpen?.(false)} className="flex items-center gap-3 hover:opacity-90">
            <img src="/sayrab.png" alt="Sayrab" className="h-14 w-auto object-contain" />
            <div>
              <p className="font-bold text-lg leading-tight text-white">
                Sayrab<span className="text-cyan-400">.</span>
              </p>
              <p className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider">
                Manufacturer Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Workflow Status Banner */}
        <div className="m-4 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs shadow-inner">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Workflow Engine
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Revenue Allocation: <strong className="text-cyan-300 font-bold">45% per unit</strong>
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
                    ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-extrabold shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 font-black shadow-xs'
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 p-2 bg-slate-800/50 rounded-xl border border-slate-700/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/30 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/10 text-xs">
            {user?.companyName ? user.companyName[0].toUpperCase() : user?.fullName ? user.fullName[0].toUpperCase() : 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.companyName || user?.fullName || 'Manufacturer Admin'}</p>
            <p className="text-[10px] text-cyan-400 font-medium truncate">Verified Partner (45%)</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 bg-rose-950/30 border border-rose-800/30 hover:bg-rose-900/40 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </aside>
  );
}
