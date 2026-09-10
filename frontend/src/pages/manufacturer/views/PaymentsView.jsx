import { DollarSign, CheckCircle2, Clock, Calendar, ArrowUpRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function PaymentsView({ paymentsData }) {
  const summary = paymentsData?.summary || { totalEarned: 0, pendingPayout: 0, revenueShare: '45%' };
  const ledger = paymentsData?.ledger || [];

  const statusColors = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Revenue Paid Out (45%)
          </span>
          <div className="text-2xl font-black text-emerald-400">
            PKR {summary.totalEarned?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Settled to Bank Account
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Pending / Escrow Payouts
          </span>
          <div className="text-2xl font-black text-amber-400">
            PKR {summary.pendingPayout?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Released upon delivery confirmation
          </p>
        </div>

        <div className="p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block mb-1">
            Mandated Split Rule
          </span>
          <div className="text-2xl font-black text-white">
            45% Per Unit
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            50% Org • 45% Mfg • 5% Sayrab
          </p>
        </div>
      </div>

      {/* Earnings Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Manufacturer Earnings Ledger
          </h3>
          <span className="text-xs text-slate-400">{ledger.length} Payment Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{item.invoiceNumber}</td>
                    <td className="p-4 font-semibold text-indigo-400">{item.campaignName}</td>
                    <td className="p-4 text-slate-300">PKR {item.totalOrderValue?.toLocaleString()}</td>
                    <td className="p-4 font-bold text-emerald-400">PKR {item.amountEarned?.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize ${
                          statusColors[item.paymentStatus] || 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">{item.transactionRef}</td>
                    <td className="p-4 text-slate-400">
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
