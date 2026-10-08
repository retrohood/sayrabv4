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
      color: 'from-blue-600 to-indigo-600',
      action: () => onNavigate('users', 'all'),
    },
    {
      title: 'Quotation Pipeline',
      value: kpis.totalQuotations || 0,
      sub: `${quotationsByStatus.submitted_to_admin || 0} pending assign • ${quotationsByStatus.assigned_to_manufacturer || quotationsByStatus.manufacturer_proposal_sent || 0} active`,
      subHighlight: (quotationsByStatus.submitted_to_admin || 0) > 0,
      icon: Calculator,
      color: 'from-amber-500 to-orange-500',
      action: () => onNavigate('manufacturers', 'quotations'),
    },
    {
      title: 'Total Verified Orgs',
      value: kpis.totalOrganizations || 0,
      sub: `${kpis.pendingVerifications || 0} pending verification`,
      subHighlight: (kpis.pendingVerifications || 0) > 0,
      icon: Building2,
      color: 'from-sky-600 to-cyan-500',
      action: () => onNavigate('organizations', 'all'),
    },
    {
      title: 'Live Campaigns',
      value: kpis.activeCampaigns || 0,
      sub: 'Verified public fundraising',
      icon: Megaphone,
      color: 'from-emerald-600 to-teal-500',
      action: () => onNavigate('campaigns', 'all'),
    },
    {
      title: 'Total Orders',
      value: kpis.totalOrders || 0,
      sub: `${kpis.sampleOrdersCount || 0} Samples • ${kpis.bulkOrdersCount || 0} Bulk`,
      icon: ShoppingBag,
      color: 'from-purple-600 to-indigo-500',
      action: () => onNavigate('orders', 'all'),
    },
    {
      title: 'Total Revenue & Volume',
      value: formatCurrency(kpis.totalRevenue || 0),
      sub: 'Gross platform order & fund volume',
      icon: DollarSign,
      color: 'from-emerald-600 to-green-600',
      isCurrency: true,
      action: () => onNavigate('reports', 'all'),
    },
    {
      title: 'Pending Payouts',
      value: kpis.pendingPayouts || 0,
      sub: formatCurrency(kpis.pendingPayoutSum || 0),
      subHighlight: (kpis.pendingPayouts || 0) > 0,
      icon: Coins,
      color: 'from-amber-600 to-yellow-500',
      action: () => onNavigate('payouts', 'all'),
    },
    {
      title: 'Platform Commission (5%)',
      value: formatCurrency(kpis.platformFeeEarned || 0),
      sub: 'Earned Sayrab platform share',
      icon: Sparkles,
      color: 'from-indigo-600 to-pink-600',
      isCurrency: true,
      action: () => onNavigate('settings', 'all'),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Revenue Split Alert Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 shadow-lg border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles size={15} />
              <span>Real-Time Core System Flow & Governance</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Admin Assignment & Automated Financial Pipeline</h2>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Platform Admin assigns incoming draft quotations to verified manufacturers with direct chat oversight. After fundraiser acceptance, production starts and funds become payable through governed payout workflows.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('manufacturers', 'quotations')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Calculator size={15} />
              <span>Quotation Queue</span>
            </button>
            <button
              onClick={() => onNavigate('payouts', 'all')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <Coins size={15} />
              <span>Payout Approvals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Workflow Pipelines: Quotations & Production Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Quotation Pipeline (Requirement 4 & 14) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator size={18} className="text-amber-500" />
                <span>Quotation Lifecycle & Admin Assignments</span>
              </h3>
              <button
                onClick={() => onNavigate('manufacturers', 'quotations')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
              >
                Assign Quotes ({quotationsByStatus.submitted_to_admin || 0}) &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time progression from draft submission to manufacturer proposal & production approval
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div
                onClick={() => onNavigate('manufacturers', 'quotations')}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition"
              >
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                  Awaiting Admin Assignment
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {quotationsByStatus.submitted_to_admin || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">
                  Factory Reviewing
                </span>
                <span className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                  {(quotationsByStatus.assigned_to_manufacturer || 0) + (quotationsByStatus.manufacturer_reviewing || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                  Proposal Sent
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {quotationsByStatus.manufacturer_proposal_sent || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Accepted & Production
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {(quotationsByStatus.accepted_by_fundraiser || 0) + (quotationsByStatus.production_started || 0)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Completed Runs
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono">
                  {quotationsByStatus.completed || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                  Cancelled / Struck
                </span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {quotationsByStatus.cancelled || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total Quotations Processed</span>
            <strong className="text-slate-900 dark:text-white font-mono">{kpis.totalQuotations || 0} quotes</strong>
          </div>
        </div>

        {/* 2. Production Pipeline (Requirement 9 & 12) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Factory size={18} className="text-cyan-500" />
                <span>Production Pipeline & Milestone Tracker</span>
              </h3>
              <button
                onClick={() => onNavigate('manufacturers', 'production')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
              >
                Production Board &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Active manufacturing batches across sample prototypes and bulk production runs
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Start</span>
                <strong className="text-base font-black font-mono text-slate-800 dark:text-white">
                  {productionPipeline.pending_start || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">In Production</span>
                <strong className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                  {productionPipeline.in_production || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Quality Check</span>
                <strong className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                  {productionPipeline.quality_check || 0}
                </strong>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Dispatched / Deliv.</span>
                <strong className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {(productionPipeline.ready_to_ship || 0) + (productionPipeline.shipped || 0) + (productionPipeline.delivered || 0)}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Orders by Type</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {kpis.sampleOrdersCount || 0} Samples • {kpis.bulkOrdersCount || 0} Bulk Runs
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section: Revenue Flow & User Community Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <span>{activeGrowthTab === 'revenue' ? 'Revenue Flow & 50/45/5 Split' : 'User Community & Role Growth'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeGrowthTab === 'revenue'
                  ? 'Monthly gross volume with automated revenue allocation breakdown'
                  : 'Monthly registrations breakdown across Fundraisers, Manufacturers, and Buyers'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveGrowthTab('revenue')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeGrowthTab === 'revenue' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Revenue Flow
              </button>
              <button
                onClick={() => setActiveGrowthTab('users')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeGrowthTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                User Growth
              </button>
            </div>
          </div>

          {/* SVG Dynamic Charts */}
          {activeGrowthTab === 'revenue' ? (
            <div>
              <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                {revenueChart.map((item, idx) => {
                  const heightPct = Math.round((item.total / maxRevenue) * 100);
                  const orgPct = Math.round((item.organization / item.total) * 100) || 50;
                  const manPct = Math.round((item.manufacturer / item.total) * 100) || 45;
                  const sayrabPct = Math.round((item.platform / item.total) * 100) || 5;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-20 whitespace-nowrap">
                        <p className="font-bold text-emerald-400">{item.month}: {formatCurrency(item.total)}</p>
                        <p className="text-slate-300">Org (50%): {formatCurrency(item.organization)}</p>
                        <p className="text-slate-300">Mfg (45%): {formatCurrency(item.manufacturer)}</p>
                        <p className="text-slate-300">Sayrab (5%): {formatCurrency(item.platform)}</p>
                      </div>

                      <div
                        style={{ height: `${Math.max(heightPct, 15)}%` }}
                        className="w-full max-w-[48px] rounded-xl overflow-hidden flex flex-col transition-all duration-300 group-hover:scale-105 shadow-sm"
                      >
                        <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl" />
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-emerald-600" />
                  <span>Organization Share (50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-amber-400" />
                  <span>Manufacturer Share (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-pink-500" />
                  <span>Platform Commission (5%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                {userGrowthChart.map((item, idx) => {
                  const heightPct = Math.round((item.total / maxUsers) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-20 whitespace-nowrap">
                        <p className="font-bold text-cyan-400">{item.month}: {item.total} New Registrations</p>
                        <p className="text-slate-300">Fundraisers: {item.fundraisers}</p>
                        <p className="text-slate-300">Manufacturers: {item.manufacturers}</p>
                        <p className="text-slate-300">Buyers / Donors: {item.buyers}</p>
                      </div>

                      <div
                        style={{ height: `${Math.max(heightPct, 15)}%` }}
                        className="w-full max-w-[48px] rounded-xl overflow-hidden bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300 group-hover:scale-105 shadow-sm"
                      />

                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-blue-600" />
                  <span>Fundraisers ({kpis.fundraisersCount || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-cyan-400" />
                  <span>Manufacturers ({kpis.manufacturersCount || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-purple-500" />
                  <span>Buyers & Donors ({kpis.buyersCount || 0})</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Performance Bar Chart (1 Col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone size={18} className="text-emerald-500" />
                <span>Top Campaigns</span>
              </h3>
              <button
                onClick={() => onNavigate('campaigns', 'all')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                View all
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Current funding progress toward verified campaign goals
            </p>

            <div className="space-y-4">
              {campaignPerformanceChart.map((c, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {c.name}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(c.percent, 100)}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatCurrency(c.raised)} raised</span>
                    <span>Goal: {formatCurrency(c.goal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Goal Achievement Rate</span>
            <span className="font-bold text-slate-900 dark:text-white">61.4% avg</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Trail */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Recent Governance & Operational Activities</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time audit log of verifications, payouts, techpack reviews, and orders
            </p>
          </div>
          <button
            onClick={() => onNavigate('notifications', 'all')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Full Activity Feed
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentActivities.map((act) => {
            const badgeColor =
              act.type === 'payout'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : act.type === 'verification'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                : act.type === 'techpack'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';

            return (
              <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                    {act.type}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.action}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{act.detail}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 sm:text-right">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
