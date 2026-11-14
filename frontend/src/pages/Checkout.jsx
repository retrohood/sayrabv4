import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, CheckCircle2, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { cartTotal, readCart, writeCart } from '../utils/cart';
import { formatCurrency, isFundraiserUser } from '../utils/format';

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

  const total = cartTotal(cart);

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

    if (cart.length === 0) {
      setOrderError('Your shopping cart is empty.');
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
        console.warn('Payment session creation notice:', sessErr);
      }

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
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in text-[#172033]">
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-10 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl mx-auto flex items-center justify-center">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-[#10182b]">Sign In Required</h2>
          <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
            Please log in or register as a <strong>Buyer / Donor</strong> to complete checkout and track your merchandise deliveries.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=login&redirect=/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#89ca2e] text-[#10182b] font-black rounded-xl text-xs shadow-sm hover:shadow-md transition-all"
            >
              Sign In / Register <ArrowRight size={15} />
            </Link>
            <Link
              to="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-[#e5e9e3] bg-[#f7f9f5] text-[#172033] hover:bg-slate-100 font-bold rounded-xl text-xs transition-all"
            >
              Browse Merchandise
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#172033]">
      <div className="border-b border-[#e5e9e3] pb-4">
        <h1 className="text-3xl font-black text-[#10182b] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#64748b] mt-1">Provide delivery address and complete your purchase securely.</p>
      </div>

      {orderError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold flex items-center gap-2">
          <ShieldAlert size={16} /> {orderError}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e5e9e3] shadow-xs space-y-3">
          <p className="font-bold text-sm text-[#10182b]">Your cart is empty.</p>
          <Link to="/store" className="inline-block text-xs font-bold text-[#367c35] hover:underline">
            Go to Store
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Delivery Address */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 text-[#10182b] border-b border-[#e5e9e3] pb-3">
              <Truck size={18} className="text-[#367c35]" />
              <h2 className="text-base font-black">Shipping & Delivery Details</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10182b]">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Sara Ahmed"
                  className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03001234567"
                  className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#10182b]">Street Address</label>
              <input
                type="text"
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                placeholder="House / Apartment, Street, Area"
                className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#10182b]">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10182b]">Province / State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10182b]">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="54000"
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-base font-black text-[#10182b] border-b border-[#e5e9e3] pb-3">Order Items ({cart.length})</h2>

            <div className="divide-y divide-[#e5e9e3] max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-extrabold text-[#10182b] truncate">{item.name}</p>
                    <p className="text-[#64748b] text-[11px]">
                      Qty: {item.qty || 1} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                    </p>
                  </div>
                  <span className="font-black text-[#10182b] shrink-0">
                    {formatCurrency((item.price || 0) * (item.qty || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#e5e9e3] space-y-2 text-xs">
              <div className="flex justify-between text-[#64748b]">
                <span>Delivery:</span>
                <span className="font-bold text-[#367c35]">Standard Free</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>50% Campaign Allocation:</span>
                <span className="font-bold text-[#367c35]">{formatCurrency(total * 0.5)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#e5e9e3] text-sm">
                <span className="font-black text-[#10182b]">Total Amount:</span>
                <span className="text-xl font-black text-[#10182b]">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10182b]" />
              ) : (
                <>Place Order of {formatCurrency(total)}</>
              )}
            </button>

            <div className="text-[11px] text-[#64748b] text-center space-y-1">
              <p className="flex items-center justify-center gap-1 font-semibold text-[#367c35]">
                <ShieldCheck size={14} /> Encrypted & Verified Order Processing
              </p>
              <p>50% to Organization • 45% to Manufacturer • 5% to Sayrab</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
