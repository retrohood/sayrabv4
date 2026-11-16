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

export default function ReportsView({ reports = {} }) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        <div>
          <h3 className="font-bold text-[#10182b] text-base flex items-center gap-2">
            <BarChart3 size={18} className="text-[#367c35]" />
            <span>Platform Financial & Governance Reports</span>
          </h3>
          <p className="text-xs text-[#64748b]">
            Consolidated analytics across merchandise sales, donations, and manufacturing SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] hover:bg-[#e5e9e3] text-[#10182b] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} className="text-[#64748b]" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] block mb-1">Gross Platform Volume</span>
          <h4 className="text-xl font-extrabold text-[#10182b]">
            {formatCurrency(summary.grossRevenue || 6450000)}
          </h4>
          <span className="text-[10px] text-[#367c35] font-bold mt-1 block">100% Gross Inflow</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] block mb-1">Organization Disbursements (50%)</span>
          <h4 className="text-xl font-extrabold text-[#367c35]">
            {formatCurrency(summary.organizationDisbursements || 3225000)}
          </h4>
          <span className="text-[10px] text-[#64748b] mt-1 block">Paid / Scheduled</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] block mb-1">Manufacturer Production (45%)</span>
          <h4 className="text-xl font-extrabold text-amber-700">
            {formatCurrency(summary.manufacturerPayouts || 2902500)}
          </h4>
          <span className="text-[10px] text-[#64748b] mt-1 block">Materials & Fulfillment</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] block mb-1">Sayrab Commission (5%)</span>
          <h4 className="text-xl font-extrabold text-[#10182b]">
            {formatCurrency(summary.platformGrossFees || 322500)}
          </h4>
          <span className="text-[10px] text-[#64748b] mt-1 block">Net Platform Earnings</span>
        </div>
      </div>

      {/* Grid: Best-Selling Products & Top Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best-Selling Merchandise Table */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-[#10182b] flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#367c35]" />
              <span>Best-Selling Merchandise</span>
            </h4>
            <span className="text-xs text-[#64748b]">Ranked by volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#64748b] font-bold border-b border-[#e5e9e3]">
                <tr>
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2 text-center">Sales</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9e3]">
                {bestSelling.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f9f5]/70 transition-colors">
                    <td className="py-2.5 font-medium text-[#10182b]">
                      <span>{p.name}</span>
                      <span className="text-[10px] text-[#64748b] block">{p.category}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#10182b]">{p.salesCount}</td>
                    <td className="py-2.5 text-right font-bold text-[#367c35]">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Organizations Table */}
        <div className="p-6 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-[#10182b] flex items-center gap-2">
              <Building2 size={16} className="text-[#367c35]" />
              <span>Top Fundraising Organizations</span>
            </h4>
            <span className="text-xs text-[#64748b]">Total volume raised</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#64748b] font-bold border-b border-[#e5e9e3]">
                <tr>
                  <th className="pb-2">Organization</th>
                  <th className="pb-2 text-center">Campaigns</th>
                  <th className="pb-2 text-right">Total Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9e3]">
                {topOrgs.map((o, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f9f5]/70 transition-colors">
                    <td className="py-2.5 font-medium text-[#10182b]">
                      <span>{o.name}</span>
                      <span className="text-[10px] text-[#367c35] font-semibold block capitalize">{o.status}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#10182b]">{o.campaignsCount}</td>
                    <td className="py-2.5 text-right font-bold text-[#367c35]">{formatCurrency(o.totalRaised)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manufacturer SLA & Performance Scorecard */}
      <div className="p-6 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        <h4 className="font-bold text-sm text-[#10182b] flex items-center gap-2 mb-4">
          <Factory size={16} className="text-[#367c35]" />
          <span>Manufacturer Production & Delivery Scorecard</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] font-bold">
              <tr>
                <th className="p-3">Manufacturing Partner</th>
                <th className="p-3 text-center">On-Time Rate</th>
                <th className="p-3 text-center">Quality Rating</th>
                <th className="p-3 text-center">Active Production</th>
                <th className="p-3 text-right">Completed Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
              {manufacturers.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#f7f9f5]/70 transition-colors">
                  <td className="p-3 font-semibold text-[#10182b]">{m.name}</td>
                  <td className="p-3 text-center font-bold text-[#367c35]">{m.onTimeRate}</td>
                  <td className="p-3 text-center font-bold text-amber-500">{m.qualityRating} / 5.0</td>
                  <td className="p-3 text-center font-semibold text-[#10182b]">{m.activeQueue} units</td>
                  <td className="p-3 text-right font-bold text-[#10182b]">{m.completedOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
