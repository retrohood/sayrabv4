import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
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
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900">Sign In Required</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            You must be logged in or registered as a <strong>Buyer</strong> on Sayrab to view your shopping cart, manage items, and complete purchases.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=login&redirect=/cart"
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

  if (isFundraiser) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900">Cart Not Available</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            You are logged in as a <strong>Fundraiser</strong>. Fundraiser accounts cannot purchase store merchandise or use the shopping cart system.
          </p>
          <p className="text-xs text-zinc-500">
            You can launch and manage merchandise items linked to your campaigns directly in your portal.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Go to Fundraiser Portal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Cart</h1>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link to="/store" className="mt-4 inline-flex rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-md object-cover bg-slate-100" />
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-900">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.price)}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item._id, -1)} className="rounded-md border border-slate-300 p-1">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item._id, 1)} className="rounded-md border border-slate-300 p-1">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeItem(item._id)} className="ml-2 rounded-md p-1 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">{formatCurrency(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Order Summary</h2>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal(cart))}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-5 block rounded-lg bg-primary-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-primary-700"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
