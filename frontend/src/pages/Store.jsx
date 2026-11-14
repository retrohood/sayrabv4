import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Store as StoreIcon,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';
import { addCartItem, cartTotal as getCartTotal, readCart } from '../utils/cart';

export default function Store() {
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState(() => readCart(user?._id));
  const [loading, setLoading] = useState(true);
  const [showFundraiserNotice, setShowFundraiserNotice] = useState(false);

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
    setCart(readCart(user?._id));
  }, [user]);

  useEffect(() => {
    api
      .get('/constants')
      .then((res) => {
        setCategories(res.data?.productCategories || ['Apparel', 'Drinkware', 'Stationery', 'Accessories', 'Promotional Merchandise']);
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

  const addToCart = (product) => {
    if (isFundraiser) {
      setShowFundraiserNotice(true);
      return;
    }
    const updated = addCartItem(product, 1, user?._id);
    setCart(updated);
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

  return (
    <div className="space-y-12 pb-20 text-[#172033]">
      {/* Fundraiser Restriction Notice */}
      {showFundraiserNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-lg font-black text-center text-[#10182b]">Fundraiser Account Policy</h3>
            <p className="text-xs sm:text-sm text-[#64748b] text-center leading-relaxed">
              Fundraiser accounts cannot purchase merchandise on Sayrab. Product sales are allocated to fund charitable campaigns. Please switch to or use a donor account.
            </p>
            <button
              onClick={() => setShowFundraiserNotice(false)}
              className="w-full py-2.5 bg-[#10182b] text-white rounded-xl text-xs font-bold hover:bg-[#172033]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#89ca2e]/20 via-[#f7f9f5] to-[#f7f9f5] border-b border-[#e5e9e3] py-14 px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
            <ShoppingBag size={14} /> Purpose-Driven Merchandise
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#10182b] tracking-tight">
            Shop with a Purpose<span className="text-[#367c35]">.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            Every purchase helps support our mission and contributes towards meaningful community initiatives.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#10182b]">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-[#e5e9e3] shadow-xs">
              <Sparkles size={14} className="text-[#367c35]" /> High-Quality Apparel & Accessories
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-[#e5e9e3] shadow-xs">
              <CheckCircle2 size={14} className="text-[#367c35]" /> Direct 50% Organization Revenue Share
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#e5e9e3] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs sm:text-sm text-[#10182b] focus:outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            {/* View Cart Shortcut */}
            <Link
              to="/cart"
              className="px-4 py-2.5 bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
            >
              <ShoppingBag size={15} />
              <span>Cart ({cart.reduce((sum, i) => sum + (i.qty || 1), 0)})</span>
            </Link>
          </div>

          {/* Categories */}
          <div className="pt-2 border-t border-[#e5e9e3] flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* Product Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
            <h2 className="text-xl font-black text-[#10182b]">
              {category === 'All' ? 'Available Merchandise' : `${category} Products`}
            </h2>
            <span className="text-xs text-[#64748b]">{products.length} Products Found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#e5e9e3]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#e5e9e3] shadow-xs">
              <ShoppingBag size={44} className="text-[#64748b] mx-auto mb-3 opacity-60" />
              <p className="text-[#10182b] font-bold text-sm">No products found in this category.</p>
              <p className="text-[#64748b] text-xs mt-1">Try resetting your search or exploring another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => {
                const img = product.image || product.images?.[0] || '/placeholder-merch.jpg';
                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Upper: Image with Category Tag */}
                    <Link to={`/product/${product._id}`} className="block relative aspect-square bg-[#f7f9f5] overflow-hidden p-4">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[#367c35] text-[10px] font-black uppercase tracking-wider rounded-md border border-[#e5e9e3]">
                        {product.category}
                      </span>
                    </Link>

                    {/* Lower: Details & Actions */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${product._id}`} className="block group-hover:text-[#367c35] transition-colors">
                          <h3 className="font-extrabold text-[#10182b] text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="text-[11px] text-[#64748b] line-clamp-1 mt-0.5">
                          {product.description || 'Branded charity merchandise supporting verified campaigns.'}
                        </p>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-base font-black text-[#10182b]">{formatCurrency(product.price)}</span>
                          {product.stock && (
                            <span className="text-[10px] text-[#64748b] font-semibold">{product.stock} in stock</span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-[#e5e9e3] grid grid-cols-2 gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="py-2 text-center bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className="py-2 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 9: Revenue Allocation Transparency */}
        <section className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/20 px-3 py-1 rounded-full">
              Transparent Social Commerce
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">Merchandise Revenue Allocation</h2>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              When you purchase merchandise on Sayrab, proceeds are transparently shared according to verified split guidelines.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#367c35]">50%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Fundraiser Organization</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Directly funds the active campaign goals and social initiatives of the beneficiary organization.
              </p>
            </div>

            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#10182b]">45%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Ethical Manufacturer</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Covers high-quality raw materials, ethical labor wages, production, and quality-controlled packaging.
              </p>
            </div>

            <div className="bg-[#f7f9f5] rounded-2xl p-6 border border-[#e5e9e3] text-center space-y-2 hover:border-[#89ca2e] transition-all">
              <p className="text-4xl font-black text-[#89ca2e]">5%</p>
              <h3 className="font-extrabold text-sm text-[#10182b]">Sayrab Platform</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Covers server infrastructure, verification compliance, customer support, and continuous platform development.
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
                className="w-full py-2 text-xs text-[#64748b] hover:text-[#10182b]"
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
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748b] hover:text-[#10182b]">
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
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Merchandise Category</label>
                <select
                  value={storeForm.merchType}
                  onChange={(e) => setStoreForm({ ...storeForm, merchType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
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
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#10182b]">Store Description</label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe the purpose of this merchandise..."
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b]"
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
              className="w-full py-2.5 bg-[#10182b] text-white font-bold rounded-xl text-xs"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
