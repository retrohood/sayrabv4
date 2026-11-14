import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  QrCode,
  Building2,
  CreditCard,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Lock,
  Heart,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';

const IBAN = 'PK21TMFB0000000098252908';

const PAYMENT_METHODS = [
  { value: 'easypaisa', label: 'Easypaisa', icon: Smartphone },
  { value: 'jazzcash', label: 'JazzCash', icon: Smartphone },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
  { value: 'other_wallet', label: 'Mobile Wallet', icon: Smartphone },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonationModal({ campaign, referralCode, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFundraiser = isFundraiserUser(user);

  const [donationMethod, setDonationMethod] = useState('online'); // 'online', 'qr', 'bank'
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ibanCopied, setIbanCopied] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  const handleCopyIBAN = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = IBAN;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2500);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');

    if (finalAmount <= 0) {
      setError('Please choose or enter a valid donation amount.');
      return;
    }

    if (isFundraiser) {
      setError('Fundraiser accounts cannot make donations to campaigns.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/donations', {
        campaignId: campaign._id,
        amount: finalAmount,
        paymentMethod: donationMethod === 'qr' ? 'qr_code' : paymentMethod,
        isAnonymous,
        donorName: user ? undefined : donorName || 'Anonymous Donor',
        donorEmail: user ? undefined : donorEmail || 'donor@sayrab.local',
        referralCode,
      });

      setPaymentSuccessData(res.data);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Donation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#172033]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-[#e5e9e3] animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e9e3] bg-[#f7f9f5] rounded-t-3xl">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#367c35]">
              Direct Campaign Donation
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#10182b] line-clamp-1">{campaign.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748b] hover:text-[#10182b] hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {paymentSuccessData ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#89ca2e]/25 text-[#367c35] rounded-full mx-auto flex items-center justify-center border-2 border-[#89ca2e]">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#10182b]">Thank You for Your Generosity!</h3>
              <p className="text-xs text-[#64748b]">
                Your donation has been recorded and allocated directly to this campaign fund.
              </p>
            </div>

            <div className="bg-[#f7f9f5] p-5 rounded-2xl border border-[#e5e9e3] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Amount Contributed:</span>
                <span className="font-black text-[#10182b] text-sm">{formatCurrency(paymentSuccessData.amount || finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Payment Channel:</span>
                <span className="font-bold text-[#10182b] uppercase">{paymentSuccessData.paymentMethod || paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Verification Status:</span>
                <span className="text-[#367c35] font-extrabold flex items-center gap-1">
                  <ShieldCheck size={14} /> Completed & Confirmed
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#10182b] hover:bg-[#172033] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Step 1: Suggested Amounts */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                1. Select Donation Amount (PKR)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                      amount === amt && !customAmount
                        ? 'bg-[#89ca2e] text-[#10182b] shadow-sm border-2 border-[#7bb926]'
                        : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                    }`}
                  >
                    Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative pt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b]">
                  Rs.
                </span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  placeholder="Or enter custom amount in PKR..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs sm:text-sm text-[#10182b] font-bold focus:outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
            </div>

            {/* Step 2: Payment Method Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                2. Choose Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDonationMethod('online')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    donationMethod === 'online'
                      ? 'bg-[#89ca2e]/20 border-[#89ca2e] text-[#367c35] font-black'
                      : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] font-bold'
                  }`}
                >
                  <CreditCard size={18} className="mx-auto mb-1" />
                  <span className="text-xs">Card / Wallets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDonationMethod('qr')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    donationMethod === 'qr'
                      ? 'bg-[#89ca2e]/20 border-[#89ca2e] text-[#367c35] font-black'
                      : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] font-bold'
                  }`}
                >
                  <QrCode size={18} className="mx-auto mb-1" />
                  <span className="text-xs">Instant QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDonationMethod('bank')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    donationMethod === 'bank'
                      ? 'bg-[#89ca2e]/20 border-[#89ca2e] text-[#367c35] font-black'
                      : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] font-bold'
                  }`}
                >
                  <Building2 size={18} className="mx-auto mb-1" />
                  <span className="text-xs">Bank Wire</span>
                </button>
              </div>

              {/* Online / Digital Wallet Selection */}
              {donationMethod === 'online' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {PAYMENT_METHODS.map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === method.value
                            ? 'bg-white border-[#89ca2e] ring-2 ring-[#89ca2e]/30 text-[#10182b] font-extrabold'
                            : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b]'
                        }`}
                      >
                        <MethodIcon size={16} className="text-[#367c35] shrink-0" />
                        <span className="text-xs">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* QR Code Presentation */}
              {donationMethod === 'qr' && (
                <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] text-center space-y-3">
                  <div className="w-36 h-36 bg-white border border-[#e5e9e3] rounded-2xl mx-auto p-2 flex items-center justify-center shadow-xs">
                    <img src="/QR.jpeg" alt="Sayrab QR Payment" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[11px] text-[#64748b] max-w-xs mx-auto">
                    Scan via Raast, Easypaisa, JazzCash, or any 1Link banking app to deposit directly into the Sayrab trust account.
                  </p>
                </div>
              )}

              {/* Bank Transfer Details */}
              {donationMethod === 'bank' && (
                <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">Bank:</span>
                    <strong className="text-[#10182b]">Telenor Microfinance Bank</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">Title:</span>
                    <strong className="text-[#10182b]">Sayrab Trust Relief Account</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#e5e9e3]">
                    <span className="text-[#64748b]">IBAN:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-[#10182b]">
                      <span>{IBAN}</span>
                      <button
                        type="button"
                        onClick={handleCopyIBAN}
                        className="p-1 hover:bg-white rounded text-[#367c35] cursor-pointer"
                      >
                        {ibanCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guest details if not logged in */}
            {!user && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#e5e9e3]">
                <div>
                  <label className="text-[11px] font-bold text-[#64748b]">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Generous Donor"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b]">Email (For Receipt)</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="donor@example.com"
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                  />
                </div>
              </div>
            )}

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-[#89ca2e] accent-[#89ca2e] cursor-pointer"
              />
              <label htmlFor="anonymous" className="text-xs text-[#64748b] cursor-pointer select-none">
                Make my donation anonymous on the public leaderboard
              </label>
            </div>

            {/* Donation Summary & Submit */}
            <div className="pt-2 border-t border-[#e5e9e3] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[#64748b]">Total Contribution:</span>
                <span className="text-xl font-black text-[#10182b]">{formatCurrency(finalAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10182b]" />
                ) : (
                  <>
                    <Heart size={16} className="fill-[#10182b]" />
                    Complete Donation of {formatCurrency(finalAmount)}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
