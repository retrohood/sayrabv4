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
      <div className="bg-white border border-[#e5e9e3] p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            Production & SLA Performance Reports
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Analyze historical fulfillment velocity, completed orders count, SLA compliance %, and download production logs.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => alert('Exporting PDF Report...')}
            className="px-3.5 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition space-y-1">
          <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Total Production Jobs</span>
          <div className="text-2xl font-black text-[#172033]">{data.totalOrders}</div>
        </div>

        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition space-y-1">
          <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Completed & Delivered</span>
          <div className="text-2xl font-black text-[#367c35]">{data.completedOrders}</div>
        </div>

        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition space-y-1">
          <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider">On-Time Delivery Rate</span>
          <div className="text-2xl font-black text-[#0ea5c6]">{data.onTimeDeliveryRate}%</div>
        </div>

        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition space-y-1">
          <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider">Avg Production SLA</span>
          <div className="text-2xl font-black text-[#172033]">{data.averageProductionTime} Days</div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#e5e9e3] font-black text-[#172033] text-sm">
          Production History Log
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] text-[#64748b] font-bold border-b border-[#e5e9e3] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Total Value</th>
                <th className="p-4">45% Earnings</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#172033]">
              {data.history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[#94a3b8]">
                    No production history recorded yet.
                  </td>
                </tr>
              ) : (
                data.history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4 font-bold text-[#172033]">#{item.invoice}</td>
                    <td className="p-4 text-[#64748b] font-mono">PKR {item.total?.toLocaleString()}</td>
                    <td className="p-4 font-black font-mono text-[#367c35]">PKR {item.manufacturerEarnings?.toLocaleString()}</td>
                    <td className="p-4 capitalize text-[#0ea5c6] font-bold">{item.status.replace('_', ' ')}</td>
                    <td className="p-4 text-[#64748b]">{new Date(item.createdAt).toLocaleDateString()}</td>
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
