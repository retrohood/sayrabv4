import { useState, useEffect } from 'react';
import {
  Wallet,
  Building,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import api from '../../../api/client';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function FundraiserPayoutsView({
  campaigns = [],
  withdrawals = [],
  setWithdrawals,
  preselectedCampaign = null,
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    preselectedCampaign?._id || campaigns[0]?._id || ''
  );
  const [method, setMethod] = useState('bank'); // 'bank' | 'easypaisa' | 'jazzcash'
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('Meezan Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected campaign calculation
  const currentCampaign = campaigns.find((c) => c._id === selectedCampaignId) || campaigns[0];
  const maxAvailable = currentCampaign ? Number(currentCampaign.raisedAmount || currentCampaign.amountRaised || 0) : 0;

  useEffect(() => {
    if (preselectedCampaign?._id) {
      setSelectedCampaignId(preselectedCampaign._id);
    }
  }, [preselectedCampaign]);

  // Load existing withdrawals
  useEffect(() => {
    api
      .get('/withdrawals/my')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWithdrawals(res.data);
        }
      })
      .catch(() => {});
  }, [setWithdrawals]);

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCampaignId) {
      setError('Please select a campaign with eligible raised funds to withdraw.');
      return;
    }

    if (!accountHolderName) {
      setError('Please enter the Account Title / Beneficiary Name.');
      return;
    }

    if (method === 'bank' && !accountNumber && !iban) {
      setError('Please provide your Bank Account Number or IBAN.');
      return;
    }

    if ((method === 'easypaisa' || method === 'jazzcash') && !walletNumber) {
      setError('Please enter your mobile wallet phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: selectedCampaignId,
        accountHolderName,
        bankName: method === 'bank' ? bankName : method === 'easypaisa' ? 'EasyPaisa Wallet' : 'JazzCash Wallet',
        accountNumber: method === 'bank' ? accountNumber : walletNumber,
        iban: method === 'bank' ? iban : undefined,
        easypaisaNumber: method === 'easypaisa' ? walletNumber : undefined,
        jazzcashNumber: method === 'jazzcash' ? walletNumber : undefined,
        amount: Number(amount) || maxAvailable,
      };

      const res = await api.post('/withdrawals', payload);
      setSuccess('Withdrawal request submitted successfully! Platform admins will review and disburse.');
      setWithdrawals((prev) => [res.data, ...prev]);

      // Reset fields
      setAccountHolderName('');
      setAccountNumber('');
      setIban('');
      setWalletNumber('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Balance stats
  const totalApproved = withdrawals
    .filter((w) => w.status === 'approved' || w.status === 'processed' || w.status === 'completed')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const totalPending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <h2 className="text-xl font-black text-[#10182b]">Withdrawals & Payouts</h2>
        <p className="text-xs text-[#64748b]">
          Disburse verified campaign funds directly to your Pakistani bank account or mobile wallet
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Eligible Funds for Selected Campaign
          </span>
          <p className="text-2xl font-black text-[#367c35]">
            {formatCurrency(maxAvailable)}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1">
            {currentCampaign ? currentCampaign.title : 'No active campaign'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Pending Under Review
          </span>
          <p className="text-2xl font-black text-amber-600">
            {formatCurrency(totalPending)}
          </p>
          <p className="text-[11px] text-[#64748b] mt-1">
            Awaiting platform administration approval
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Total Disbursed to Date
          </span>
          <p className="text-2xl font-black text-[#10182b]">
            {formatCurrency(totalApproved)}
          </p>
          <p className="text-[11px] text-[#367c35] font-semibold mt-1">
            100% processed without deduction
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Left Request Form, Right Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (Col 6) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
            <Wallet size={16} className="text-[#367c35]" />
            <span>Request New Disbursement</span>
          </h3>

          <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
            {/* Campaign Selection */}
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Select Source Campaign *
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
              >
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} — {formatCurrency(c.raisedAmount || c.amountRaised || 0)} available
                  </option>
                ))}
              </select>
            </div>

            {/* Method Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1.5">
                Disbursement Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bank', label: 'Bank Account', icon: Building },
                  { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
                  { id: 'jazzcash', label: 'JazzCash', icon: Smartphone },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        method === m.id
                          ? 'bg-[#89ca2e]/10 border-[#89ca2e] text-[#367c35]'
                          : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] hover:text-[#10182b]'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Title */}
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Account Title / Beneficiary Full Name *
              </label>
              <input
                type="text"
                placeholder="Must match your official CNIC name exactly"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            {/* Bank Fields */}
            {method === 'bank' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  >
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                    <option value="Bank Alfalah">Bank Alfalah</option>
                    <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                    <option value="MCB Bank">MCB Bank</option>
                    <option value="Faysal Bank">Faysal Bank</option>
                    <option value="Allied Bank Limited">Allied Bank Limited</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01010102020202"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                    IBAN (24 Characters)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PK36MEZN0000000101010202"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>
              </>
            )}

            {/* Wallet Fields */}
            {(method === 'easypaisa' || method === 'jazzcash') && (
              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  {method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Mobile Account Number *
                </label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
            )}

            {/* Requested Amount */}
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Withdrawal Amount (PKR)
              </label>
              <input
                type="number"
                placeholder={`Leave empty to withdraw full ${formatCurrency(maxAvailable)}`}
                value={amount}
                max={maxAvailable}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || maxAvailable <= 0}
              className="w-full py-3 bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Right Table: Payout History (Col 6) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#367c35]" />
              <span>Withdrawal Request History</span>
            </h3>

            {withdrawals.length === 0 ? (
              <div className="text-center py-12 text-[#64748b]">
                <FileText size={32} className="mx-auto text-[#64748b] mb-2" />
                <p className="text-xs font-bold text-[#10182b]">No withdrawal requests yet</p>
                <p className="text-[11px] mt-1">
                  Once your campaigns gather funds, submitted disbursement requests will show up here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e5e9e3]">
                {withdrawals.map((w) => {
                  const isApproved = w.status === 'approved' || w.status === 'processed' || w.status === 'completed';
                  const isPending = w.status === 'pending';

                  return (
                    <div key={w._id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#10182b]">
                            {w.bankName || 'Disbursement'}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-green-100 text-green-700'
                                : isPending
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {w.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          {w.accountHolderName} • {w.accountNumber || w.easypaisaNumber || w.jazzcashNumber}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          {formatDate(w.createdAt)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-[#10182b] block">
                          {formatCurrency(w.amount)}
                        </span>
                        {isApproved && (
                          <span className="text-[10px] text-[#367c35] font-semibold flex items-center justify-end gap-0.5">
                            <CheckCircle2 size={11} /> Disbursed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#e5e9e3] text-[11px] text-[#64748b] flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#367c35] shrink-0" />
            <span>Disbursements undergo verification for financial integrity and compliance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
