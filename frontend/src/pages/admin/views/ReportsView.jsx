import { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Award,
  ShoppingBag,
  Factory,
  Building2,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function ReportsView({ reports }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const summary = reports?.summary || {};
  const bestSelling = reports?.bestSellingProducts || [];
  const topOrgs = reports?.topOrganizations || [];
  const manufacturers = reports?.manufacturerScorecards || [];

  const handleExportCSV = () => {
    const headers = ['Category', 'Item Name / Organization', 'Metrics / Volume', 'Revenue / Raised (PKR)'];
    const rows = [
      ...bestSelling.map((p) => ['Product', p.name, `${p.salesCount} sold`, p.revenue]),
      ...topOrgs.map((o) => ['Organization', o.name, `${o.campaignsCount} campaigns`, o.totalRaised]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sayrab_Platform_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Export Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-500" />
            <span>Platform Financial & Governance Reports</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated analytics across merchandise sales, donations, and manufacturing SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Gross Platform Volume</span>
          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(summary.grossRevenue || 6450000)}
          </h4>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">100% Gross Inflow</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Organization Disbursements (50%)</span>
          <h4 className="text-xl font-extrabold text-emerald-600">
            {formatCurrency(summary.organizationDisbursements || 3225000)}
          </h4>
          <span className="text-[10px] text-slate-400 mt-1 block">Paid / Scheduled</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Manufacturer Production (45%)</span>
          <h4 className="text-xl font-extrabold text-amber-600">
            {formatCurrency(summary.manufacturerPayouts || 2902500)}
          </h4>
          <span className="text-[10px] text-slate-400 mt-1 block">Materials & Fulfillment</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Sayrab Commission (5%)</span>
          <h4 className="text-xl font-extrabold text-pink-600">
            {formatCurrency(summary.platformGrossFees || 322500)}
          </h4>
          <span className="text-[10px] text-slate-400 mt-1 block">Net Platform Earnings</span>
        </div>
      </div>

      {/* Grid: Best-Selling Products & Top Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best-Selling Products Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={16} className="text-emerald-500" />
              <span>Best-Selling Merchandise</span>
            </h4>
            <span className="text-xs text-slate-400">Ranked by volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2 text-center">Sales</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bestSelling.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-slate-400 block">{p.category}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-900 dark:text-white">{p.salesCount}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Organizations Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-emerald-500" />
              <span>Top Fundraising Organizations</span>
            </h4>
            <span className="text-xs text-slate-400">Total volume raised</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Organization</th>
                  <th className="pb-2 text-center">Campaigns</th>
                  <th className="pb-2 text-right">Total Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topOrgs.map((o, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      <span>{o.name}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block capitalize">{o.status}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-900 dark:text-white">{o.campaignsCount}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">{formatCurrency(o.totalRaised)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manufacturer SLA & Performance Scorecard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Factory size={16} className="text-emerald-500" />
          <span>Manufacturer Production & Delivery Scorecard</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold">
              <tr>
                <th className="p-3">Manufacturing Partner</th>
                <th className="p-3 text-center">On-Time Rate</th>
                <th className="p-3 text-center">Quality Rating</th>
                <th className="p-3 text-center">Active Production</th>
                <th className="p-3 text-right">Completed Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {manufacturers.map((m, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{m.name}</td>
                  <td className="p-3 text-center font-bold text-emerald-600">{m.onTimeRate}</td>
                  <td className="p-3 text-center font-bold text-amber-500">{m.qualityRating} / 5.0</td>
                  <td className="p-3 text-center font-semibold text-indigo-600">{m.activeQueue} units</td>
                  <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200">{m.completedOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
