import { useState, useEffect } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/format';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);
      if (existing) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
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
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-primary-700">{formatCurrency(product.price)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-xl border border-slate-200 rounded-xl p-4 max-w-xs">
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
          <button className="w-full mt-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700">
            Proceed to Checkout
          </button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Full checkout & order tracking — coming in next module
          </p>
        </div>
      )}
    </div>
  );
}
