import {
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
  ExternalLink,
} from 'lucide-react';

export default function ManufacturerSidebar({ activeTab, setActiveTab, counts = {} }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Production Orders', icon: Package, badge: counts.activeOrders },
    { id: 'techpacks', label: 'Techpacks', icon: FileText, badge: counts.pendingTechpacks },
    { id: 'samples', label: 'Sample Production', icon: FlaskConical },
    { id: 'bulk', label: 'Bulk Production', icon: Factory },
    { id: 'shipping', label: 'Shipping', icon: Truck, badge: counts.readyToShip },
    { id: 'payments', label: 'Payments (45%)', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: counts.unreadAlerts },
    { id: 'profile', label: 'Manufacturer Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              M
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
                Sayrab Mfg <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Fulfillment Portal</p>
            </div>
          </div>
        </div>

        {/* Workflow Quick Banner */}
        <div className="m-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span>Workflow Status</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Revenue Share: <strong className="text-white">45% per unit</strong>
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
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Sayrab v4.0 • Mfg Engine</span>
        <a href="/admin" className="text-indigo-400 hover:underline flex items-center gap-1">
          Admin Portal <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
