import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Store as StoreIcon, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isFundraiserUser } from '../utils/format';
import { addCartItem, cartTotal as getCartTotal, readCart } from '../utils/cart';

export default function Store() {
  const { user, setUser } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState(() => readCart(user?._id));
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFundraiserNotice, setShowFundraiserNotice] = useState(false);

  useEffect(() => {
    setCart(readCart(user?._id));
  }, [user]);

  // Merchandise open store states
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
    api.get('/constants').then((res) => setCategories(res.data.productCategories));
    api.get('/platform/about').then((res) => setAllocation(res.data.revenueAllocation));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      search: search || undefined,
      category: category === 'All' ? undefined : category,
    };
    api.get('/products', { params }).then((res) => {
      setProducts(res.data.products);
      setLoading(false);
    });
  }, [search, category]);

  useEffect(() => {
    if (user) {
      api.get('/stores/my')
        .then((res) => {
          setMyStore(res.data);
        })
        .catch(() => {});
      
      setStoreForm((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const addToCart = (product) => {
    if (!user) {
      navigate('/auth?mode=login&redirect=/store');
      return;
    }
    if (isFundraiser) {
      setShowFundraiserNotice(true);
      return;
    }
    setCart(addCartItem(product, 1, user?._id));
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
      const res = await api.post('/stores', storeForm);
      setMyStore(res.data.store);
      if (res.data.user) {
        setUser(res.data.user);
      }
      setShowCreateModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setOpenStoreError(err.response?.data?.message || 'Failed to create store. Please try again.');
    } finally {
      setOpenStoreLoading(false);
    }
  };

  const cartTotal = getCartTotal(cart);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Merchandise Store</h1>
          <p className="text-slate-400 text-xs mt-1">
            Support Sayrab causes through verified merchandise. 50% of every sale directly funds the linked campaign.
          </p>
        </div>
        {!isFundraiser && (
          <Link
            to={user ? "/cart" : "/auth?mode=login&redirect=/cart"}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-all text-xs font-bold text-slate-200"
          >
            <ShoppingBag className="text-cyan-400" size={18} />
            <span>
              {user ? `Cart: ${cart.length} items (${formatCurrency(cartTotal)})` : 'Cart (Sign in required)'}
            </span>
          </Link>
        )}
      </div>

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
                As a registered fundraiser, purchasing store merchandise is restricted. Products are designated for buyers and donors whose purchases generate 50% revenue for active campaigns.
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

      {allocation && (
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="font-extrabold text-white text-sm uppercase tracking-wider text-cyan-400">
            Platform Revenue Split Model
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(allocation).map(([key, value]) => (
              <div key={key} className="text-center p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <p className="text-2xl font-black text-cyan-400">{value}%</p>
                <p className="text-[11px] font-semibold text-slate-400 capitalize mt-0.5">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search merchandise by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl h-80 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">No merchandise found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 overflow-hidden hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.campaignId && (
                    <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md max-w-[85%] truncate">
                      {product.campaignId.title || 'Linked Campaign'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 mb-3">
                  <span className="text-base font-black text-white">{formatCurrency(product.price)}</span>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    50% to Cause
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/product/${product._id}`}
                    className="flex-1 py-2 text-center text-xs font-bold border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 transition-colors"
                  >
                    View Details
                  </Link>
                  {!isFundraiser && (
                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Open Store CTA Section */}
      <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <StoreIcon size={14} /> Sell On Sayrab
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Open Your Custom Merchandise Store
          </h2>
          <p className="mt-4 text-slate-300 text-sm md:text-base leading-relaxed">
            Are you raising funds for a cause? Boost your donations by offering brand merchandise (t-shirts, hoodies, mugs). Customize merchandise with your cause artwork, list them effortlessly, and direct 50% of sales directly into your active campaigns.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleOpenStoreClick}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {myStore ? 'Go to Store Dashboard' : 'Open Store Now'} <ArrowRight size={16} />
            </button>
            <p className="text-xs text-slate-400">
              No upfront inventory costs. Our verified manufacturers handle production & TCS delivery.
            </p>
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-800 rounded-2xl p-4 max-w-xs z-40 animate-slide-up">
          <p className="font-bold text-white text-xs mb-2">Shopping Cart ({cart.length})</p>
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-xs py-1 text-slate-300">
              <span className="truncate max-w-[140px]">{item.name} × {item.qty}</span>
              <span className="font-bold text-white">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="border-t border-slate-800 mt-2 pt-2 flex justify-between text-xs font-bold text-white">
            <span>Total</span>
            <span className="text-cyan-400">{formatCurrency(cartTotal)}</span>
          </div>
          <Link
            to="/cart"
            className="block w-full mt-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 text-center transition-all"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-scale-up">
            <div className="flex items-center gap-3 text-cyan-400 mb-4">
              <ShieldAlert size={36} />
              <h3 className="text-xl font-bold text-white">Authentication Required</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              You must be logged in to open a merchandise store. Register or log in to launch your storefront.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-2.5 border border-slate-700 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/auth?redirect=/store');
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl hover:from-blue-500 hover:to-cyan-400 cursor-pointer text-center shadow-lg shadow-cyan-500/20"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 my-8 shadow-2xl border border-slate-800 animate-scale-up">
            <h3 className="text-2xl font-black text-white mb-1">Create Merchandise Store</h3>
            <p className="text-slate-400 text-xs mb-6">
              Launch a storefront to start raising brand merchandise funds for verified causes.
            </p>
            
            <form onSubmit={handleCreateStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={storeForm.fullName}
                  onChange={(e) => setStoreForm({ ...storeForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Your Name"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="E.g., Hope Apparel"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Organization / Cause *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.organization}
                    onChange={(e) => setStoreForm({ ...storeForm, organization: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="E.g., Hope Foundation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Merchandise Type *</label>
                  <select
                    value={storeForm.merchType}
                    onChange={(e) => setStoreForm({ ...storeForm, merchType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="Apparel">Apparel & T-Shirts</option>
                    <option value="Drinkware">Mugs & Bottles</option>
                    <option value="Stationery">Notebooks & Pens</option>
                    <option value="Accessories">Bags & Totes</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Defaults to login email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Store Description *</label>
                <textarea
                  required
                  rows={3}
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                  placeholder="Describe your store and how the merchandise funds will support your charitable campaigns..."
                ></textarea>
              </div>

              {openStoreError && <p className="text-xs text-red-400">{openStoreError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={openStoreLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {openStoreLoading ? 'Creating Store...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-800 animate-scale-up">
            <CheckCircle className="text-emerald-400 mx-auto mb-4" size={54} />
            <h3 className="text-2xl font-black text-white mb-2">Store Opened Successfully!</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Congratulations! Your online store is active and your account is upgraded to Fundraiser. You can now add products, link merchandise to campaigns, and track earnings.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard');
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs rounded-xl hover:from-blue-500 hover:to-cyan-400 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Fundraiser Role Policy Notice Modal */}
      {showFundraiserNotice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert className="text-amber-400" size={22} />
                <h3 className="text-base font-extrabold text-white">Purchasing Not Allowed</h3>
              </div>
              <button
                onClick={() => setShowFundraiserNotice(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Fundraiser accounts cannot purchase merchandise products from the store. Store purchases are reserved for buyers and donors to fund active campaigns.
              </p>
              <p className="text-[11px] text-slate-500">
                You can create, link, and manage merchandise items for your own campaigns from the Fundraiser Portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/dashboard"
                onClick={() => setShowFundraiserNotice(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                Go to Fundraiser Portal <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setShowFundraiserNotice(false)}
                className="py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
