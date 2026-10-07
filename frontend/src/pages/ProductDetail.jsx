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
    return <div className="py-20 text-center text-slate-500">Loading product...</div>;
  }

  const image = product.image || product.images?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {isFundraiser && (
        <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 border border-zinc-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide">
                Fundraiser Account Notice <span>•</span> Purchasing Restricted
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                As a registered fundraiser, purchasing store merchandise is restricted for your account. Product sales fund active campaigns and are designated for buyers and donors.
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

      <div className="grid gap-8 lg:grid-cols-2">
        <img src={image} alt={product.name} className="w-full rounded-lg border border-slate-200 object-cover aspect-square" />
        <div>
          <p className="text-sm font-semibold text-primary-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>
          <p className="mt-6 text-3xl font-bold text-primary-700">{formatCurrency(product.price)}</p>

          {product.sizes?.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">Sizes: {product.sizes.join(', ')}</p>
          )}
          {product.colors?.length > 0 && (
            <p className="mt-2 text-sm text-slate-500">Colors: {product.colors.join(', ')}</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {!user ? 'Sign in to Buy' : added ? 'Added to Cart' : 'Add to Cart'}
                </button>
                <Link
                  to={user ? "/cart" : `/auth?mode=login&redirect=/cart`}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Cart
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Go to Fundraiser Portal <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
