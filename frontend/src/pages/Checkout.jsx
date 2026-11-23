import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, CheckCircle2, ShoppingBag, ShieldCheck, Truck, MapPin, Check, Plus } from 'lucide-react';
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
    const handleCartSync = () => {
      setCart(readCart(user?._id));
    };
    handleCartSync();
    window.addEventListener('sayrab:cart-updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('sayrab:cart-updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveForFuture, setSaveForFuture] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    line1: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '',
    country: 'Pakistan',
  });

  // Load saved delivery addresses and prefill default
  useEffect(() => {
    if (!user) return;
    const fetchSavedAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await api.get('/users/addresses');
        const list = res.data?.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
          setForm({
            fullName: def.recipientName || user?.fullName || '',
            phone: def.phone || user?.phone || '',
            line1: [def.street, def.apartment].filter(Boolean).join(', ') || '',
            city: def.city || 'Lahore',
            state: def.state || 'Punjab',
            postalCode: def.postalCode || '',
            country: def.country || 'Pakistan',
          });
        }
      } catch (err) {
        console.warn('Failed to load saved addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchSavedAddresses();
  }, [user]);

  const handleSelectAddress = (addr) => {
    if (!addr) {
      setSelectedAddressId('new');
      setForm({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        line1: user?.address || '',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '',
        country: 'Pakistan',
      });
      return;
    }
    setSelectedAddressId(addr._id);
    setForm({
      fullName: addr.recipientName || '',
      phone: addr.phone || '',
      line1: [addr.street, addr.apartment].filter(Boolean).join(', ') || '',
      city: addr.city || 'Lahore',
      state: addr.state || 'Punjab',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Pakistan',
    });
  };

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

      // If user opted to save this delivery address for future orders
      if (saveForFuture) {
        try {
          await api.post('/users/addresses', {
            recipientName: form.fullName,
            phone: form.phone,
            street: form.line1,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country || 'Pakistan',
            isDefault: savedAddresses.length === 0,
          });
        } catch (saveErr) {
          console.warn('Could not auto-save address from checkout:', saveErr);
        }
      }

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
            <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
              <div className="flex items-center gap-2 text-[#10182b]">
                <Truck size={18} className="text-[#367c35]" />
                <h2 className="text-base font-black">Shipping & Delivery Details</h2>
              </div>
              {savedAddresses.length > 0 && (
                <span className="text-[11px] text-[#64748b] font-medium">
                  {savedAddresses.length} saved address{savedAddresses.length > 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[#10182b]">
                  Choose from Saved Addresses
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-green-50/40 border-[#89ca2e] ring-1 ring-[#89ca2e] shadow-xs'
                            : 'bg-[#f7f9f5] border-[#e5e9e3] hover:border-[#89ca2e]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-xs font-black text-[#10182b] truncate">
                            {addr.recipientName}
                          </p>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#89ca2e]/20 text-[#367c35] rounded-full shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748b] truncate mt-1">
                          {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}
                        </p>
                        <p className="text-[11px] text-[#64748b]">
                          {addr.city}, {addr.state}
                        </p>
                        <p className="text-[10px] text-[#367c35] font-bold mt-1 flex items-center gap-1">
                          {isSelected ? <Check size={12} /> : null}
                          {isSelected ? 'Selected' : 'Use this address'}
                        </p>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => handleSelectAddress(null)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center border-dashed ${
                      selectedAddressId === 'new'
                        ? 'bg-green-50/40 border-[#89ca2e] ring-1 ring-[#89ca2e]'
                        : 'bg-[#f7f9f5] border-[#e5e9e3] hover:border-[#89ca2e]/50'
                    }`}
                  >
                    <Plus size={16} className="text-[#367c35] mb-1" />
                    <span className="text-xs font-bold text-[#10182b]">Use New Address</span>
                    <span className="text-[10px] text-[#64748b]">Fill custom address below</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#10182b]">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Sara Ahmed"
                  className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03001234567"
                  className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#10182b]">Street Address *</label>
              <input
                type="text"
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                placeholder="House / Apartment, Street, Area"
                className="w-full mt-1 px-3.5 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#10182b]">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10182b]">Province / State *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10182b]">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="54000"
                  className="w-full mt-1 px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
            </div>

            {/* Save Address Checkbox */}
            <div className="pt-2 border-t border-[#e5e9e3] flex items-center gap-2">
              <input
                type="checkbox"
                id="checkoutSaveAddress"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="h-4 w-4 rounded border-[#e5e9e3] text-[#89ca2e] focus:ring-[#89ca2e] cursor-pointer"
              />
              <label htmlFor="checkoutSaveAddress" className="text-xs text-[#10182b] font-medium cursor-pointer">
                Save this address to my account for future orders
              </label>
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
