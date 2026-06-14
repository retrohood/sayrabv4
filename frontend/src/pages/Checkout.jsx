import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { cartTotal, readCart, writeCart } from '../utils/cart';
import { formatCurrency } from '../utils/format';

const OPTIONAL_FIELDS = ['state', 'postalCode'];

export default function Checkout() {
  const navigate = useNavigate();
  const [cart] = useState(() => readCart());
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
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
    setSubmitting(true);

    try {
      const orderRes = await api.post('/orders', {
        campaignId,
        products: cart.map((item) => ({
          productId: item._id,
          quantity: item.qty,
        })),
        shippingAddress: form,
        paymentStatus: 'paid',
      });

      await api.post('/payment/create-session', {
        orderId: orderRes.data._id,
        campaignId,
        items: cart,
      });

      writeCart([]);
      navigate(`/order/${orderRes.data._id}`);
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
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
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Placing Order...' : 'Pay and Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
