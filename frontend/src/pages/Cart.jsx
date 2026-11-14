import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShieldAlert, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cartTotal, readCart, writeCart } from '../utils/cart';
import { formatCurrency, isFundraiserUser } from '../utils/format';

export default function Cart() {
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const [cart, setCart] = useState(() => readCart(user?._id));

  useEffect(() => {
    setCart(readCart(user?._id));
  }, [user]);

  const updateCart = (next) => {
    setCart(next);
    writeCart(next, user?._id);
  };

  const updateQty = (id, delta) => {
    updateCart(
      cart
        .map((item) => (item._id === id ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    updateCart(cart.filter((item) => item._id !== id));
  };

  const total = cartTotal(cart);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#172033]">
      {/* Title Bar */}
      <div className="border-b border-[#e5e9e3] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#10182b] tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-[#64748b] mt-1">Review your selected merchandise items and support active causes.</p>
        </div>
        <Link to="/store" className="text-xs font-bold text-[#367c35] hover:underline flex items-center gap-1">
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>

      {/* Fundraiser Restriction Notice */}
      {isFundraiser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <h3 className="font-black uppercase text-amber-900">Purchasing Restricted for Fundraiser Accounts</h3>
            <p>
              Your account is registered as a Fundraiser. In accordance with platform policy, merchandise checkout is reserved for donors and supporters.
            </p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e5e9e3] shadow-xs space-y-4">
          <div className="w-16 h-16 bg-[#f7f9f5] border border-[#e5e9e3] rounded-2xl mx-auto flex items-center justify-center text-[#64748b]">
            <ShoppingBag size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#10182b]">Your Cart is Empty</h2>
            <p className="text-xs text-[#64748b]">Explore our merchandise store to discover purposeful products.</p>
          </div>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#89ca2e] text-[#10182b] font-black text-xs rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            Browse Merchandise Store <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Table/List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="divide-y divide-[#e5e9e3]">
              {cart.map((item) => {
                const subtotal = (item.price || 0) * (item.qty || 1);
                return (
                  <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={item.image || item.images?.[0] || '/placeholder-merch.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-contain bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-[#10182b] line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-[#367c35] font-black mt-0.5">{formatCurrency(item.price)} each</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-[#64748b] mt-1">
                          {item.selectedSize && (
                            <span className="bg-[#f7f9f5] px-2 py-0.5 rounded border border-[#e5e9e3]">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="bg-[#f7f9f5] px-2 py-0.5 rounded border border-[#e5e9e3]">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto self-end sm:self-auto">
                      <div className="flex items-center gap-2 bg-[#f7f9f5] p-1 rounded-xl border border-[#e5e9e3]">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center text-xs font-black shadow-2xs cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#10182b]">{item.qty || 1}</span>
                        <button
                          onClick={() => updateQty(item._id, 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center text-xs font-black shadow-2xs cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-black text-[#10182b]">{formatCurrency(subtotal)}</p>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-2 text-[#64748b] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-7 space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-[#10182b] border-b border-[#e5e9e3] pb-3">Order Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#64748b]">
                <span>Items Subtotal:</span>
                <span className="font-bold text-[#10182b]">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Estimated Delivery:</span>
                <span className="font-bold text-[#367c35]">Free / Included</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Cause Contribution (50%):</span>
                <span className="font-bold text-[#367c35]">{formatCurrency(total * 0.5)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e9e3] flex items-baseline justify-between">
              <span className="font-black text-[#10182b] text-base">Grand Total:</span>
              <span className="text-2xl font-black text-[#10182b]">{formatCurrency(total)}</span>
            </div>

            <Link
              to="/checkout"
              className={`w-full py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isFundraiser ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className="p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3] text-[11px] text-[#64748b] space-y-1">
              <p className="font-bold text-[#10182b] flex items-center gap-1">
                <CheckCircle2 size={14} className="text-[#367c35]" /> Transparent Split Guaranteed
              </p>
              <p>50% to Organization • 45% to Manufacturer • 5% to Sayrab Platform</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
