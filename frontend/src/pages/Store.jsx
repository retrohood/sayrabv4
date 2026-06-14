import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Store as StoreIcon, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { addCartItem, cartTotal as getCartTotal, readCart } from '../utils/cart';

export default function Store() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState(() => readCart());
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setCart(addCartItem(product));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Merchandise Store</h1>
          <p className="text-slate-600 mt-1">
            Support Sayrab through branded merchandise. Profits fund charitable causes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
          <ShoppingBag className="text-primary-600" size={20} />
          <span className="font-medium text-primary-700">
            Cart: {cart.length} items ({formatCurrency(cartTotal)})
          </span>
        </div>
      </div>

      {allocation && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="font-semibold text-slate-800 mb-3">Revenue Allocation Policy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(allocation).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{value}%</p>
                <p className="text-xs text-slate-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
            <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow animate-fade-in"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <span className="text-xs text-primary-600 font-medium">{product.category}</span>
                <h3 className="font-semibold text-slate-800 mt-1">{product.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center justify-between gap-2 mt-4">
                  <span className="font-bold text-primary-700">{formatCurrency(product.price)}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Open Store CTA Section */}
      <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <StoreIcon size={14} /> Sell On Sayrab
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Open Your Custom Merchandise Store
          </h2>
          <p className="mt-4 text-primary-100 text-lg leading-relaxed">
            Are you raising funds for a cause? Boost your donations by offering brand merchandise (t-shirts, mugs, notebooks). Customize merchandise with your logo, list them easily, and direct up to 70% of profits to your active campaigns.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleOpenStoreClick}
              className="px-6 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {myStore ? 'Go to Store Dashboard' : 'Open Store Now'} <ArrowRight size={18} />
            </button>
            <p className="text-sm text-primary-100 flex items-center justify-center">
              No upfront inventory costs. We handle print & delivery.
            </p>
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-xl border border-slate-200 rounded-xl p-4 max-w-xs z-40">
          <p className="font-semibold text-slate-800 mb-2">Shopping Cart</p>
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-sm py-1">
              <span>{item.name} × {item.qty}</span>
              <span>{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <Link
            to="/cart"
            className="block w-full mt-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 text-center"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <ShieldAlert size={36} />
              <h3 className="text-xl font-bold text-slate-800">Authentication Required</h3>
            </div>
            <p className="text-slate-600 mb-6">
              You must be logged in to open a merchandise store. Register or log in to upgrade your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/auth?redirect=/store');
                }}
                className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 cursor-pointer text-center"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8 shadow-2xl border border-slate-100 animate-scale-up">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Create Merchandise Store</h3>
            <p className="text-slate-500 text-sm mb-6">
              Upgrade your account and launch a storefront to start raising brand merchandise funds.
            </p>
            
            <form onSubmit={handleCreateStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={storeForm.fullName}
                  onChange={(e) => setStoreForm({ ...storeForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Your Name"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="E.g., Hope Apparel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Organization / Cause *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.organization}
                    onChange={(e) => setStoreForm({ ...storeForm, organization: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="E.g., Hope Foundation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Merchandise Type *</label>
                  <select
                    value={storeForm.merchType}
                    onChange={(e) => setStoreForm({ ...storeForm, merchType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="Apparel">Apparel & T-Shirts</option>
                    <option value="Drinkware">Mugs & Bottles</option>
                    <option value="Stationery">Notebooks & Pens</option>
                    <option value="Accessories">Bags & Totes</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Defaults to login email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Store Description *</label>
                <textarea
                  required
                  rows={3}
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                  placeholder="Describe your store and how the merchandise funds will support your charitable campaigns..."
                ></textarea>
              </div>

              {openStoreError && <p className="text-sm text-red-600">{openStoreError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={openStoreLoading}
                  className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100 animate-scale-up">
            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={54} />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Store Opened Successfully!</h3>
            <p className="text-slate-600 mb-6">
              Congratulations! Your online store is active and your account is upgraded to Fundraiser. You can now add products, customize merchandise mockups, and view campaigns in your dashboard.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard');
              }}
              className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 cursor-pointer flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
