import { useState } from 'react';
import {
  Coins,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Megaphone,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Send,
  UploadCloud,
  FileCheck,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function PayoutsView({ payouts, onReviewPayout }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transferModal, setTransferModal] = useState(null); // payout
  const [transferForm, setTransferForm] = useState({
    transactionId: '',
    transferProof: '',
    adminNote: '',
  });
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const statuses = ['all', 'requested', 'pending_review', 'scheduled', 'processing', 'paid', 'rejected'];

  const filteredPayouts = payouts.filter((p) => {
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch =
      !search ||
      p.organization?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.campaign?.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.accountHolderName?.toLowerCase().includes(search.toLowerCase()) ||
      p.bankName?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleExecuteTransfer = async () => {
    if (!transferForm.transactionId.trim()) {
      alert('Please enter a Transaction ID or Raast/Bank Reference Number.');
      return;
    }

    setProcessing(true);
    try {
      await onReviewPayout(transferModal._id, {
        status: 'paid',
        transactionId: transferForm.transactionId,
        transferProof: transferForm.transferProof || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
        adminNote: transferForm.adminNote || 'Funds transferred successfully.',
      });
      setTransferModal(null);
      setTransferForm({ transactionId: '', transferProof: '', adminNote: '' });
      if (selectedPayout?._id === transferModal._id) {
        setSelectedPayout((prev) => ({ ...prev, status: 'paid', transactionId: transferForm.transactionId }));
      }
    } catch (e) {
      alert(e.message || 'Transfer failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejecting this payout request.');
      return;
    }

    setProcessing(true);
    try {
      await onReviewPayout(rejectModal._id, {
        status: 'rejected',
        rejectionReason,
      });
      setRejectModal(null);
      setRejectionReason('');
      if (selectedPayout?._id === rejectModal._id) {
        setSelectedPayout((prev) => ({ ...prev, status: 'rejected', rejectionReason }));
      }
    } catch (e) {
      alert(e.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={12} />
            <span>Paid</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <Clock size={12} />
            <span>Scheduled (7d Hold)</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <Clock size={12} />
            <span>Processing</span>
          </span>
        );
      case 'pending_review':
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock size={12} />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle size={12} />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className="text-xs font-semibold capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Workflow Process Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>Statutory Withdrawal & Payout Governance Workflow</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
            50% Org &bull; 45% Mfg &bull; 5% Sayrab
          </span>
        </div>

        {/* 5-Step Visual Workflow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold text-emerald-600 mb-0.5">STEP 1</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Org Requests Payout</div>
            <div className="text-[10px] text-slate-400 mt-1">Submit bank credentials</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold text-emerald-600 mb-0.5">STEP 2</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Campaign End Check</div>
            <div className="text-[10px] text-slate-400 mt-1">Must be completed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold text-amber-500 mb-0.5">STEP 3</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">7-Day Refund Hold</div>
            <div className="text-[10px] text-slate-400 mt-1">Dispute window buffer</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold text-emerald-600 mb-0.5">STEP 4</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Admin Audit</div>
            <div className="text-[10px] text-slate-400 mt-1">Approve / Adjust Split</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">STEP 5</div>
            <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Transfer & Proof</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">TxID + Proof Receipt</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s === 'all' ? 'All Payouts' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search org, campaign, bank..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Organization & Campaign</th>
                <th className="py-3.5 px-4">Gross Revenue</th>
                <th className="py-3.5 px-4">50/45/5 Split Breakdown</th>
                <th className="py-3.5 px-4">Dispute Window (7 Days)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((p) => {
                  const gross = p.totalRevenue || p.amount * 2 || 100000;
                  const orgShare = p.organizationShare || Math.round(gross * 0.5);
                  const mfgShare = p.manufacturerShare || Math.round(gross * 0.45);
                  const platformFee = p.platformFee || Math.round(gross * 0.05);
                  const isEligible = p.isRefundWindowPassed !== false;

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {p.organization?.name || p.accountHolderName}
                        </div>
                        <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium truncate mt-0.5">
                          {p.campaign?.title || 'General Campaign Funds'}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-mono">
                          {p.bankName} &bull; {p.accountNumber}
                        </p>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(gross)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                            Org (50%): {formatCurrency(orgShare)}
                          </div>
                          <div className="text-amber-600 dark:text-amber-400">
                            Mfg (45%): {formatCurrency(mfgShare)}
                          </div>
                          <div className="text-pink-600 dark:text-pink-400">
                            Sayrab (5%): {formatCurrency(platformFee)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {p.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 size={13} />
                            <span>Cleared & Paid</span>
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                            <CheckCircle2 size={11} />
                            <span>Eligible Now</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                            <Clock size={11} />
                            <span>Dispute Hold Active</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Requested: {formatDate(p.requestedDate || p.createdAt || new Date())}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPayout(p)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-[11px]"
                          >
                            Details
                          </button>
                          {p.status !== 'paid' && p.status !== 'rejected' && (
                            <>
                              <button
                                onClick={() => setTransferModal(p)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs"
                              >
                                Disburse
                              </button>
                              <button
                                onClick={() => setRejectModal(p)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payout requests found for current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Funds & Transfer Proof Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
              <DollarSign size={20} />
              <span>Execute Payout Transfer</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Disbursing <strong>{formatCurrency(transferModal.organizationShare || transferModal.amount)}</strong> (50% Org Share) to{' '}
              <strong>{transferModal.organization?.name || transferModal.accountHolderName}</strong>.
            </p>

            {/* Bank Target Details Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-1 font-mono">
              <p className="text-slate-500">Bank: <strong className="text-slate-900 dark:text-white font-sans">{transferModal.bankName}</strong></p>
              <p className="text-slate-500">Title: <strong className="text-slate-900 dark:text-white font-sans">{transferModal.accountHolderName}</strong></p>
              <p className="text-slate-500">Account #: <strong className="text-slate-900 dark:text-white">{transferModal.accountNumber}</strong></p>
              <p className="text-slate-500">IBAN: <strong className="text-slate-900 dark:text-white">{transferModal.iban}</strong></p>
            </div>

            <div className="space-y-3 mb-5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bank / Raast / Stripe Transaction ID (Required)
                </label>
                <input
                  type="text"
                  value={transferForm.transactionId}
                  onChange={(e) => setTransferForm({ ...transferForm, transactionId: e.target.value })}
                  placeholder="e.g. TXN-MEZN-99824102 or RAAST-881290"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transfer Proof Receipt URL (Optional image/PDF link)
                </label>
                <input
                  type="text"
                  value={transferForm.transferProof}
                  onChange={(e) => setTransferForm({ ...transferForm, transferProof: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Admin Transfer Note
                </label>
                <input
                  type="text"
                  value={transferForm.adminNote}
                  onChange={(e) => setTransferForm({ ...transferForm, adminNote: e.target.value })}
                  placeholder="e.g. Disbursed via standard bank settlement."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                disabled={processing}
                onClick={() => setTransferModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={processing}
                onClick={handleExecuteTransfer}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                {processing ? 'Recording...' : 'Mark as Transferred & Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payout Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-rose-600 mb-1">Reject Payout Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the specific reason for rejecting this payout request.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rejection Reason (Required)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Discrepancy in bank title, active donor disputes, etc."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Inspection Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Payout Request Details</span>
                  {getStatusBadge(selectedPayout.status)}
                </h3>
                <p className="text-xs text-slate-400">{selectedPayout.organization?.name || 'Organization'}</p>
              </div>
              <button
                onClick={() => setSelectedPayout(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] block">Gross Campaign Revenue</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedPayout.totalRevenue || selectedPayout.amount * 2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Organization Share (50%)</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(selectedPayout.organizationShare || selectedPayout.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Manufacturer Share (45%)</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(selectedPayout.manufacturerShare || Math.round((selectedPayout.totalRevenue || selectedPayout.amount * 2) * 0.45))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Sayrab Platform Fee (5%)</span>
                  <span className="font-medium text-pink-600">
                    {formatCurrency(selectedPayout.platformFee || Math.round((selectedPayout.totalRevenue || selectedPayout.amount * 2) * 0.05))}
                  </span>
                </div>
              </div>

              {selectedPayout.transactionId && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block">Disbursement Transaction ID:</span>
                  <span className="font-mono text-xs">{selectedPayout.transactionId}</span>
                </div>
              )}

              {selectedPayout.transferProof && (
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white mb-1.5">Transfer Proof Document:</span>
                  <a
                    href={selectedPayout.transferProof}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                  >
                    <span>View Transfer Receipt</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {selectedPayout.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800">
                  <span className="font-bold block">Rejection Reason:</span>
                  <p>{selectedPayout.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
