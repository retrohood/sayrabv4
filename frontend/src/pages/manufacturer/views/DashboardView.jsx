import { Package, FileText, Truck, CheckCircle2, DollarSign, TrendingUp, Clock, ChevronRight, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function DashboardView({ overview, onNavigate }) {
  const metrics = overview?.metrics || {
    activeProductionOrders: 0,
    pendingTechpacks: 0,
    ordersReadyToShip: 0,
    completedOrders: 0,
    totalRevenueEarned: 0,
    productionProgress: 0,
  };

  const activities = overview?.recentActivities || [];

  const cards = [
    {
      title: 'Active Production Orders',
      value: metrics.activeProductionOrders,
      subtitle: 'In cutting, printing & sewing',
      icon: Package,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      action: () => onNavigate('orders'),
    },
    {
      title: 'Pending Techpacks',
      value: metrics.pendingTechpacks,
      subtitle: 'Awaiting spec confirmation',
      icon: FileText,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      action: () => onNavigate('techpacks'),
    },
    {
      title: 'Orders Ready to Ship',
      value: metrics.ordersReadyToShip,
      subtitle: 'Passed QC & packaged',
      icon: Truck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      action: () => onNavigate('shipping'),
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      subtitle: 'Delivered to organizers',
      icon: CheckCircle2,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      action: () => onNavigate('reports'),
    },
    {
      title: 'Total Revenue Earned',
      value: `PKR ${metrics.totalRevenueEarned.toLocaleString()}`,
      subtitle: '45% Manufacturer Share',
      icon: DollarSign,
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30',
      action: () => onNavigate('payments'),
    },
    {
      title: 'Production Progress',
      value: `${metrics.productionProgress}%`,
      subtitle: 'Overall SLA execution rate',
      icon: TrendingUp,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      action: () => onNavigate('bulk'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <span>Apex TexCraft Manufacturing Suite</span>
            </div>
            <h2 className="text-xl font-black text-white">Production Overview & Fulfillment Hub</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Track assigned merchandise orders, inspect approved techpack specs, process bulk unit progress, and view automated 45% revenue payouts directly connected to live MongoDB records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              View Active Queue <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`p-5 rounded-2xl bg-slate-900 border ${card.color} hover:scale-[1.01] transition-all cursor-pointer relative group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Production Progress */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Active Bulk Production SLA</h3>
              <p className="text-xs text-slate-400">Current progress metrics for running batch jobs</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
              Avg {metrics.productionProgress}% Completed
            </span>
          </div>

          {/* Progress Bar Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Overall Batch Fulfillment Rate</span>
              <span className="text-emerald-400">{metrics.productionProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.productionProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Workflow Steps Visual */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">1. Techpack</div>
              <div className="text-xs font-bold text-white mt-1">Confirmed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">2. Sample</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">Approved</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
              <div className="text-[10px] text-indigo-300 uppercase font-semibold">3. Bulk Cut/Sew</div>
              <div className="text-xs font-bold text-indigo-200 mt-1">In Progress</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">4. Dispatch</div>
              <div className="text-xs font-bold text-slate-300 mt-1">Pending QC</div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Recent Activities
            </h3>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recent activity logs recorded.</p>
            ) : (
              activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.details}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
