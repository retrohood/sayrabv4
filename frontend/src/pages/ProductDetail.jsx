import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';
import { addCartItem } from '../utils/cart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/item/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3" />
        <p className="text-xs">Loading merchandise details...</p>
      </div>
    );
  }

  const image = product.image || product.images?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {isFundraiser && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Fundraiser Account Notice <span>•</span> Purchasing Restricted
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As a registered fundraiser, purchasing store merchandise is restricted for your account. Product sales fund active campaigns and are designated for buyers and donors.
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

      <div className="grid gap-8 lg:grid-cols-2 bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 aspect-square">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{product.name}</h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">{product.description}</p>
            
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-3xl font-black text-cyan-400">{formatCurrency(product.price)}</p>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-md border border-cyan-500/30">
                50% Revenue Allocated to Campaign
              </span>
            </div>

            {product.sizes?.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Available Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Available Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <span key={c} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3 sm:flex-row">
            {!isFundraiser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate(`/auth?mode=login&redirect=/product/${product._id}`);
                      return;
                    }
                    addCartItem(product, 1, user?._id);
                    setAdded(true);
                  }}
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {!user ? 'Sign in to Buy' : added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <Link
                  to={user ? "/cart" : `/auth?mode=login&redirect=/cart`}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  View Cart
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
              >
                Go to Fundraiser Portal <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
