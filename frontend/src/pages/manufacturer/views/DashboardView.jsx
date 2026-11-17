import {
  Package,
  FileText,
  Truck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

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
  const recentOrders = overview?.recentOrders || [];

  const cards = [
    {
      title: 'Active Production Orders',
      value: metrics.activeProductionOrders,
      subtitle: 'In cutting, printing & sewing',
      icon: Package,
      badgeColor: 'bg-[#0ea5c6]/15 text-[#0ea5c6] border-[#0ea5c6]/30',
      action: () => onNavigate('orders'),
    },
    {
      title: 'Pending Techpacks',
      value: metrics.pendingTechpacks,
      subtitle: 'Awaiting spec confirmation',
      icon: FileText,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => onNavigate('techpacks'),
    },
    {
      title: 'Orders Ready to Ship',
      value: metrics.ordersReadyToShip,
      subtitle: 'Passed QC & packaged',
      icon: Truck,
      badgeColor: 'bg-[#89ca2e]/15 text-[#367c35] border-[#89ca2e]/30',
      action: () => onNavigate('shipping'),
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      subtitle: 'Delivered to organizers',
      icon: CheckCircle2,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      action: () => onNavigate('reports'),
    },
    {
      title: 'Total Revenue Earned',
      value: `PKR ${Number(metrics.totalRevenueEarned || 0).toLocaleString()}`,
      subtitle: '45% Manufacturer Share',
      icon: DollarSign,
      badgeColor: 'bg-[#89ca2e]/15 text-[#367c35] border-[#89ca2e]/30',
      action: () => onNavigate('payments'),
    },
    {
      title: 'Production SLA Progress',
      value: `${metrics.productionProgress || 0}%`,
      subtitle: 'Overall execution rate',
      icon: TrendingUp,
      badgeColor: 'bg-[#0ea5c6]/15 text-[#0ea5c6] border-[#0ea5c6]/30',
      action: () => onNavigate('orders'),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#10182b] via-[#16243d] to-[#367c35] border border-[#1e2a42] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#89ca2e]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#89ca2e] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#89ca2e]" />
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
              className="px-5 py-3 rounded-2xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
              className="p-5 rounded-2xl bg-white border border-[#e5e9e3] hover:border-[#89ca2e] hover:shadow-md transition-all cursor-pointer relative group shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#64748b]">{card.title}</span>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.badgeColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-[#64748b] mt-2 flex items-center justify-between">
                <span>{card.subtitle}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#367c35] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Production Progress */}
        <div className="lg:col-span-2 bg-white border border-[#e5e9e3] rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5e9e3]">
            <div>
              <h3 className="text-sm font-bold text-[#10182b] tracking-tight">
                Active Bulk Production SLA
              </h3>
              <p className="text-xs text-[#64748b]">
                Current fulfillment performance across all assigned lots
              </p>
            </div>
            <span className="text-xs font-bold text-[#367c35] bg-[#89ca2e]/15 px-3 py-1 rounded-xl border border-[#89ca2e]/30">
              Avg {metrics.productionProgress || 0}% Completed
            </span>
          </div>

          {/* Progress Bar Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#10182b]">Overall Batch Fulfillment Rate</span>
              <span className="text-[#367c35] font-bold">{metrics.productionProgress || 0}%</span>
            </div>
            <div className="w-full bg-[#f5f7fb] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#e5e9e3]">
              <div
                className="bg-gradient-to-r from-[#0ea5c6] to-[#89ca2e] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${metrics.productionProgress || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Workflow Steps Visual */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3] text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider">
                1. Techpack
              </div>
              <div className="text-xs font-extrabold text-[#0ea5c6] mt-1">Confirmed</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3] text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider">
                2. Sample
              </div>
              <div className="text-xs font-extrabold text-[#367c35] mt-1">Approved</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/30 text-center">
              <div className="text-[10px] text-[#367c35] uppercase font-bold tracking-wider">
                3. Bulk Cut/Sew
              </div>
              <div className="text-xs font-extrabold text-[#10182b] mt-1">In Progress</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3] text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider">
                4. Dispatch
              </div>
              <div className="text-xs font-extrabold text-[#64748b] mt-1">Pending QC</div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#10182b] uppercase tracking-wider">
                Recent Orders in Production
              </h4>
              <button
                onClick={() => onNavigate('orders')}
                className="text-[11px] font-bold text-[#367c35] hover:underline"
              >
                View All &rarr;
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e5e9e3]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f7fb] border-b border-[#e5e9e3] text-[#64748b] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
                  {recentOrders.length > 0 ? (
                    recentOrders.slice(0, 4).map((ord, idx) => (
                      <tr key={idx} className="hover:bg-[#f5f7fb]/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {ord.invoiceNumber || ord._id?.slice(-6) || 'ORD-2026'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#10182b]">
                          {ord.productName || ord.products?.[0]?.name || 'Apparel Lot'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {ord.quantity || ord.products?.[0]?.quantity || 100}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748b]">
                          {ord.deadline || '14 Days'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
                            {ord.status || ord.productionStatus || 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[#64748b] italic">
                        Active orders assigned to your facility will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
              <h3 className="text-sm font-bold text-[#10182b] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0ea5c6]" />
                <span>Recent Production Feed</span>
              </h3>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 mt-4">
              {activities.length === 0 ? (
                <p className="text-xs text-[#64748b] text-center py-10">
                  No recent activity logs recorded.
                </p>
              ) : (
                activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs p-3 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#0ea5c6] mt-1.5 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#10182b] truncate">{act.title}</p>
                      <p className="text-[11px] text-[#64748b] mt-0.5">{act.details}</p>
                      <p className="text-[10px] text-[#64748b] mt-1">
                        {act.time
                          ? new Date(act.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#e5e9e3]">
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span>Facility Status:</span>
              <span className="font-bold text-[#367c35] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#89ca2e] inline-block"></span>
                Operational (SLA 98%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
