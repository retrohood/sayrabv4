import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Package,
  Layers,
  Heart,
} from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/item/${id}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setSelectedImage(p?.image || p?.images?.[0] || '');
        setSelectedSize(p?.sizes?.[0] || '');
        setSelectedColor(p?.colors?.[0] || '');
      })
      .catch((err) => {
        console.error('Failed to load product:', err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#89ca2e] mx-auto mb-3" />
        <p className="text-xs text-[#64748b]">Loading merchandise details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-[#10182b]">Product Not Found</h2>
        <p className="text-xs text-[#64748b]">This product does not exist or may have been removed.</p>
        <Link
          to="/store"
          className="inline-block px-5 py-2.5 bg-[#89ca2e] text-[#10182b] font-bold rounded-xl text-xs"
        >
          Return to Merchandise Store
        </Link>
      </div>
    );
  }

  const allImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);
  const uniqueImages = Array.from(new Set(allImages));

  const handleAddToCart = () => {
    if (isFundraiser) return;
    addCartItem(
      {
        ...product,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      },
      quantity,
      user?._id
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (isFundraiser) return;
    addCartItem(
      {
        ...product,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      },
      quantity,
      user?._id
    );
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#172033]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link to="/" className="hover:text-[#10182b]">Home</Link>
        <ChevronRight size={13} />
        <Link to="/store" className="hover:text-[#10182b]">Merchandise Store</Link>
        <ChevronRight size={13} />
        <span className="font-bold text-[#10182b] truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Fundraiser Restriction Banner */}
      {isFundraiser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-black uppercase text-amber-900 tracking-wide">
                Fundraiser Account • Purchasing Restricted
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Fundraiser accounts cannot purchase merchandise products. Product proceeds fund active community campaigns and are reserved for buyers and donors.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-[#10182b] text-white text-xs font-bold rounded-xl shrink-0"
          >
            My Portal
          </Link>
        </div>
      )}

      {/* Product View Grid */}
      <div className="grid lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-[#e5e9e3] shadow-sm">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="aspect-square w-full bg-[#f7f9f5] rounded-3xl overflow-hidden border border-[#e5e9e3] p-6 flex items-center justify-center">
            <img
              src={selectedImage || '/placeholder-merch.jpg'}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnails */}
          {uniqueImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {uniqueImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-[#f7f9f5] shrink-0 overflow-hidden transition-all cursor-pointer ${
                    selectedImage === img ? 'border-[#89ca2e] shadow-sm' : 'border-[#e5e9e3]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-2.5 py-0.5 rounded-md">
                {product.category || 'Apparel'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">{product.name}</h1>
              <p className="text-2xl font-black text-[#10182b] pt-1">{formatCurrency(product.price)}</p>
            </div>

            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              {product.description || 'Premium quality branded merchandise. Every order directly funds ongoing community initiatives.'}
            </p>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
                <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#89ca2e] text-[#10182b] border-2 border-[#7bb926] shadow-xs'
                          : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
                <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'bg-[#89ca2e] text-[#10182b] border-2 border-[#7bb926] shadow-xs'
                          : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] font-black text-sm flex items-center justify-center hover:bg-[#89ca2e] cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-sm text-[#10182b]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-9 h-9 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] font-black text-sm flex items-center justify-center hover:bg-[#89ca2e] cursor-pointer"
                >
                  +
                </button>
                {product.stock && (
                  <span className="text-xs text-[#64748b]">({product.stock} available in stock)</span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#e5e9e3]">
            {added && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Added {quantity} item(s) to your shopping cart!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isFundraiser}
                onClick={handleAddToCart}
                className="py-3.5 bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] text-[#10182b] font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>

              <button
                type="button"
                disabled={isFundraiser}
                onClick={handleBuyNow}
                className="py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                Buy Now <ArrowRight size={16} />
              </button>
            </div>

            {/* Revenue Split Notice */}
            <div className="p-3.5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] text-[11px] text-[#64748b] leading-relaxed flex items-start gap-2">
              <ShieldCheck size={16} className="text-[#367c35] shrink-0 mt-0.5" />
              <span>
                <strong>Merchandise Split Allocation:</strong> 50% of proceeds go directly to support verified campaigns, 45% to our ethical manufacturing partners, and 5% to Sayrab operations.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
