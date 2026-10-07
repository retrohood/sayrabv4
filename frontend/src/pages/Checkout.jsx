import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { cartTotal, readCart, writeCart } from '../utils/cart';
import { formatCurrency, isFundraiserUser } from '../utils/format';

const OPTIONAL_FIELDS = ['state', 'postalCode'];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const [cart, setCart] = useState(() => readCart(user?._id));

  useEffect(() => {
    setCart(readCart(user?._id));
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '',
    country: 'Pakistan',
  });

  const inferredCampaignId = useMemo(
    () => cart.find((item) => item.campaignId)?.campaignId || '',
    [cart]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOrderError('');

    if (!user) {
      navigate('/auth?mode=login&redirect=/checkout');
      return;
    }

    if (isFundraiser) {
      setOrderError('Fundraiser accounts cannot purchase merchandise or place orders.');
      return;
    }

    setSubmitting(true);

    try {
      const targetCampaignId =
        inferredCampaignId ||
        cart.find((item) => item.campaignId)?.campaignId ||
        (cart[0]?.campaignId?._id || cart[0]?.campaignId) ||
        undefined;

      const orderRes = await api.post('/orders', {
        campaignId: targetCampaignId,
        products: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty || 1,
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined,
        })),
        shippingAddress: form,
        paymentStatus: 'paid',
      });

      try {
        await api.post('/payment/create-session', {
          orderId: orderRes.data._id,
          campaignId: targetCampaignId,
          items: cart,
        });
      } catch (sessErr) {
        console.warn('Payment session notification info:', sessErr);
      }

      writeCart([], user?._id);
      navigate('/dashboard');
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to Checkout</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You must be logged in or registered as a <strong>Buyer</strong> to checkout items and place merchandise orders.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=login&redirect=/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/25"
            >
              Sign In / Register <ArrowRight size={15} />
            </Link>
            <Link
              to="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold rounded-xl text-xs transition-all"
            >
              Browse Merchandise Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-24 text-center text-slate-400">
        <p className="text-sm">Your cart is empty.</p>
        <Link to="/store" className="mt-4 inline-block text-xs font-bold text-cyan-400 hover:underline">
          Return to Merchandise Store →
        </Link>
      </div>
    );
  }

  const fieldConfig = [
    ['fullName', 'Full name'],
    ['phone', 'Phone'],
    ['line1', 'Delivery Address'],
    ['city', 'City'],
    ['state', 'State / Province (optional)'],
    ['postalCode', 'Postal code (optional)'],
    ['country', 'Country'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {isFundraiser && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Fundraiser Account Notice <span>•</span> Orders Restricted
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fundraiser accounts cannot place merchandise orders. Store purchases are designated for buyers and donors. Please log in with a customer/donor account to complete your purchase.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
          >
            My Fundraiser Portal <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Checkout</h1>
        <p className="text-slate-400 text-xs mt-1">Complete your shipping information and verify payment.</p>
      </div>

      {orderError && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 rounded-2xl text-xs font-semibold">
          {orderError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="font-extrabold text-white text-sm uppercase tracking-wider text-cyan-400">
            Shipping & Delivery Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldConfig.map(([key, label]) => (
              <label key={key} className={key === 'line1' ? 'sm:col-span-2' : ''}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {label} {!OPTIONAL_FIELDS.includes(key) && '*'}
                </span>
                <input
                  required={!OPTIONAL_FIELDS.includes(key)}
                  disabled={key === 'country'}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-slate-950 disabled:text-slate-500"
                />
              </label>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-6 shadow-xl space-y-4">
          <h2 className="font-extrabold text-white text-sm uppercase tracking-wider text-cyan-400">
            Payment & Summary
          </h2>
          <p className="text-[11px] text-slate-400">Payment will be settled securely through integrated payment gateways.</p>
          
          <div className="space-y-2 border-t border-slate-800 pt-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-xs text-slate-300">
                <span className="truncate max-w-[160px]">{item.name} × {item.qty}</span>
                <span className="font-bold text-white">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-cyan-300 font-semibold bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30 text-[11px]">
            <span>Direct Cause Impact (50%):</span>
            <span className="font-black">{formatCurrency(cartTotal(cart) * 0.5)}</span>
          </div>

          <div className="flex justify-between border-t border-slate-800 pt-4 text-base font-black text-white">
            <span>Total</span>
            <span className="text-cyan-400">{formatCurrency(cartTotal(cart))}</span>
          </div>

          <button
            type="submit"
            disabled={isFundraiser || submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {isFundraiser
              ? 'Orders Disabled for Fundraiser'
              : submitting
              ? 'Placing Order...'
              : 'Pay and Confirm Order'}
            <ArrowRight size={14} />
          </button>
        </aside>
      </form>
    </div>
  );
}
