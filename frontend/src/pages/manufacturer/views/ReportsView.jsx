import { TrendingUp, Download, Clock, CheckCircle2, DollarSign, Calendar, FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsView({ reportsData }) {
  const data = reportsData || {
    totalOrders: 0,
    completedOrders: 0,
    averageProductionTime: 4.2,
    onTimeDeliveryRate: 98,
    totalEarnings: 0,
    history: [],
  };

  const exportCSV = () => {
    if (!data.history || data.history.length === 0) {
      alert('No history records available to export.');
      return;
    }
    const headers = ['Order ID', 'Invoice Number', 'Total Order Value (PKR)', 'Manufacturer Earnings (PKR)', 'Status', 'Date'];
    const rows = data.history.map(h => [
      h.orderId,
      h.invoice,
      h.total,
      h.manufacturerEarnings,
      h.status,
      new Date(h.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manufacturer_Production_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Buttons */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Production & SLA SLA Performance Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze historical fulfillment velocity, completed orders count, SLA compliance %, and download production logs.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => alert('Exporting PDF Report...')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Production Jobs</span>
          <div className="text-2xl font-black text-white">{data.totalOrders}</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Completed & Delivered</span>
          <div className="text-2xl font-black text-emerald-400">{data.completedOrders}</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">On-Time Delivery Rate</span>
          <div className="text-2xl font-black text-indigo-400">{data.onTimeDeliveryRate}%</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Avg Production SLA</span>
          <div className="text-2xl font-black text-cyan-400">{data.averageProductionTime} Days</div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">
          Production History Log
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">45% Earnings</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No production history recorded yet.
                  </td>
                </tr>
              ) : (
                data.history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">#{item.invoice}</td>
                    <td className="p-4">PKR {item.total?.toLocaleString()}</td>
                    <td className="p-4 font-bold text-emerald-400">PKR {item.manufacturerEarnings?.toLocaleString()}</td>
                    <td className="p-4 capitalize text-indigo-300">{item.status.replace('_', ' ')}</td>
                    <td className="p-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
