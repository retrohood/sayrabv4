import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  FileText,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Ban,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function OrdersView({ orders, onUpdateStatus, onRefundOrder }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null); // order for invoice view/print
  const [refundModal, setRefundModal] = useState(null); // order for refund
  const [refundReason, setRefundReason] = useState('');

  const statuses = ['all', 'placed', 'paid', 'production', 'shipped', 'delivered', 'refunded'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : o.orderStatus === statusFilter || o.productionStatus === statusFilter;

    const matchesSearch =
      !search ||
      o.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.campaignId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.trackingNumber?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund.');
      return;
    }
    try {
      await onRefundOrder(refundModal._id, refundReason);
      setRefundModal(null);
      setRefundReason('');
    } catch (e) {
      alert(e.message || 'Refund failed');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await onUpdateStatus(orderId, { orderStatus: newStatus });
    } catch (e) {
      alert(e.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer, tracking..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Invoice & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Campaign & Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Production / Carrier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                        {o.invoiceNumber || 'INV-2026-00' + o._id.slice(-4)}
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {formatDate(o.createdAt || new Date())}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {o.customerId?.fullName || 'Guest Customer'}
                      </div>
                      <p className="text-slate-400 text-[11px]">{o.customerId?.email}</p>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-semibold text-emerald-600 truncate">{o.campaignId?.title}</p>
                      <p className="text-slate-500 text-[11px]">
                        {o.products?.map((p) => `${p.name} (x${p.quantity})`).join(', ')}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {o.assignedManufacturer?.name?.split(' ')[0] || 'Apex Textile'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {o.carrier || 'TCS'} &bull; {o.trackingNumber || 'No tracking'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.orderStatus || 'placed'}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 uppercase tracking-wider focus:outline-hidden"
                      >
                        <option value="placed">Placed</option>
                        <option value="paid">Paid</option>
                        <option value="production">Production</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="refunded">Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInvoiceModal(o)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-[11px] flex items-center gap-1"
                          title="View Invoice"
                        >
                          <FileText size={12} />
                          <span>Invoice</span>
                        </button>
                        {o.orderStatus !== 'refunded' && (
                          <button
                            onClick={() => setRefundModal(o)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Refund Order"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {invoiceModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">Sayrab Platform Invoice</span>
                <p className="text-slate-400">Order #{invoiceModal.invoiceNumber || invoiceModal._id}</p>
              </div>
              <button onClick={() => setInvoiceModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Billed To:</span>
                <p className="font-semibold">{invoiceModal.customerId?.fullName || invoiceModal.shippingAddress?.fullName}</p>
                <p className="text-slate-500">{invoiceModal.shippingAddress?.line1}</p>
                <p className="text-slate-500">{invoiceModal.shippingAddress?.city}, {invoiceModal.shippingAddress?.country}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Invoice Details:</span>
                <p className="text-slate-500">Date: {formatDate(invoiceModal.createdAt || new Date())}</p>
                <p className="text-slate-500">Payment: <strong className="text-emerald-600 uppercase">{invoiceModal.paymentStatus}</strong></p>
                <p className="text-slate-500">Fulfillment: <strong className="uppercase">{invoiceModal.orderStatus}</strong></p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoiceModal.products?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                        {item.size && <span className="text-slate-400 text-[10px] block">Size: {item.size}</span>}
                      </td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2.5 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Revenue Split Verification Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] mb-5 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Automated Platform Split Allocation:</span>
              <div className="flex justify-between text-slate-500">
                <span>Organization Share (50%):</span>
                <strong className="text-emerald-600">{formatCurrency(invoiceModal.total * 0.5)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Manufacturer Production (45%):</span>
                <strong className="text-amber-600">{formatCurrency(invoiceModal.total * 0.45)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Sayrab Governance Fee (5%):</span>
                <strong className="text-pink-600">{formatCurrency(invoiceModal.total * 0.05)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setInvoiceModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-rose-600 mb-1">Process Order Refund</h3>
            <p className="text-slate-500 mb-4">
              Order: <strong>{refundModal.invoiceNumber || refundModal._id}</strong> &bull; Total: <strong>{formatCurrency(refundModal.total)}</strong>
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Reason for Refund (Required)
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Product defect, incorrect sizing, customer dispute..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRefundModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="px-5 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                Confirm Full Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
