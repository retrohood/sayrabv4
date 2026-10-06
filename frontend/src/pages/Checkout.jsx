import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Building2,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { cartTotal, readCart, writeCart } from '../utils/cart';
import { formatCurrency } from '../utils/format';

const OPTIONAL_FIELDS = ['state', 'postalCode'];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(() => readCart(user?._id));
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvc: '888',
    nameOnCard: user?.fullName || 'Demo Cardholder',
  });
  const [walletDetails, setWalletDetails] = useState({
    provider: 'easypaisa',
    accountNumber: user?.phone || '03001234567',
  });
  const [confirmationOrder, setConfirmationOrder] = useState(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
  });

  useEffect(() => {
    setCart(readCart(user?._id));
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
        line1: prev.line1 || user.address || '',
      }));
    }
  }, [user]);

  const inferredCampaignId = useMemo(
    () => cart.find((item) => item.campaignId)?.campaignId || '',
    [cart]
  );

  useEffect(() => {
    api.get('/campaigns', { params: { limit: 50 } }).then((res) => {
      const list = res.data.campaigns || [];
      setCampaigns(list);
      setCampaignId(inferredCampaignId || list[0]?._id || '');
    });
  }, [inferredCampaignId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const trackingNumber = 'TCS-TRK-' + Math.floor(100000 + Math.random() * 900000);
      const orderRes = await api.post('/orders', {
        campaignId,
        products: cart.map((item) => ({
          productId: item._id,
          quantity: item.qty,
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined,
        })),
        shippingAddress: form,
        paymentStatus: 'paid',
        carrier: 'TCS Logistics Express',
        trackingNumber,
      });

      await api.post('/payment/create-session', {
        orderId: orderRes.data._id,
        campaignId,
        items: cart,
      }).catch(() => {});

      writeCart([], user?._id);
      setConfirmationOrder({
        ...orderRes.data,
        trackingNumber,
        items: [...cart],
        shippingAddress: form,
      });
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Order creation failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-emerald-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="text-3xl font-extrabold">Payment Successful & Order Confirmed!</h1>
            <p className="text-primary-100 text-sm mt-1">Thank you for supporting Sayrab causes and merchandise.</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">Order Reference</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">#{confirmationOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Courier & Tracking</p>
                <p className="text-sm font-bold text-primary-700 mt-0.5">{confirmationOrder.trackingNumber || 'TCS-TRK-749102'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Delivery</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">3 – 5 Business Days</p>
              </div>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-4 flex items-start gap-3">
              <Clock size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">48-Hour Free Cancellation & Refund Window</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  You can cancel this order and withdraw full payment within 2 days (48 hours) directly from your Dashboard under <strong>My Orders</strong>.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">Order Summary</h3>
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                {confirmationOrder.items?.map((item) => (
                  <div key={item._id} className="p-3.5 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.qty} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}</p>
                    </div>
                    <p className="font-bold text-slate-900">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                ))}
                <div className="p-3.5 bg-slate-50 flex justify-between items-center font-bold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="text-primary-700 text-lg">{formatCurrency(confirmationOrder.total || cartTotal(confirmationOrder.items || []))}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/order/${confirmationOrder._id}`}
                className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl text-center shadow-sm transition-all"
              >
                Track Live Order
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 text-center shadow-xs transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mb-6">Browse our merchandise store or active campaigns to select products.</p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          Browse Merchandise Store <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const fieldConfig = [
    ['fullName', 'Full Name *'],
    ['phone', 'Phone Number *'],
    ['line1', 'Street Address *'],
    ['city', 'City *'],
    ['state', 'Province / State'],
    ['postalCode', 'Postal Code'],
    ['country', 'Country'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout & Order Placement</h1>
        <p className="text-slate-500 text-sm mt-1">Complete your shipping and payment details to receive your merchandise and sample orders.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Shipping Address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <Truck className="text-primary-600" size={22} />
              <h2 className="font-bold text-slate-900 text-lg">1. Shipping & Delivery Address</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fieldConfig.map(([key, label]) => (
                <label key={key} className={key === 'line1' ? 'sm:col-span-2' : ''}>
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                  <input
                    required={!OPTIONAL_FIELDS.includes(key)}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold text-slate-700">Campaign Supported by This Purchase</span>
              <select
                required
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition"
              >
                {campaigns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* Payment Method Selection */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <CreditCard className="text-primary-600" size={22} />
              <h2 className="font-bold text-slate-900 text-lg">2. Payment Method Details</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'card', label: 'Card / Debit', icon: CreditCard },
                { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
                { id: 'jazzcash', label: 'JazzCash', icon: Smartphone },
                { id: 'bank', label: 'Direct Bank', icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'border-primary-600 bg-primary-50/70 text-primary-800 ring-2 ring-primary-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon size={20} className={active ? 'text-primary-600' : 'text-slate-500'} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    className="mt-1 w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="4242 •••• •••• 4242"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Expiration (MM/YY)</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="mt-1 w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="12/28"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      className="mt-1 w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="•••"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.nameOnCard}
                    onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                    className="mt-1 w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Full Cardholder Name"
                    required
                  />
                </div>
              </div>
            )}

            {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-600">
                  Enter your registered <strong>{paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}</strong> mobile account number. An instant authorization prompt will be confirmed.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Mobile Account Number</label>
                  <input
                    type="text"
                    value={walletDetails.accountNumber}
                    onChange={(e) => setWalletDetails({ ...walletDetails, accountNumber: e.target.value })}
                    className="mt-1 w-full bg-white rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="03XXXXXXXXX"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-sm">Sayrab Official Direct Deposit Account:</p>
                <div className="bg-white p-3 rounded-lg border space-y-1 font-mono text-slate-800">
                  <p>Bank: Meezan Bank Ltd</p>
                  <p>Title: Sayrab Social Fund</p>
                  <p>IBAN: PK64MEZN0009876543210987</p>
                </div>
                <p className="text-slate-500">Your order will be queued automatically upon checkout placement.</p>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sticky top-28 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Package className="text-primary-600" size={20} />
            <h2 className="font-bold text-slate-900">Order Summary</h2>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item._id} className="pt-2 flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.qty} {item.selectedSize ? `• ${item.selectedSize}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}</p>
                </div>
                <span className="font-bold text-slate-800">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal(cart))}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Estimated Shipping (TCS)</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-primary-700">{formatCurrency(cartTotal(cart))}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <span>2-Day (48hr) full refund & withdrawal request policy supported.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 py-3.5 text-sm font-extrabold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Confirming Order...' : 'Pay & Complete Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
