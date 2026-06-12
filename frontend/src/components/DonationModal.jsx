import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'qr_code', label: 'QR Code Payment' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'other_wallet', label: 'Other Mobile Wallet' },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonationModal({ campaign, referralCode, onClose, onSuccess }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Donate Now</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleDonate} className="p-6 space-y-5">
          <p className="text-sm text-slate-600">
            Supporting: <strong>{campaign.title}</strong>
          </p>

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
      </div>
    </div>
  );
}
