import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, QrCode, Building2, CreditCard, Copy, Check, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { isFundraiserUser } from '../utils/format';

const IBAN = 'PK21TMFB0000000098252908';

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'other_wallet', label: 'Other Mobile Wallet' },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonationModal({ campaign, referralCode, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFundraiser = isFundraiserUser(user);
  const [donationMethod, setDonationMethod] = useState('qr'); // 'qr', 'bank', 'online'
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ibanCopied, setIbanCopied] = useState(false);

  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const handleCopyIBAN = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = IBAN;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2500);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate(`/auth?mode=login&redirect=/campaigns/${campaign.slug}`);
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
        paymentMethod,
        isAnonymous,
        donorName: user ? undefined : donorName,
        donorEmail: user ? undefined : donorEmail,
        referralCode,
      });
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Donation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const methodTabs = [
    { key: 'qr', label: 'QR Code', icon: QrCode },
    { key: 'bank', label: 'Bank Transfer', icon: Building2 },
    { key: 'online', label: 'Pay Online', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-800 animate-scale-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white">
              {isFundraiser ? 'Donation Restricted' : 'Make a Contribution'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">
              Supporting: <strong className="text-cyan-400">{campaign.title}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isFundraiser ? (
            <div className="space-y-4 py-2">
              <div className="p-5 bg-red-950/40 border border-red-800 rounded-2xl text-red-300 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <ShieldAlert size={18} />
                  <span>Donation Not Possible</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are currently logged in as a <strong>Fundraiser</strong>. According to platform rules, fundraiser accounts <strong>cannot donate to any campaign</strong> or buy merchandise products.
                </p>
                <p className="text-[11px] text-slate-400">
                  Please log out and use a registered Donor/Customer account if you would like to contribute.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                >
                  Go to Fundraiser Portal <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                {methodTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDonationMethod(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        donationMethod === tab.key
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* QR Code Section */}
              {donationMethod === 'qr' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-3">
                      Scan the QR code below with your E-Wallet app (EasyPaisa, JazzCash, etc.) to donate:
                    </p>
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
                      <img
                        src="/QR.jpeg"
                        alt="Donation QR Code"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3">
                      Open your E-Wallet → Scan & Pay → Point camera at this QR code
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">
                      🔒 <strong className="text-cyan-400">Note:</strong> After completing the transfer via your app, please allow 24-48 hours for our team to reconcile the payment to this campaign.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer Section */}
              {donationMethod === 'bank' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-2">
                      Transfer funds directly to the verified bank account:
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Account Title</p>
                      <p className="text-xs font-bold text-white mt-0.5">Sayarb Foundation</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Bank</p>
                      <p className="text-xs font-bold text-white mt-0.5">Faysal Bank (TMFB)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">IBAN</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex-1 break-all">
                          {IBAN}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyIBAN}
                          className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-lg hover:from-blue-500 hover:to-cyan-400 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                        >
                          {ibanCopied ? <Check size={13} /> : <Copy size={13} />}
                          {ibanCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-[11px] text-slate-400">
                    <p>
                      💡 <strong className="text-cyan-400">Tip:</strong> Include "<em>{campaign.title}</em>" in your transfer reference note.
                    </p>
                  </div>
                </div>
              )}

              {/* Online Payment Form */}
              {donationMethod === 'online' && (
                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">
                      Donation Amount (PKR)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setAmount(preset);
                            setCustomAmount('');
                          }}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            amount === preset && !customAmount
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Or enter custom amount in PKR"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="1"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!user && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <input
                        type="email"
                        placeholder="Your Email (optional)"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                    Donate anonymously on public supporter list
                  </label>

                  {error && (
                    <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isFundraiser || loading || !finalAmount || finalAmount < 1}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isFundraiser
                      ? 'Donations Disabled for Fundraiser Account'
                      : loading
                      ? 'Processing...'
                      : `Donate PKR ${finalAmount?.toLocaleString()}`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
