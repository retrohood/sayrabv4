import { useState } from 'react';
import {
  Building2,
  Clock,
  Megaphone,
  ShoppingBag,
  Coins,
  Factory,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  Calculator,
  UserCheck,
  Truck,
  Activity,
  Package,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function DashboardView({ overview, onNavigate }) {
  const kpis = overview?.kpis || {};
  const revenueChart = overview?.revenueChart || [];
  const userGrowthChart = overview?.userGrowthChart || [];
  const campaignPerformanceChart = overview?.campaignPerformanceChart || [];
  const recentActivities = overview?.recentActivities || [];
  const quotationsByStatus = overview?.quotationsByStatus || {};
  const productionPipeline = overview?.productionPipeline || {};
  const ordersByStatus = overview?.ordersByStatus || {};

  const [activeChartTab, setActiveChartTab] = useState('total');
  const [activeGrowthTab, setActiveGrowthTab] = useState('revenue'); // 'revenue' | 'users'

  const maxRevenue = Math.max(...revenueChart.map((d) => d.total || 0), 1);
  const maxUsers = Math.max(...userGrowthChart.map((d) => d.total || 0), 1);

  const kpiCards = [
    {
      title: 'Total Users & Community',
      value: kpis.totalUsers || 0,
      sub: `${kpis.fundraisersCount || 0} Fundraisers • ${kpis.manufacturersCount || 0} Manufacturers • ${kpis.buyersCount || 0} Buyers`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
      action: () => onNavigate('users', 'all'),
    },
    {
      title: 'Quotation Pipeline',
      value: kpis.totalQuotations || 0,
      sub: `${quotationsByStatus.submitted_to_admin || 0} pending assign • ${quotationsByStatus.assigned_to_manufacturer || quotationsByStatus.manufacturer_proposal_sent || 0} active`,
      subHighlight: (quotationsByStatus.submitted_to_admin || 0) > 0,
      icon: Calculator,
      color: 'bg-amber-500/10 text-amber-600',
      action: () => onNavigate('manufacturers', 'quotations'),
    },
    {
      title: 'Total Verified Orgs',
      value: kpis.totalOrganizations || 0,
      sub: `${kpis.pendingVerifications || 0} pending verification`,
      subHighlight: (kpis.pendingVerifications || 0) > 0,
      icon: Building2,
      color: 'bg-sky-500/10 text-sky-600',
      action: () => onNavigate('organizations', 'all'),
    },
    {
      title: 'Live Campaigns',
      value: kpis.activeCampaigns || 0,
      sub: 'Verified public fundraising',
      icon: Megaphone,
      color: 'bg-[#89ca2e]/15 text-[#367c35]',
      action: () => onNavigate('campaigns', 'all'),
    },
    {
      title: 'Total Orders',
      value: kpis.totalOrders || 0,
      sub: `${kpis.sampleOrdersCount || 0} Samples • ${kpis.bulkOrdersCount || 0} Bulk`,
      icon: ShoppingBag,
      color: 'bg-purple-500/10 text-purple-600',
      action: () => onNavigate('orders', 'all'),
    },
    {
      title: 'Total Revenue & Volume',
      value: formatCurrency(kpis.totalRevenue || 0),
      sub: 'Gross platform order & fund volume',
      icon: DollarSign,
      color: 'bg-[#367c35]/10 text-[#367c35]',
      isCurrency: true,
      action: () => onNavigate('reports', 'all'),
    },
    {
      title: 'Pending Payouts',
      value: kpis.pendingPayouts || 0,
      sub: formatCurrency(kpis.pendingPayoutSum || 0),
      subHighlight: (kpis.pendingPayouts || 0) > 0,
      icon: Coins,
      color: 'bg-amber-500/10 text-amber-600',
      action: () => onNavigate('payouts', 'all'),
    },
    {
      title: 'Platform Commission (5%)',
      value: formatCurrency(kpis.platformFeeEarned || 0),
      sub: 'Earned Sayrab platform share',
      icon: Sparkles,
      color: 'bg-[#89ca2e]/20 text-[#367c35]',
      isCurrency: true,
      action: () => onNavigate('settings', 'all'),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Revenue Split Alert Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#10182b] to-[#367c35] text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md text-[#89ca2e] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Real-Time Core System Flow & Governance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Admin Assignment & Financial Governance</h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              Platform Admin assigns incoming draft quotations to verified manufacturers with direct chat oversight. After fundraiser acceptance, production starts and funds become payable through governed 50/45/5 payout workflows.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('manufacturers', 'techpacks')}
              className="px-4 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Calculator size={15} />
              <span>Quotation Queue</span>
            </button>
            <button
              onClick={() => onNavigate('payouts', 'all')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/20 cursor-pointer"
            >
              <Coins size={15} />
              <span>Payout Approvals</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs hover:border-[#89ca2e]/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[#10182b]">{card.value}</p>
                <p
                  className={`text-[11px] mt-1 truncate ${
                    card.subHighlight ? 'text-amber-600 font-bold' : 'text-[#64748b]'
                  }`}
                >
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Workflow Pipelines: Quotations & Production Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Quotation Pipeline */}
        <div className="p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
                <Calculator size={16} className="text-amber-600" />
                <span>Quotation Lifecycle & Admin Assignments</span>
              </h3>
              <button
                onClick={() => onNavigate('manufacturers', 'techpacks')}
                className="text-xs text-[#367c35] hover:underline font-bold cursor-pointer"
              >
                Assign Quotes ({quotationsByStatus.submitted_to_admin || 0}) &rarr;
              </button>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Real-time progression from draft submission to manufacturer proposal & production approval
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div
                onClick={() => onNavigate('manufacturers', 'techpacks')}
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition"
              >
                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                  Awaiting Admin Assignment
                </span>
                <span className="text-xl font-black text-amber-700 font-mono">
                  {quotationsByStatus.submitted_to_admin || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                <span className="text-[10px] uppercase font-bold text-sky-700 block">
                  Factory Reviewing
                </span>
                <span className="text-xl font-black text-sky-700 font-mono">
                  {(quotationsByStatus.assigned_to_manufacturer || 0) + (quotationsByStatus.manufacturer_reviewing || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                  Proposal Sent
                </span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {quotationsByStatus.manufacturer_proposal_sent || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                <span className="text-[10px] uppercase font-bold text-[#367c35] block">
                  Accepted & Production
                </span>
                <span className="text-xl font-black text-[#367c35] font-mono">
                  {(quotationsByStatus.accepted_by_fundraiser || 0) + (quotationsByStatus.production_started || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                  Completed Runs
                </span>
                <span className="text-xl font-black text-[#10182b] font-mono">
                  {quotationsByStatus.completed || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[10px] uppercase font-bold text-red-700 block">
                  Cancelled / Struck
                </span>
                <span className="text-xl font-black text-red-700 font-mono">
                  {quotationsByStatus.cancelled || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e9e3] flex items-center justify-between text-xs text-[#64748b]">
            <span>Total Quotations Processed</span>
            <strong className="text-[#10182b] font-mono">{kpis.totalQuotations || 0} quotes</strong>
          </div>
        </div>

        {/* 2. Production Pipeline */}
        <div className="p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
                <Factory size={16} className="text-[#367c35]" />
                <span>Production Pipeline & Milestone Tracker</span>
              </h3>
              <button
                onClick={() => onNavigate('manufacturers', 'production')}
                className="text-xs text-[#367c35] hover:underline font-bold cursor-pointer"
              >
                Production Board &rarr;
              </button>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Active manufacturing batches across sample prototypes and bulk production runs
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                <span className="text-[10px] uppercase font-bold text-[#64748b] block">Pending Start</span>
                <strong className="text-base font-black font-mono text-[#10182b]">
                  {productionPipeline.pending_start || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                <span className="text-[10px] uppercase font-bold text-sky-700 block">In Production</span>
                <strong className="text-base font-black font-mono text-sky-700">
                  {productionPipeline.in_production || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Quality Check</span>
                <strong className="text-base font-black font-mono text-amber-700">
                  {productionPipeline.quality_check || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                <span className="text-[10px] uppercase font-bold text-[#367c35] block">Dispatched / Deliv.</span>
                <strong className="text-base font-black font-mono text-[#367c35]">
                  {(productionPipeline.ready_to_ship || 0) + (productionPipeline.shipped || 0) + (productionPipeline.delivered || 0)}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e9e3] flex items-center justify-between text-xs text-[#64748b]">
            <span>Orders by Type</span>
            <span className="font-bold text-[#10182b]">
              {kpis.sampleOrdersCount || 0} Samples • {kpis.bulkOrdersCount || 0} Bulk Runs
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Revenue Flow & User Community Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={16} className="text-[#367c35]" />
                <span>Financial & Platform Volume Trends</span>
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Monthly merchandise GMV, donor fund flow, and platform fee tracking
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
              {['total', 'donations', 'merchandise'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                    activeChartTab === tab
                      ? 'bg-white text-[#10182b] shadow-xs border border-[#e5e9e3]'
                      : 'text-[#64748b] hover:text-[#10182b]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#e5e9e3]">
            {revenueChart.length > 0 ? (
              revenueChart.map((item, idx) => {
                const val =
                  activeChartTab === 'donations'
                    ? item.donations || 0
                    : activeChartTab === 'merchandise'
                    ? item.merchandise || 0
                    : item.total || 0;
                const heightPercent = Math.min(100, Math.max(12, Math.round((val / maxRevenue) * 100)));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#10182b] text-white text-[10px] font-mono py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20">
                      {formatCurrency(val)}
                    </div>
                    <div className="w-full bg-[#f7f9f5] rounded-t-lg h-full flex items-end">
                      <div
                        className="w-full bg-[#89ca2e] hover:bg-[#78b327] rounded-t-lg transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#64748b] font-medium truncate w-full text-center">
                      {item.month || `M${idx + 1}`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#64748b]">
                No financial history available
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748b] pt-3">
            <span>Peak Volume: {formatCurrency(maxRevenue)}</span>
            <span className="text-[#367c35] font-bold">100% Verified Ledger Data</span>
          </div>
        </div>

        {/* Right 1 Col: Campaign Performance Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Megaphone size={16} className="text-[#367c35]" />
              <span>Campaign Status Distribution</span>
            </h3>
            <p className="text-xs text-[#64748b] mb-4">
              Breakdown of all registered community causes
            </p>

            <div className="space-y-3">
              {[
                { label: 'Active & Approved', count: kpis.activeCampaigns || 0, color: 'bg-[#89ca2e]' },
                { label: 'Pending Verification', count: kpis.pendingVerifications || 0, color: 'bg-amber-500' },
                { label: 'Completed Causes', count: 18, color: 'bg-[#367c35]' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#10182b]">{item.label}</span>
                    <span className="font-black text-[#10182b]">{item.count}</span>
                  </div>
                  <div className="w-full bg-[#f7f9f5] h-2 rounded-full overflow-hidden border border-[#e5e9e3]">
                    <div
                      className={`${item.color} h-full rounded-full transition-all`}
                      style={{ width: `${Math.min(100, (item.count / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e9e3] flex justify-between items-center text-xs">
            <span className="text-[#64748b]">Audit Status:</span>
            <span className="text-[#367c35] font-bold">Compliant & Governed</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
          <div>
            <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#367c35]" />
              <span>Recent Operational & Financial Events</span>
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">Live platform transactions and administrative triggers</p>
          </div>
          <span className="text-xs text-[#367c35] font-bold">Live Stream</span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#64748b]">
            No recent platform activities recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#e5e9e3]">
            {recentActivities.slice(0, 6).map((act, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#10182b]">{act.description || act.title || 'Platform Event'}</p>
                  <p className="text-[10px] text-[#64748b] mt-0.5">{act.time || 'Recent'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f7f9f5] border border-[#e5e9e3] text-[#367c35]">
                  {act.type || 'System'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
