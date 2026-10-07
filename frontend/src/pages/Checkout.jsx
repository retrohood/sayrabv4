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

  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });

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
      });

      await api.post('/payment/create-session', {
        orderId: orderRes.data._id,
        campaignId,
        items: cart,
      });

      writeCart([], user?._id);
      navigate(`/order/${orderRes.data._id}`);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900">Sign In to Checkout</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            You must be logged in or registered as a <strong>Buyer</strong> to checkout items and place merchandise orders.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=login&redirect=/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#89ca2e] hover:bg-[#78b326] text-black font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              Sign In / Register <ArrowRight size={16} />
            </Link>
            <Link
              to="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-sm transition-all"
            >
              Browse Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return <div className="py-20 text-center text-slate-500">Your cart is empty.</div>;
  }

  const fieldConfig = [
    ['fullName', 'Full name'],
    ['phone', 'Phone'],
    ['line1', 'Address'],
    ['city', 'City'],
    ['state', 'State (optional)'],
    ['postalCode', 'Postal code (optional)'],
    ['country', 'Country'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {isFundraiser && (
        <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 border border-zinc-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Fundraiser Account Notice <span>•</span> Orders Restricted
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Fundraiser accounts cannot place merchandise orders. Store purchases are designated for buyers and donors. Please log in with a customer/donor account to complete your purchase.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
          >
            My Fundraiser Portal <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      </div>

      {orderError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
          {orderError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Shipping Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {fieldConfig.map(([key, label]) => (
              <label key={key} className={key === 'line1' ? 'sm:col-span-2' : ''}>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  required={!OPTIONAL_FIELDS.includes(key)}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Campaign supported by this order</span>
            <select
              required
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
            >
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title}
                </option>
              ))}
              <option value="any">Any...</option>
            </select>
          </label>
        </section>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Payment</h2>
          <p className="mt-2 text-sm text-slate-500">Mock payment will mark this order paid for local testing.</p>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item.name} x {item.qty}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(cartTotal(cart))}</span>
          </div>
          <button
            type="submit"
            disabled={isFundraiser || submitting}
            className="mt-5 w-full rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
          >
            {isFundraiser ? 'Orders Disabled for Fundraiser' : submitting ? 'Placing Order...' : 'Pay and Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
