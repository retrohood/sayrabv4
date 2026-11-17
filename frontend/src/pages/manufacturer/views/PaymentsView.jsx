import { DollarSign, CheckCircle2, Clock, Calendar, ArrowUpRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function PaymentsView({ paymentsData }) {
  const summary = paymentsData?.summary || { totalEarned: 0, pendingPayout: 0, revenueShare: '45%' };
  const ledger = paymentsData?.ledger || [];

  const statusColors = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Total Revenue Paid Out (45%)
          </span>
          <div className="text-2xl font-black text-[#367c35]">
            PKR {summary.totalEarned?.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#367c35]" /> Settled to Bank Account
          </p>
        </div>

        <div className="p-5 bg-white border border-[#e5e9e3] rounded-3xl shadow-sm hover:border-[#89ca2e]/60 transition">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Pending / Escrow Payouts
          </span>
          <div className="text-2xl font-black text-amber-600">
            PKR {summary.pendingPayout?.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#64748b] mt-1 font-medium">
            Released upon delivery confirmation
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-[#10182b] to-[#1e293b] text-white rounded-3xl shadow-sm border border-[#10182b]">
          <span className="text-xs font-bold text-[#89ca2e] uppercase tracking-wider block mb-1">
            Mandated Split Rule
          </span>
          <div className="text-2xl font-black text-white">
            45% Per Unit
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-medium">
            50% Org • 45% Mfg • 5% Sayrab
          </p>
        </div>
      </div>

      {/* Earnings Ledger Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#e5e9e3] flex items-center justify-between">
          <h3 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#89ca2e]/10 text-[#367c35] border border-[#89ca2e]/20">
              <DollarSign className="w-4 h-4" />
            </span>
            Manufacturer Earnings Ledger
          </h3>
          <span className="text-xs font-bold text-[#64748b] bg-[#f5f7fb] px-3 py-1 rounded-xl border border-[#e5e9e3]">
            {ledger.length} Payment Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] text-[#64748b] font-bold border-b border-[#e5e9e3] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Campaign</th>
                <th className="p-4">Total Order Value</th>
                <th className="p-4">Amount Earned (45%)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#172033]">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#94a3b8]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item._id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4 font-bold text-[#172033]">{item.invoiceNumber}</td>
                    <td className="p-4 font-bold text-[#0ea5c6]">{item.campaignName}</td>
                    <td className="p-4 text-[#64748b] font-mono">PKR {item.totalOrderValue?.toLocaleString()}</td>
                    <td className="p-4 font-black font-mono text-[#367c35]">PKR {item.amountEarned?.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                          statusColors[item.paymentStatus] || 'bg-gray-100 text-[#64748b] border-gray-200'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#64748b]">{item.transactionRef}</td>
                    <td className="p-4 text-[#64748b]">
                      {new Date(item.paymentDate).toLocaleDateString()}
                    </td>
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
