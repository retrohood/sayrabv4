import { useState } from 'react';
import {
  Package,
  Check,
  X,
  Eye,
  RefreshCw,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  DollarSign,
  MapPin,
  FileText,
  MessageSquare,
  Truck,
  CheckCircle2,
  Maximize2,
  Layers,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import api from '../../../api/client';
import { formatCurrency, formatDate } from '../../../utils/format';
import QuotationChatModal from '../../../components/QuotationChatModal';

const PRODUCTION_STAGES = [
  { id: 'pending_start', label: 'Pending Start', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'in_production', label: 'In Production', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'quality_check', label: 'Quality Check', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'shipped', label: 'Shipped / Dispatched', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'completed', label: 'Completed', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
];

export default function ProductionOrdersView({ orders = [], onRefresh }) {
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'sample' | 'bulk'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeChatQuotation, setActiveChatQuotation] = useState(null);
  const [techpackModalImage, setTechpackModalImage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/api/manufacturer/orders/${orderId}/status`, { productionStatus: newStatus });
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, productionStatus: newStatus, status: newStatus }));
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update production status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const isSample = o.orderType === 'sample' || (o.products?.reduce((s, p) => s + (p.quantity || 1), 0) <= 5);
    if (typeFilter === 'sample' && !isSample) return false;
    if (typeFilter === 'bulk' && isSample) return false;

    if (statusFilter !== 'all') {
      const currentStat = o.productionStatus || o.status || 'pending_start';
      if (currentStat !== statusFilter) return false;
    }

    if (searchQuery.trim()) {
      const qry = searchQuery.toLowerCase();
      const matchInvoice = (o.invoiceNumber || '').toLowerCase().includes(qry);
      const matchFundraiser = (o.customerId?.fullName || o.fundraiserId?.fullName || o.shippingAddress?.fullName || '').toLowerCase().includes(qry);
      const matchProduct = o.products?.some((p) => p.name?.toLowerCase().includes(qry));
      const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(qry);
      if (!matchInvoice && !matchFundraiser && !matchProduct && !matchCity) return false;
    }

    return true;
  });

  const getTimelineSteps = (order) => {
    const currentStatus = order.productionStatus || order.status || 'pending_start';
    const statusOrder = ['pending_start', 'in_production', 'quality_check', 'ready_to_ship', 'shipped', 'delivered', 'completed'];
    const currentIdx = Math.max(0, statusOrder.indexOf(currentStatus));

    return [
      { label: 'Order Kickoff', desc: 'Assigned & Funded', done: currentIdx >= 0 },
      { label: 'In Production', desc: 'Knitting & Tailoring', done: currentIdx >= 1 },
      { label: 'Quality Check', desc: 'Specs & Stitching Checked', done: currentIdx >= 2 },
      { label: 'Dispatch Ready', desc: 'Packed & Labeled', done: currentIdx >= 3 },
      { label: 'Courier Shipped', desc: order.carrier || 'TCS Freight', done: currentIdx >= 4 },
      { label: 'Delivered', desc: 'Signed by Fundraiser', done: currentIdx >= 5 },
    ];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Sub-Nav */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Package className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white">
                Unified Production Orders
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Manage sample prototypes and bulk production runs under one single dashboard workflow.
            </p>
          </div>

          {/* Type Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setTypeFilter('sample')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                typeFilter === 'sample'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sample Prototypes
            </button>
            <button
              onClick={() => setTypeFilter('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                typeFilter === 'bulk'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulk Production
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            All Statuses
          </button>
          {PRODUCTION_STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === st.id
                  ? `${st.color} font-bold shadow-xs`
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Production Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When fundraisers accept your quotation proposals, production orders are automatically initiated and assigned to your factory queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const totalUnits = order.products?.reduce((sum, p) => sum + (p.quantity || 1), 0) || 1;
            const isSample = order.orderType === 'sample' || totalUnits <= 5;
            const currentStatus = order.productionStatus || order.status || 'pending_start';
            const techPackImg =
              order.techPackImage ||
              order.techpackId?.previewImages?.[0] ||
              order.quotationProposal?.techPackImage ||
              '';

            return (
              <div
                key={order._id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-300 text-xs">
                        {order.invoiceNumber || `ORD-${order._id.slice(-6)}`}
                      </span>

                      {/* Order Type Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSample
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isSample ? 'Sample Prototype' : 'Bulk Production Run'}
                      </span>

                      {/* Payment Status */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Funds Escrowed ✓' : order.paymentStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {order.products?.[0]?.name || 'Custom Apparel Merchandise'}
                    </h3>

                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Fundraiser:</span>
                      <strong className="text-slate-200">
                        {order.customerId?.fullName || order.fundraiserId?.fullName || order.shippingAddress?.fullName || 'Fundraiser Client'}
                      </strong>
                      {order.campaignId?.title && (
                        <>
                          <span>• Campaign:</span>
                          <strong className="text-cyan-400">{order.campaignId.title}</strong>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Status Dropdown */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Production State
                      </span>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                      >
                        {PRODUCTION_STAGES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-right pl-3 border-l border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Order Value
                      </span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        ${order.total || 0} USD
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {totalUnits} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
                  {/* Tech Pack Preview */}
                  <div className="col-span-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div
                      onClick={() => techPackImg && setTechpackModalImage(techPackImg)}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group cursor-pointer shrink-0 flex items-center justify-center"
                    >
                      {techPackImg ? (
                        <>
                          <img src={techPackImg} alt="Tech Pack" className="w-full h-full object-contain p-1" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-cyan-400">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </>
                      ) : (
                        <FileText className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Tech Pack Drawing</span>
                      <p className="text-slate-200 font-semibold truncate">
                        {order.products?.[0]?.size ? `Size: ${order.products[0].size}` : 'Techpack Spec v2'}
                      </p>
                      <button
                        onClick={() => techPackImg && setTechpackModalImage(techPackImg)}
                        className="text-[11px] text-cyan-400 hover:underline font-medium"
                      >
                        Inspect Full Sheet
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="col-span-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {isSample ? 'Sample Delivery Address' : 'Warehouse Fulfillment Address'}
                    </span>
                    <p className="font-bold text-slate-200 truncate">
                      {order.shippingAddress?.fullName || 'Recipient'} ({order.shippingAddress?.phone || '+923000000000'})
                    </p>
                    <p className="text-slate-400 text-[11px] truncate">
                      {order.shippingAddress?.line1 || 'Address details'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {order.shippingAddress?.city || 'Lahore'}, {order.shippingAddress?.country || 'Pakistan'}
                    </p>
                  </div>

                  {/* Production Timeline Mini Bar */}
                  <div className="col-span-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">Production Timeline Progress</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        ETA: {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '14 Days Lead'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {getTimelineSteps(order).map((step, idx) => (
                        <div key={idx} className="space-y-1 text-center">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              step.done ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-800'
                            }`}
                          />
                          <span
                            className={`text-[9px] block truncate ${
                              step.done ? 'text-slate-300 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {order.trackingNumber && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Tracking: <strong className="text-slate-200">{order.trackingNumber}</strong> ({order.carrier})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chat with Fundraiser */}
                    <button
                      onClick={() =>
                        setActiveChatQuotation({
                          _id: order.quotationId?._id || order.quotationId || order._id,
                          projectName: order.products?.[0]?.name,
                          assignedManufacturer: { name: 'Apex Textile & Apparel Mills' },
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Chat with Fundraiser</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Techpack Image Zoom Modal */}
      {techpackModalImage && (
        <div className="fixed inset-0 z-70 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 shadow-2xl relative">
            <button
              onClick={() => setTechpackModalImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tech Pack Detailed Drawing</h4>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800">
              <img src={techpackModalImage} alt="Tech Pack" className="max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Secure Quotation / Order Chat Modal */}
      {activeChatQuotation && (
        <QuotationChatModal
          quotation={activeChatQuotation}
          onClose={() => setActiveChatQuotation(null)}
        />
      )}
    </div>
  );
}
