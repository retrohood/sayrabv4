import { useState } from 'react';
import {
  Truck,
  Package,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

const TRACKING_STEPS = [
  { id: 'placed', label: 'Order Placed', desc: 'Received & verified by Sayrab' },
  { id: 'confirmed', label: 'Confirmed', desc: 'Assigned to verified manufacturer' },
  { id: 'production', label: 'In Production', desc: 'Print & stitching in progress' },
  { id: 'dispatched', label: 'Dispatched', desc: 'Handed to courier for delivery' },
  { id: 'delivered', label: 'Delivered', desc: 'Package received by customer' },
];

export default function BuyerTrackingView({
  buyerOrders = [],
  selectedTrackingOrder,
  setSelectedTrackingOrder,
  lookupOrderId,
  setLookupOrderId,
  handleManualTrackingLookup,
  lookupLoading,
  lookupError,
  copiedCode,
  handleCopyCode,
}) {
  const currentOrder = selectedTrackingOrder || buyerOrders[0];

  // Helper to calculate milestone index
  const getStepIndex = (order) => {
    if (!order) return 0;
    const status = (order.deliveryStatus || order.status || '').toLowerCase();
    if (status === 'delivered') return 4;
    if (status === 'dispatched' || status === 'shipped') return 3;
    if (status === 'production' || status === 'processing') return 2;
    if (status === 'confirmed' || status === 'approved') return 1;
    return 0;
  };

  const activeStep = getStepIndex(currentOrder);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">Merchandise Order Tracking</h2>
          <p className="text-xs text-[#64748b]">
            Monitor live production stages, courier dispatches, and delivery milestones
          </p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleManualTrackingLookup} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Enter Order ID to track..."
            value={lookupOrderId}
            onChange={(e) => setLookupOrderId(e.target.value)}
            className="w-full sm:w-60 px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="px-3.5 py-2 bg-[#89ca2e] hover:bg-[#78b327] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {lookupLoading ? '...' : <Search size={15} />}
          </button>
        </form>
      </div>

      {lookupError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{lookupError}</span>
        </div>
      )}

      {!currentOrder ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <Truck size={48} className="text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#10182b]">No order tracking found</h3>
          <p className="text-xs text-[#64748b] mt-1">
            Orders placed via the store will automatically show live courier progression here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Tracking Tracker Box (Col 8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e5e9e3] gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  Tracking Order
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#10182b]">
                    #{currentOrder._id?.slice(-8).toUpperCase()}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentOrder._id)}
                    className="p-1 text-[#64748b] hover:text-[#367c35] cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedCode === currentOrder._id ? (
                      <Check size={14} className="text-[#367c35]" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm font-black text-[#367c35]">
                {formatCurrency(currentOrder.totalAmount || currentOrder.amount || 0)}
              </div>
            </div>

            {/* Visual Milestones Stepper */}
            <div className="py-4">
              <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div key={step.id} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10 text-left md:text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-[#89ca2e] text-white shadow-xs'
                            : 'bg-[#f7f9f5] border-2 border-[#e5e9e3] text-[#64748b]'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-[#367c35]' : 'text-[#10182b]'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Delivery Details */}
            <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#64748b]">
                <span>Shipping Partner:</span>
                <span className="font-bold text-[#10182b]">TCS Express / Trax Logistics</span>
              </div>
              <div className="flex items-center justify-between text-[#64748b]">
                <span>Recipient:</span>
                <span className="font-bold text-[#10182b]">
                  {currentOrder.shippingAddress?.fullName || 'Valued Supporter'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748b]">
                <span>Destination:</span>
                <span className="font-bold text-[#10182b]">
                  {currentOrder.shippingAddress?.city || 'Lahore'}, Pakistan
                </span>
              </div>
            </div>
          </div>

          {/* All User Orders List (Col 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e5e9e3] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider pb-3 border-b border-[#e5e9e3]">
              My Store Orders ({buyerOrders.length})
            </h3>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {buyerOrders.map((ord) => {
                const isSelected = (currentOrder?._id === ord._id);
                return (
                  <div
                    key={ord._id}
                    onClick={() => setSelectedTrackingOrder(ord)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#89ca2e]/10 border-[#89ca2e]'
                        : 'bg-[#f7f9f5] border-[#e5e9e3] hover:border-[#89ca2e]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#10182b]">
                      <span>#{ord._id?.slice(-8).toUpperCase()}</span>
                      <span className="text-[#367c35] font-black">
                        {formatCurrency(ord.totalAmount || ord.amount || 0)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748b] mt-1">
                      Placed: {formatDate(ord.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
