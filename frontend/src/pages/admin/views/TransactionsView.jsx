import { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Download,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function TransactionsView({
  transactions = [],
  onFlagTransaction,
}) {
  const [search, setSearch] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [flagModal, setFlagModal] = useState(null); // txn
  const [flagReason, setFlagReason] = useState('');

  const filtered = transactions.filter((t) => {
    if (suspiciousOnly && !t.isSuspicious) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.stripePaymentIntentId?.toLowerCase().includes(q) ||
      t.customer?.fullName?.toLowerCase().includes(q) ||
      t.customer?.email?.toLowerCase().includes(q) ||
      t.campaignTitle?.toLowerCase().includes(q)
    );
  });

  const handleToggleFlag = async () => {
    if (!flagModal) return;
    try {
      await onFlagTransaction(flagModal._id, !flagModal.isSuspicious, flagReason);
      setFlagModal(null);
      setFlagReason('');
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer Name', 'Customer Email', 'Gross Amount (PKR)', 'Platform Fee (PKR)', 'Status', 'Date', 'Flagged Suspicious'];
    const rows = filtered.map((t) => [
      t.stripePaymentIntentId,
      t.customer?.fullName || 'Anonymous',
      t.customer?.email || '',
      t.amount,
      t.platformFee,
      t.status,
      new Date(t.date || Date.now()).toISOString(),
      t.isSuspicious ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sayrab_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSuspiciousOnly(!suspiciousOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              suspiciousOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] border border-[#e5e9e3]'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Suspicious Activity Only</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Stripe ID, customer..."
              className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] focus:border-[#89ca2e] focus:bg-white rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:outline-hidden transition-colors"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] hover:bg-[#e5e9e3] text-[#10182b] font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-[#64748b]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Stripe Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Campaign</th>
                <th className="py-3.5 px-4">Gross Amount</th>
                <th className="py-3.5 px-4">Sayrab Fee (5%)</th>
                <th className="py-3.5 px-4">Security / Fraud</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-[#f7f9f5]/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-mono text-xs font-bold text-[#10182b] block">
                        {t.stripePaymentIntentId}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {formatDate(t.date || new Date())} &bull; {t.paymentMethod || 'Card'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#10182b] block">
                        {t.customer?.fullName || 'Guest Donor'}
                      </span>
                      <span className="text-[11px] text-[#64748b]">{t.customer?.email}</span>
                    </td>
                    <td className="py-4 px-4 max-w-xs font-semibold text-[#367c35] truncate">
                      {t.campaignTitle || 'Platform Contribution'}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#10182b] text-sm">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#10182b]">
                      {formatCurrency(t.platformFee || t.amount * 0.05)}
                    </td>
                    <td className="py-4 px-4">
                      {t.isSuspicious ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={11} />
                            <span>Suspicious Flag</span>
                          </span>
                          {t.suspiciousReason && (
                            <p className="text-[10px] text-rose-700 truncate max-w-xs">{t.suspiciousReason}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#367c35] font-semibold">
                          <CheckCircle2 size={13} />
                          <span>Clear</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setFlagModal(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          t.isSuspicious
                            ? 'bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] hover:bg-[#e5e9e3]'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {t.isSuspicious ? 'Remove Flag' : 'Flag Fraud'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flag / Unflag Security Modal */}
      {flagModal && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-[#10182b] mb-2">
              {flagModal.isSuspicious ? 'Remove Fraud Flag' : 'Flag Suspicious Transaction'}
            </h3>
            <p className="text-[#64748b] mb-4">
              Payment Reference: <strong className="font-mono text-[#10182b]">{flagModal.stripePaymentIntentId}</strong>
            </p>

            {!flagModal.isSuspicious && (
              <div className="space-y-1.5 mb-5">
                <label className="font-semibold text-[#10182b]">
                  Security / Fraud Concern Reason
                </label>
                <textarea
                  rows={3}
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Card velocity anomaly, suspicious disposable email, chargeback risk..."
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setFlagModal(null)}
                className="px-4 py-2 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleFlag}
                className="px-5 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
