import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShieldAlert, ArrowRight, Lock, ShoppingBag } from 'lucide-react';
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
        .map((item) => (item._id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    updateCart(cart.filter((item) => item._id !== id));
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in">
        <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In Required</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You must be logged in or registered as a <strong>Buyer</strong> on Sayrab to view your shopping cart, manage items, and complete purchases.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=login&redirect=/cart"
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

  if (isFundraiser) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-red-950/60 text-red-400 border border-red-800 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Cart Not Available</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You are logged in as a <strong>Fundraiser</strong>. Fundraiser accounts cannot purchase store merchandise or use the shopping cart system.
          </p>
          <p className="text-xs text-slate-400">
            You can launch and manage merchandise items linked to your campaigns directly in your portal.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              Go to Fundraiser Portal <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Shopping Cart</h1>
        <p className="text-slate-400 text-xs mt-1">Review items in your dedicated buyer shopping cart.</p>
      </div>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-12 text-center shadow-xl space-y-4">
          <ShoppingBag size={54} className="text-cyan-500/40 mx-auto" />
          <div>
            <h3 className="text-lg font-black text-white">Your Cart is Empty</h3>
            <p className="text-slate-400 text-xs mt-1">You don't have any items in your cart.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl justify-between items-start sm:items-center"
              >
                <div className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0" />
                  <div>
                    <h2 className="font-bold text-white text-sm">{item.name}</h2>
                    <p className="mt-0.5 text-xs text-cyan-400 font-semibold">{formatCurrency(item.price)} each</p>
                    {item.selectedSize && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Size: {item.selectedSize}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQty(item._id, -1)}
                      className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item._id, 1)}
                      className="p-1.5 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="font-black text-white text-sm">{formatCurrency(item.price * item.qty)}</p>

                  <button
                    type="button"
                    onClick={() => removeItem(item._id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-6 shadow-xl space-y-4">
            <h2 className="font-black text-white text-sm uppercase tracking-wider text-cyan-400">
              Order Summary
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">{formatCurrency(cartTotal(cart))}</span>
              </div>
              <div className="flex justify-between text-cyan-300 font-semibold bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30 text-[11px]">
                <span>Direct Cause Impact (50%):</span>
                <span className="font-black">{formatCurrency(cartTotal(cart) * 0.5)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping:</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-black text-white">
              <span>Total Payable</span>
              <span className="text-cyan-400">{formatCurrency(cartTotal(cart))}</span>
            </div>

            <Link
              to="/checkout"
              className="mt-5 block rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-5 py-3 text-center text-xs font-extrabold text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              Proceed to Checkout →
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
