import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Store as StoreIcon,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  Truck,
  ShieldCheck,
  Tag,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';
import { addCartItem, readCart } from '../utils/cart';
import { getAccurateProductImage } from '../utils/productImages';

export default function Store() {
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [cart, setCart] = useState(() => readCart(user?._id));
  const [loading, setLoading] = useState(true);
  const [showFundraiserNotice, setShowFundraiserNotice] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  // Merchandise Open Store Modal states
  const [myStore, setMyStore] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [storeForm, setStoreForm] = useState({
    fullName: '',
    storeName: '',
    merchType: 'Apparel',
    organization: '',
    description: '',
    email: '',
  });
  const [openStoreError, setOpenStoreError] = useState('');
  const [openStoreLoading, setOpenStoreLoading] = useState(false);

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

  useEffect(() => {
    api
      .get('/constants')
      .then((res) => {
        setCategories(
          res.data?.productCategories || [
            'Apparel',
            'Drinkware',
            'Stationery',
            'Accessories',
            'Promotional Merchandise',
          ]
        );
      })
      .catch(() => {
        setCategories(['Apparel', 'Drinkware', 'Stationery', 'Accessories', 'Promotional Merchandise']);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      search: search.trim() || undefined,
      category: category === 'All' ? undefined : category,
    };
    api
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data?.products || []);
      })
      .catch((err) => {
        console.error('Failed to fetch store products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    if (user) {
      api
        .get('/stores/my')
        .then((res) => setMyStore(res.data))
        .catch(() => {});

      setStoreForm((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortOption === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [products, sortOption]);

  const addToCart = (product) => {
    if (isFundraiser) {
      setShowFundraiserNotice(true);
      return;
    }
    const updated = addCartItem(product, 1, user?._id);
    setCart(updated);
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(''), 2500);
  };

  const handleOpenStoreClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (myStore) {
      navigate('/dashboard');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateStoreSubmit = async (e) => {
    e.preventDefault();
    setOpenStoreError('');
    setOpenStoreLoading(true);

    try {
      const res = await api.post('/stores', {
        name: storeForm.storeName,
        category: storeForm.merchType,
        description: storeForm.description,
        organizationName: storeForm.organization,
      });

      setMyStore(res.data);
      setShowCreateModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setOpenStoreError(err.response?.data?.message || 'Failed to create merchandise store.');
    } finally {
      setOpenStoreLoading(false);
    }
  };

  const cartItemCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);

  return (
    <div className="space-y-12 pb-20 text-[#172033]">
      {/* Toast notification when item added */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10182b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckCircle2 size={18} className="text-[#89ca2e]" />
          <span>Added &ldquo;{addedItemName}&rdquo; to your cart!</span>
          <Link to="/cart" className="ml-2 underline text-[#89ca2e] hover:text-[#b4df76]">
            View Cart
          </Link>
        </div>
      )}

      {/* Fundraiser Restriction Notice */}
      {showFundraiserNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-lg font-black text-center text-[#10182b]">Fundraiser Account Policy</h3>
            <p className="text-xs sm:text-sm text-[#64748b] text-center leading-relaxed">
              Fundraiser accounts cannot purchase merchandise on Sayrab. Product sales are allocated to fund charitable campaigns. Please switch to or use a donor/buyer account.
            </p>
            <button
              onClick={() => setShowFundraiserNotice(false)}
              className="w-full py-2.5 bg-[#10182b] text-white rounded-xl text-xs font-bold hover:bg-[#172033] cursor-pointer"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}

      {/* Hero Section: Fashion-Commerce Aesthetic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10182b] via-[#172033] to-[#10182b] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#10182b]">
        {/* Subtle decorative grid/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#89ca2e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#89ca2e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
              <Sparkles size={14} /> Official Apparel & Purpose Goods
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight break-words">
              Merchandise with <span className="text-[#89ca2e]">Purpose.</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Discover ethically produced custom apparel, insulated drinkware, and sustainable accessories designed by verified campaign creators and manufactured through certified production tech packs.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
              <a
                href="#catalog"
                className="px-6 py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Explore Collection
              </a>
              <button
                onClick={handleOpenStoreClick}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <StoreIcon size={16} /> {myStore ? 'Manage My Store' : 'Open Creator Store'}
              </button>
            </div>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative mx-auto max-w-sm rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur-md shadow-2xl">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
                  alt="Premium Apparel Showcase"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#10182b]/85 backdrop-blur-md text-[#89ca2e] text-[11px] font-black uppercase tracking-wider rounded-lg border border-white/10">
                  50% Revenue Share
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                  Certified Tech Pack
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-white text-sm">Heavyweight Organic Hoodie</p>
                  <p className="text-slate-400 text-[11px]">Supporting Clean Water Initiatives</p>
                </div>
                <div className="text-right">
                  <span className="text-[#89ca2e] font-black text-sm">PKR 4,200</span>
                  <p className="text-[10px] text-slate-400">Pre-shrunk cotton</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Pillar Impact & Value Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e9e3] shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">50% Direct Cause Share</h4>
              <p className="text-[11px] text-[#64748b]">Half of all proceeds fund campaigns</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e9e3] shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Ethical Manufacturing</h4>
              <p className="text-[11px] text-[#64748b]">45% directly supports makers & tech packs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e9e3] shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Tracked Direct Delivery</h4>
              <p className="text-[11px] text-[#64748b]">Real-time production and courier tracking</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5e9e3] shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#10182b]">Verified Governance</h4>
              <p className="text-[11px] text-[#64748b]">5% platform audit & donor security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Area */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        {/* Search, Sort, and Category Controls */}
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purpose merchandise (e.g. hoodie, tee, mug)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs sm:text-sm text-[#10182b] focus:outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] focus:outline-none focus:ring-2 focus:ring-[#89ca2e] cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
              </div>

              {/* View Cart Button */}
              <Link
                to="/cart"
                className="px-4 py-2.5 bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
              >
                <ShoppingBag size={15} />
                <span>Cart ({cartItemCount})</span>
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-3 border-t border-[#e5e9e3] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase text-[#64748b] tracking-wider mr-1 flex items-center gap-1">
              <Filter size={12} /> Category:
            </span>
            <button
              onClick={() => setCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === 'All'
                  ? 'bg-[#89ca2e] text-[#10182b] shadow-xs'
                  : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
              }`}
            >
              All Merchandise
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#89ca2e] text-[#10182b] shadow-xs'
                    : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                }`}
              >
                {cat}
              </button>
            ))}

            {(category !== 'All' || search) && (
              <button
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                }}
                className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#10182b]">
                {category === 'All' ? 'Curated Merchandise Collection' : `${category} Collection`}
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Every purchase automatically delivers 50% funding directly to verified social campaigns.
              </p>
            </div>
            <span className="text-xs font-bold text-[#64748b] bg-white px-3 py-1 rounded-lg border border-[#e5e9e3]">
              {sortedProducts.length} Items Found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-84 animate-pulse border border-[#e5e9e3]" />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#e5e9e3] shadow-xs space-y-3">
              <ShoppingBag size={48} className="text-[#64748b] mx-auto opacity-50" />
              <h3 className="text-base font-black text-[#10182b]">No merchandise matches your filter</h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                Try searching with different keywords or switch to &ldquo;All Merchandise&rdquo; to view all available products.
              </p>
              <button
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                }}
                className="mt-2 px-4 py-2 bg-[#89ca2e] text-[#10182b] font-bold rounded-xl text-xs cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {sortedProducts.map((product) => {
                const img = getAccurateProductImage(product);
                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Upper: Product Image Container */}
                    <Link
                      to={`/product/${product._id}`}
                      className="block relative aspect-square bg-[#f7f9f5] overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#10182b]/85 backdrop-blur-md text-[#89ca2e] text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/10 shadow-sm">
                        {product.category || 'Apparel'}
                      </span>
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-white/95 backdrop-blur-xs text-[#367c35] text-[10px] font-extrabold rounded-md shadow-xs">
                        50% Cause Fund
                      </span>
                    </Link>

                    {/* Lower: Details & Actions */}
                    <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${product._id}`} className="block group-hover:text-[#367c35] transition-colors">
                          <h3 className="font-extrabold text-[#10182b] text-sm line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="text-xs text-[#64748b] line-clamp-2 mt-1">
                          {product.description || 'Ethically produced merchandise supporting active verified initiatives.'}
                        </p>
                        <div className="mt-3 flex items-baseline justify-between">
                          <span className="text-lg font-black text-[#10182b]">{formatCurrency(product.price)}</span>
                          <span className="text-[11px] font-bold text-[#367c35] bg-emerald-50 px-2 py-0.5 rounded-md">
                            Tech-Pack Quality
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-[#e5e9e3] grid grid-cols-2 gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="py-2.5 text-center bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className="py-2.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section: Revenue Allocation Transparency Strip */}
        <section className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
              Transparent Social Commerce
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Merchandise Revenue Allocation</h2>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              When you purchase merchandise on Sayrab, proceeds are transparently allocated according to our strict platform split guidelines:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#367c35]">50%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Fundraiser Organization</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Directly funds the active campaign goals and community initiatives of the verified creator.
              </p>
            </div>

            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#10182b]">45%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Ethical Manufacturer</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Covers certified raw materials, fair labor wages, production tech-packs, and direct dispatch packaging.
              </p>
            </div>

            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#89ca2e]">5%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Sayrab Platform</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Covers server infrastructure, verification audits, buyer security, and continuous platform development.
              </p>
            </div>
          </div>

          <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] text-center">
            <p className="text-xs text-[#64748b] italic">
              <strong>Notice:</strong> This revenue-sharing model applies exclusively to eligible merchandise sales in the Store. Ordinary campaign donations remain 100% designated for verified campaigns.
            </p>
          </div>
        </section>

        {/* Open Store Call to Action */}
        <section className="bg-gradient-to-r from-[#10182b] via-[#172033] to-[#10182b] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-bold uppercase tracking-wider">
              <StoreIcon size={14} /> For Fundraisers & Organizations
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Want to Open Your Own Branded Merchandise Store?</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch customized merchandise to support your campaigns. Our integrated manufacturers handle sampling, production, and order fulfillment.
            </p>
          </div>

          <button
            onClick={handleOpenStoreClick}
            className="px-6 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-sm rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            {myStore ? 'Manage My Store' : 'Open Merchandise Store'} <ArrowRight size={16} />
          </button>
        </section>
      </div>

      {/* Auth Modal for Open Store */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl flex items-center justify-center mx-auto">
              <StoreIcon size={24} />
            </div>
            <h3 className="text-lg font-black text-[#10182b]">Sign In Required</h3>
            <p className="text-xs text-[#64748b]">
              Please log in or register as a Fundraiser to create and manage your branded merchandise store.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/auth?type=fundraiser&redirect=/store"
                className="w-full py-2.5 bg-[#89ca2e] text-[#10182b] font-bold rounded-xl text-xs"
              >
                Sign In / Register as Fundraiser
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs text-[#64748b] hover:text-[#10182b] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#e5e9e3] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
              <h3 className="text-base font-black text-[#10182b]">Open Merchandise Store</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748b] hover:text-[#10182b] cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {openStoreError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {openStoreError}
              </div>
            )}

            <form onSubmit={handleCreateStoreSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#10182b]">Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Care Foundation Official Merch"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Merchandise Category</label>
                <select
                  value={storeForm.merchType}
                  onChange={(e) => setStoreForm({ ...storeForm, merchType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] mt-1"
                >
                  <option value="Apparel">Apparel (Hoodies, T-Shirts, Polos)</option>
                  <option value="Drinkware">Drinkware (Mugs, Bottles)</option>
                  <option value="Stationery">Stationery (Diaries, Notebooks)</option>
                  <option value="Accessories">Accessories (Bags, Caps)</option>
                  <option value="Promotional Merchandise">Promotional Merchandise</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Associated Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="Organization or initiative name"
                  value={storeForm.organization}
                  onChange={(e) => setStoreForm({ ...storeForm, organization: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Store Description</label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe the purpose of this merchandise..."
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={openStoreLoading}
                className="w-full py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {openStoreLoading ? 'Creating Store...' : 'Launch Store'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-[#89ca2e]/25 text-[#367c35] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-[#10182b]">Store Created Successfully!</h3>
            <p className="text-xs text-[#64748b]">
              Your merchandise store has been launched. You can now manage products and mockups from your dashboard.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard');
              }}
              className="w-full py-2.5 bg-[#10182b] text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
