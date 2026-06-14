import { useState } from 'react';
import { X, QrCode, Building2, CreditCard, Copy, Check } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

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
      // Fallback for older browsers
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Donate Now</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600">
            Supporting: <strong>{campaign.title}</strong>
          </p>

          {/* Donation Method Tabs */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {methodTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDonationMethod(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                    donationMethod === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* QR Code Section */}
          {donationMethod === 'qr' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Scan the QR code below with your E-Wallet app (EasyPaisa, JazzCash, etc.) to donate:
                </p>
                <div className="inline-block p-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                  <img
                    src="/QR.jpeg"
                    alt="Donation QR Code"
                    className="w-56 h-56 object-contain mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Open your E-Wallet → Scan & Pay → Point your camera at this QR code
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> After completing the payment through your E-Wallet, 
                  please allow 24-48 hours for the donation to reflect on the campaign page.
                </p>
              </div>
            </div>
          )}

          {/* Bank Transfer Section */}
          {donationMethod === 'bank' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Transfer funds directly to the following bank account:
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Account Title</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">Sayarb Foundation</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Bank</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">Faysal Bank (TMFB)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">IBAN</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-sm font-mono font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded flex-1 break-all">
                      {IBAN}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyIBAN}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                    >
                      {ibanCopied ? <Check size={14} /> : <Copy size={14} />}
                      {ibanCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Include the campaign name "<em>{campaign.title}</em>" in the 
                  transfer reference/description so we can attribute your donation to this campaign.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> After completing the bank transfer, please allow 
                  1-3 business days for the donation to be verified and reflected on the campaign page.
                </p>
              </div>
            </div>
          )}

          {/* Online Payment Form */}
          {donationMethod === 'online' && (
            <form onSubmit={handleDonate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (PKR)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        amount === preset && !customAmount
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-slate-300 hover:border-primary-400'
                      }`}
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {!user && (
                <>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </>
              )}

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Donate anonymously
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !finalAmount || finalAmount < 1}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : `Donate PKR ${finalAmount?.toLocaleString()}`}
              </button>

              <p className="text-xs text-slate-500 text-center">
                {user ? 'Donating as registered user' : 'Donating as guest'}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
