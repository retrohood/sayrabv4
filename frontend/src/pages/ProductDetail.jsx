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
  Truck,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';
import { addCartItem } from '../utils/cart';
import { getAccurateProductImage, getAccurateProductImages } from '../utils/productImages';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/item/${id}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        const images = getAccurateProductImages(p);
        setSelectedImage(images[0] || '');
        setSelectedSize(p?.sizes?.[0] || 'M');
        setSelectedColor(p?.colors?.[0] || 'Default');

        // Fetch related products
        api
          .get('/products', { params: { category: p.category, limit: 4 } })
          .then((relRes) => {
            const others = (relRes.data?.products || []).filter((item) => item._id !== id);
            setRelatedProducts(others.slice(0, 4));
          })
          .catch(() => {});
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

  const galleryImages = getAccurateProductImages(product);

  const availableSizes = product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', '2XL'];
  const availableColors = product.colors?.length > 0 ? product.colors : ['Charcoal Black', 'Heather Gray', 'Forest Green'];

  const handleAddToCart = () => {
    if (isFundraiser) return;
    addCartItem(
      {
        ...product,
        image: selectedImage || getAccurateProductImage(product),
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
        image: selectedImage || getAccurateProductImage(product),
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      },
      quantity,
      user?._id
    );
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#172033]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link to="/" className="hover:text-[#10182b]">Home</Link>
        <ChevronRight size={13} />
        <Link to="/store" className="hover:text-[#10182b]">Merchandise Store</Link>
        <ChevronRight size={13} />
        <span className="text-[#367c35] font-bold">{product.category || 'Apparel'}</span>
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
          <div className="aspect-square w-full bg-[#f7f9f5] rounded-3xl overflow-hidden border border-[#e5e9e3] relative group">
            <img
              src={selectedImage || galleryImages[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 px-3 py-1 bg-[#10182b]/85 backdrop-blur-md text-[#89ca2e] text-xs font-black uppercase tracking-wider rounded-lg border border-white/10 shadow-sm">
              50% To Verified Cause
            </span>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-[#f7f9f5] shrink-0 transition-all cursor-pointer ${
                    selectedImage === img ? 'border-[#89ca2e] ring-2 ring-[#89ca2e]/30 shadow-sm' : 'border-[#e5e9e3] hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Badges Underneath Gallery */}
          <div className="grid grid-cols-3 gap-2.5 pt-3">
            <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-center space-y-1">
              <Layers size={18} className="mx-auto text-[#367c35]" />
              <p className="text-[11px] font-black text-[#10182b]">Ethically Made</p>
              <p className="text-[10px] text-[#64748b]">Fair wages & tech packs</p>
            </div>
            <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-center space-y-1">
              <Truck size={18} className="mx-auto text-[#367c35]" />
              <p className="text-[11px] font-black text-[#10182b]">Tracked Delivery</p>
              <p className="text-[10px] text-[#64748b]">Direct from manufacturer</p>
            </div>
            <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-center space-y-1">
              <ShieldCheck size={18} className="mx-auto text-[#367c35]" />
              <p className="text-[11px] font-black text-[#10182b]">Verified Split</p>
              <p className="text-[10px] text-[#64748b]">50% Org / 45% Mfg / 5% AGY</p>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-2.5 py-0.5 rounded-md">
                  {product.category || 'Apparel'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  SKU: {product._id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#10182b] tracking-tight">{product.name}</h1>
              <div className="pt-1 flex items-baseline gap-3">
                <p className="text-3xl font-black text-[#10182b]">{formatCurrency(product.price)}</p>
                <span className="text-xs font-bold text-[#367c35] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Generates {formatCurrency((product.price || 0) * 0.5)} for the cause
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              {product.description || 'Premium quality branded merchandise. Every order directly funds ongoing community initiatives.'}
            </p>

            {/* Merchandise Revenue Split Box */}
            <div className="bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black text-[#10182b]">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#367c35]" /> Transparent Social Funding Split:
                </span>
                <span className="text-[#367c35]">50% Cause Contribution</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-[#367c35] h-full" style={{ width: '50%' }} title="50% Fundraiser Organization" />
                <div className="bg-[#10182b] h-full" style={{ width: '45%' }} title="45% Ethical Manufacturer" />
                <div className="bg-[#89ca2e] h-full" style={{ width: '5%' }} title="5% Sayrab Platform" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] font-bold">
                <span className="text-[#367c35]">50% Cause ({formatCurrency((product.price || 0) * 0.5)})</span>
                <span className="text-[#10182b]">45% Maker ({formatCurrency((product.price || 0) * 0.45)})</span>
                <span className="text-[#89ca2e]">5% Platform</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                  Select Size
                </label>
                <span className="text-[11px] text-[#64748b] font-medium">Standard Fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
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

            {/* Color Selector */}
            <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                Select Color: <span className="text-[#367c35]">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedColor === c
                        ? 'bg-[#10182b] text-white shadow-xs'
                        : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2 border-t border-[#e5e9e3]">
              <label className="block text-xs font-black uppercase tracking-wider text-[#10182b]">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] font-black text-sm flex items-center justify-center hover:bg-[#89ca2e] cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-base text-[#10182b]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] font-black text-sm flex items-center justify-center hover:bg-[#89ca2e] cursor-pointer transition-colors"
                >
                  +
                </button>
                <span className="text-xs text-[#64748b]">
                  ({product.stock ? `${product.stock} in stock` : 'In stock & made-to-order'})
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#e5e9e3]">
            {added && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} /> Added {quantity} item(s) to your shopping cart!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isFundraiser}
                onClick={handleAddToCart}
                className="py-3.5 bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] text-[#10182b] font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>

              <button
                type="button"
                disabled={isFundraiser}
                onClick={handleBuyNow}
                className="py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-98"
              >
                Buy Now <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Care & Social Impact */}
      <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex border-b border-[#e5e9e3] gap-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'description'
                ? 'border-[#89ca2e] text-[#10182b]'
                : 'border-transparent text-[#64748b] hover:text-[#10182b]'
            }`}
          >
            Product Story & Specs
          </button>
          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'manufacturing'
                ? 'border-[#89ca2e] text-[#10182b]'
                : 'border-transparent text-[#64748b] hover:text-[#10182b]'
            }`}
          >
            Manufacturing & Ethical Sourcing
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-[#89ca2e] text-[#10182b]'
                : 'border-transparent text-[#64748b] hover:text-[#10182b]'
            }`}
          >
            Dispatch & Delivery
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#64748b] leading-relaxed max-w-4xl">
            <p>
              {product.description ||
                'This exclusive merchandise item is produced in partnership with verified manufacturing specialists to guarantee premium comfort, durability, and print fidelity.'}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] space-y-1">
                <span className="font-black text-[#10182b]">Material Specification</span>
                <p className="text-xs">Premium combed ringspun cotton / sustainable blends, pre-shrunk for dimensional stability.</p>
              </div>
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] space-y-1">
                <span className="font-black text-[#10182b]">Care Instructions</span>
                <p className="text-xs">Machine wash cold with like colors inside out. Tumble dry low or hang dry to preserve print vibrancy.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manufacturing' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#64748b] leading-relaxed max-w-4xl">
            <p>
              Every product in Sayrab is manufactured using certified tech-pack specifications submitted through our integrated Manufacturer Module. This guarantees that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>Apparel workers receive verified fair living wages and operate in safe environments.</li>
              <li>Water-based, eco-certified inks are used for graphic prints to reduce environmental impact.</li>
              <li>45% of every product price is paid directly to the maker to support domestic manufacturing excellence.</li>
            </ul>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#64748b] leading-relaxed max-w-4xl">
            <p>
              Sayrab partners with domestic logistics couriers to provide traceable direct-from-maker delivery across Pakistan:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                <p className="font-black text-sm text-[#10182b]">Production Window</p>
                <p className="text-xs text-[#64748b] mt-1">2-4 business days for custom sample / small-batch make.</p>
              </div>
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                <p className="font-black text-sm text-[#10182b]">Delivery Courier</p>
                <p className="text-xs text-[#64748b] mt-1">3-5 business days with SMS and tracking updates.</p>
              </div>
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                <p className="font-black text-sm text-[#10182b]">Return Policy</p>
                <p className="text-xs text-[#64748b] mt-1">Free exchange if any manufacturing defect is detected.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
            <h3 className="text-xl font-black text-[#10182b]">You May Also Support</h3>
            <Link to="/store" className="text-xs font-bold text-[#367c35] hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => {
              const relImg = getAccurateProductImage(rel);
              return (
                <Link
                  key={rel._id}
                  to={`/product/${rel._id}`}
                  className="group bg-white rounded-2xl border border-[#e5e9e3] hover:border-[#89ca2e] overflow-hidden p-3 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl bg-[#f7f9f5] overflow-hidden mb-2">
                    <img
                      src={relImg}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#10182b] truncate group-hover:text-[#367c35]">
                      {rel.name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#10182b] mt-1">{formatCurrency(rel.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
