import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import { cartTotal } from '../../../utils/cart';

export default function BuyerCartView({
  buyerCart,
  updateBuyerCart,
  handleUpdateQty,
  handleRemoveCartItem,
  checkoutForm,
  setCheckoutForm,
  handleBuyerCheckout,
  checkoutSubmitting,
  checkoutError,
  checkoutSuccess,
  setSelectedTrackingOrder,
  setCheckoutSuccess,
  setActiveTab,
}) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <h2 className="text-xl font-black text-[#10182b]">My Shopping Cart & Checkout</h2>
        <p className="text-xs text-[#64748b]">
          Review selected merchandise items, provide delivery details, and support verified causes
        </p>
      </div>

      {checkoutSuccess ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 text-center max-w-xl mx-auto shadow-xl space-y-4">
          <div className="w-16 h-16 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle size={36} />
          </div>
          <h3 className="text-2xl font-black text-[#10182b]">Order Placed Successfully!</h3>
          <p className="text-xs text-[#64748b] leading-relaxed">
            Thank you for your order. Order{' '}
            <strong className="text-[#367c35]">
              #{checkoutSuccess._id?.slice(-8).toUpperCase()}
            </strong>{' '}
            has been confirmed and 50% of the proceeds are allocated directly to verified causes.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSelectedTrackingOrder(checkoutSuccess);
                setCheckoutSuccess(null);
                setActiveTab('buyer_tracking');
              }}
              className="px-6 py-2.5 bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Truck size={15} /> Track Delivery Now
            </button>
          </div>
        </div>
      ) : buyerCart.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center max-w-md mx-auto shadow-xs">
          <ShoppingBag size={48} className="text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#10182b]">Your Cart is Empty</h3>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            Visit the store to explore purpose-driven apparel and accessories.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('donor_overview')}
            className="px-4 py-2 bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Explore Causes & Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#e5e9e3] overflow-hidden shadow-xs">
              <div className="p-4 bg-[#f7f9f5] border-b border-[#e5e9e3] flex justify-between items-center text-xs font-bold text-[#10182b]">
                <span>
                  Items in Cart ({buyerCart.reduce((sum, item) => sum + (item.qty || 1), 0)})
                </span>
                <button
                  type="button"
                  onClick={() => updateBuyerCart([])}
                  className="text-red-600 hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-[#e5e9e3]">
                {buyerCart.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#e5e9e3] bg-[#f7f9f5] shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-[#10182b] text-sm">{item.name}</h4>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {formatCurrency(item.price)} each
                        </p>
                        {item.selectedSize && (
                          <span className="text-[10px] text-[#367c35] font-semibold block">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      <div className="flex items-center border border-[#e5e9e3] rounded-lg overflow-hidden bg-[#f7f9f5]">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item._id, -1)}
                          className="p-1.5 hover:bg-[#e5e9e3] text-[#10182b] transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#10182b]">
                          {item.qty || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item._id, 1)}
                          className="p-1.5 hover:bg-[#e5e9e3] text-[#10182b] transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-black text-sm text-[#10182b] block text-right">
                        {formatCurrency(item.price * (item.qty || 1))}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(item._id)}
                        className="p-1.5 text-[#64748b] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Form & Order Summary (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-[#10182b] border-b border-[#e5e9e3] pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#64748b]">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-[#10182b]">
                    {formatCurrency(cartTotal(buyerCart))}
                  </span>
                </div>
                <div className="flex justify-between text-[#367c35] font-bold bg-[#89ca2e]/10 p-2.5 rounded-xl border border-[#89ca2e]/20">
                  <span>Direct Charity Impact (50%):</span>
                  <span>{formatCurrency(cartTotal(buyerCart) * 0.5)}</span>
                </div>
                <div className="flex justify-between text-[#64748b]">
                  <span>Estimated Shipping:</span>
                  <span className="font-bold text-[#367c35]">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#e5e9e3] flex justify-between text-sm font-black text-[#10182b]">
                  <span>Total Due:</span>
                  <span className="text-[#367c35] text-base">
                    {formatCurrency(cartTotal(buyerCart))}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                  {checkoutError}
                </div>
              )}

              {/* Shipping Form */}
              <form onSubmit={handleBuyerCheckout} className="space-y-3 pt-3 border-t border-[#e5e9e3]">
                <h4 className="text-xs font-bold uppercase text-[#10182b] tracking-wider">
                  Delivery Address
                </h4>

                <div>
                  <input
                    type="text"
                    placeholder="Recipient Full Name"
                    value={checkoutForm.fullName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone (Numbers Only)"
                    value={checkoutForm.phone}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        phone: e.target.value.replace(/\D/g, '').slice(0, 11),
                      })
                    }
                    required
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Street Address, Area"
                    value={checkoutForm.line1}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, line1: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                  <input
                    type="text"
                    placeholder="Province"
                    value={checkoutForm.state}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="w-full py-3 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <span>{checkoutSubmitting ? 'Processing Order...' : 'Complete Order'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
