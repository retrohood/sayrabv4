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
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function DashboardView({ overview, onNavigate }) {
  const kpis = overview?.kpis || {};
  const revenueChart = overview?.revenueChart || [];
  const campaignPerformanceChart = overview?.campaignPerformanceChart || [];
  const recentActivities = overview?.recentActivities || [];

  const [activeChartTab, setActiveChartTab] = useState('total');

  const maxRevenue = Math.max(...revenueChart.map((d) => d.total || 0), 1);

  const kpiCards = [
    {
      title: 'Total Organizations',
      value: kpis.totalOrganizations || 0,
      sub: `${kpis.pendingVerifications || 0} pending review`,
      subHighlight: kpis.pendingVerifications > 0,
      icon: Building2,
      color: 'from-blue-600 to-cyan-500',
      action: () => onNavigate('organizations', 'all'),
    },
    {
      title: 'Pending Verifications',
      value: kpis.pendingVerifications || 0,
      sub: 'Action needed to verify',
      subHighlight: kpis.pendingVerifications > 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      action: () => onNavigate('organizations', 'pending'),
    },
    {
      title: 'Active Campaigns',
      value: kpis.activeCampaigns || 0,
      sub: 'Public live fundraising',
      icon: Megaphone,
      color: 'from-emerald-600 to-teal-500',
      action: () => onNavigate('campaigns', 'all'),
    },
    {
      title: 'Total Orders',
      value: kpis.totalOrders || 0,
      sub: 'Merchandise fulfilled',
      icon: ShoppingBag,
      color: 'from-purple-600 to-indigo-500',
      action: () => onNavigate('orders', 'all'),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(kpis.totalRevenue || 0),
      sub: 'Gross platform volume',
      icon: DollarSign,
      color: 'from-emerald-600 to-green-600',
      isCurrency: true,
      action: () => onNavigate('reports', 'all'),
    },
    {
      title: 'Pending Payouts',
      value: kpis.pendingPayouts || 0,
      sub: formatCurrency(kpis.pendingPayoutSum || 0),
      subHighlight: kpis.pendingPayouts > 0,
      icon: Coins,
      color: 'from-amber-600 to-yellow-500',
      action: () => onNavigate('payouts', 'all'),
    },
    {
      title: 'Manufacturer Orders',
      value: kpis.manufacturerOrders || 0,
      sub: 'In production / queue',
      icon: Factory,
      color: 'from-sky-600 to-blue-600',
      action: () => onNavigate('manufacturers', 'production'),
    },
    {
      title: 'Platform Fee (5%)',
      value: formatCurrency(kpis.platformFeeEarned || 0),
      sub: 'Earned platform share',
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
              <span>Automated Financial Architecture Active</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Revenue Split & Dispute Settlement Rules</h2>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Customer payments split into <strong className="text-white">50% Organization</strong>,{' '}
              <strong className="text-white">45% Manufacturer</strong>, and{' '}
              <strong className="text-white">5% Sayrab Commission</strong>. Campaign payouts enforce a strict{' '}
              <strong className="text-white">7-day post-completion refund hold</strong>.
            </p>
          </div>
          <button
            onClick={() => onNavigate('payouts', 'all')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-transform hover:scale-105 shadow-md shadow-emerald-500/25 shrink-0"
          >
            <span>Review Payout Queue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 8 Primary Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <p className={`text-xs mt-1.5 font-medium ${card.subHighlight ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}`}>
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Revenue Chart & Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                <span>Revenue Flow & 50/45/5 Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly gross volume with automated revenue allocation breakdown
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('total')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeChartTab === 'total' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Gross Total
              </button>
              <button
                onClick={() => setActiveChartTab('split')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeChartTab === 'split' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                50/45/5 Breakdown
              </button>
            </div>
          </div>

          {/* SVG Custom Revenue Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {revenueChart.map((item, idx) => {
              const heightPct = Math.round((item.total / maxRevenue) * 100);
              const orgPct = Math.round((item.organization / item.total) * 100) || 50;
              const manPct = Math.round((item.manufacturer / item.total) * 100) || 45;
              const sayrabPct = Math.round((item.platform / item.total) * 100) || 5;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-20 whitespace-nowrap">
                    <p className="font-bold text-emerald-400">{item.month}: {formatCurrency(item.total)}</p>
                    <p className="text-slate-300">Org (50%): {formatCurrency(item.organization)}</p>
                    <p className="text-slate-300">Mfg (45%): {formatCurrency(item.manufacturer)}</p>
                    <p className="text-slate-300">Sayrab (5%): {formatCurrency(item.platform)}</p>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(heightPct, 15)}%` }}
                    className="w-full max-w-[48px] rounded-xl overflow-hidden flex flex-col transition-all duration-300 group-hover:scale-105 shadow-sm"
                  >
                    {activeChartTab === 'split' ? (
                      <>
                        <div style={{ height: `${sayrabPct}%` }} className="bg-pink-500" title="Sayrab 5%" />
                        <div style={{ height: `${manPct}%` }} className="bg-amber-400" title="Manufacturer 45%" />
                        <div style={{ height: `${orgPct}%` }} className="bg-emerald-600" title="Organization 50%" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl" />
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
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
              <span>Platform Fee (5%)</span>
            </div>
          </div>
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
