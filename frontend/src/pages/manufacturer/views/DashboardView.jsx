import { Package, FileText, Truck, CheckCircle2, DollarSign, TrendingUp, Clock, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';

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
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      color: 'hover:border-cyan-500/40 text-cyan-400',
      action: () => onNavigate('orders'),
    },
    {
      title: 'Pending Techpacks',
      value: metrics.pendingTechpacks,
      subtitle: 'Awaiting spec confirmation',
      icon: FileText,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      color: 'hover:border-amber-500/40 text-amber-400',
      action: () => onNavigate('techpacks'),
    },
    {
      title: 'Orders Ready to Ship',
      value: metrics.ordersReadyToShip,
      subtitle: 'Passed QC & packaged',
      icon: Truck,
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      color: 'hover:border-emerald-500/40 text-emerald-400',
      action: () => onNavigate('shipping'),
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      subtitle: 'Delivered to organizers',
      icon: CheckCircle2,
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      color: 'hover:border-blue-500/40 text-blue-400',
      action: () => onNavigate('reports'),
    },
    {
      title: 'Total Revenue Earned',
      value: `PKR ${metrics.totalRevenueEarned.toLocaleString()}`,
      subtitle: '45% Manufacturer Share',
      icon: DollarSign,
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      color: 'hover:border-emerald-500/40 text-emerald-400',
      action: () => onNavigate('payments'),
    },
    {
      title: 'Production SLA Progress',
      value: `${metrics.productionProgress}%`,
      subtitle: 'Overall execution rate',
      icon: TrendingUp,
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      color: 'hover:border-cyan-500/40 text-cyan-400',
      action: () => onNavigate('bulk'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sayrab Manufacturer Fulfillment Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Production Overview & Fulfillment Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track assigned merchandise orders, inspect approved techpack specs, update bulk unit progress, and review verified 45% revenue payouts in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('orders')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>View Active Queue</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 ${card.color} hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-950/20 transition-all cursor-pointer relative group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Production Progress */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Active Bulk Production SLA</h3>
              <p className="text-xs text-slate-400">Current fulfillment performance across all assigned lots</p>
            </div>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30">
              Avg {metrics.productionProgress}% Completed
            </span>
          </div>

          {/* Progress Bar Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Overall Batch Fulfillment Rate</span>
              <span className="text-emerald-400 font-bold">{metrics.productionProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
                style={{ width: `${metrics.productionProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Workflow Steps Visual */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">1. Techpack</div>
              <div className="text-xs font-extrabold text-cyan-400 mt-1">Confirmed</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">2. Sample</div>
              <div className="text-xs font-extrabold text-emerald-400 mt-1">Approved</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
              <div className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider">3. Bulk Cut/Sew</div>
              <div className="text-xs font-extrabold text-white mt-1">In Progress</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">4. Dispatch</div>
              <div className="text-xs font-extrabold text-slate-300 mt-1">Pending QC</div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent Production Feed
            </h3>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No recent activity logs recorded.</p>
            ) : (
              activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
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
