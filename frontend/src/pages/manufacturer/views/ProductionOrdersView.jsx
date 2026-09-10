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
} from 'lucide-react';
import api from '../../../api/client';

export default function ProductionOrdersView({ orders = [], onRefresh }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleAccept = async (orderId) => {
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/orders/${orderId}/accept`, { action: 'accept' });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/orders/${rejectModal}/accept`, {
        action: 'reject',
        reason: rejectReason,
      });
      setRejectModal(null);
      setRejectReason('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/orders/${orderId}/status`, { productionStatus: newStatus });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_production: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    quality_check: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ready_to_ship: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    shipped: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Assigned Production Orders</h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-medium">
            {filteredOrders.length} Orders
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['all', 'pending', 'accepted', 'in_production', 'quality_check', 'ready_to_ship', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Campaign & Org</th>
                <th className="p-4">Product Specs</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Priority & Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4">45% Rev Share</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No production orders found for this status.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{ord.campaignName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" /> {ord.organization}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{ord.product}</div>
                      <div className="text-[10px] text-slate-400">
                        {ord.productsCount > 1 ? `+${ord.productsCount - 1} more items` : 'Standard Fit'}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-white text-sm">
                      {ord.quantity} units
                    </td>

                    <td className="p-4 space-y-1">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          ord.priority === 'urgent' || ord.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ord.priority}
                      </span>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Deadline: {new Date(ord.deadline).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border capitalize ${
                          statusColors[ord.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-emerald-400">
                      PKR {ord.manufacturerRevenueShare?.toLocaleString()}
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      {/* Action Dropdown / Buttons */}
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        title="View Details"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {ord.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(ord._id)}
                            disabled={updating}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => setRejectModal(ord._id)}
                            disabled={updating}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {ord.status !== 'pending' && ord.status !== 'rejected' && (
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="accepted">Status: Accepted</option>
                          <option value="in_production">Status: In Production</option>
                          <option value="quality_check">Status: Quality Check</option>
                          <option value="ready_to_ship">Status: Ready to Ship</option>
                          <option value="shipped">Status: Shipped</option>
                          <option value="delivered">Status: Delivered</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Reject Production Order
            </h3>
            <p className="text-xs text-slate-400">
              Please state the reason for rejecting this production order. This will notify admin and organizer.
            </p>
            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Fabric stock unavailable / Capacity limit reached"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Order Details</h3>
                <p className="text-xs text-slate-400">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Campaign</span>
                <p className="font-bold text-white mt-1">{selectedOrder.campaignName}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Organization</span>
                <p className="font-bold text-white mt-1">{selectedOrder.organization}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Product Item</span>
                <p className="font-bold text-white mt-1">{selectedOrder.product}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Quantity</span>
                <p className="font-bold text-emerald-400 mt-1">{selectedOrder.quantity} Units</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">45% Revenue Share</span>
                <p className="font-bold text-emerald-400 mt-1">PKR {selectedOrder.manufacturerRevenueShare?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Production Status</span>
                <p className="font-bold text-indigo-400 mt-1 capitalize">{selectedOrder.status.replace('_', ' ')}</p>
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Shipping Destination
                </span>
                <p className="font-semibold text-slate-200">{selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})</p>
                <p className="text-slate-400">{selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500"
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
