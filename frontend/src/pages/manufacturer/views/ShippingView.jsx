import { useState } from 'react';
import {
  Truck,
  Package,
  Calendar,
  MapPin,
  CheckCircle2,
  Send,
  ExternalLink,
  Search,
} from 'lucide-react';
import api from '../../../api/client';

export default function ShippingView({ queue = [], onRefresh }) {
  const [activeShipModal, setActiveShipModal] = useState(null);
  const [carrier, setCarrier] = useState('TCS Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleDispatch = async () => {
    if (!trackingNumber.trim()) {
      alert('Please provide a tracking number');
      return;
    }
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/shipping/${activeShipModal._id}`, {
        carrier,
        trackingNumber,
        dispatchDate: new Date(),
        estimatedDelivery: estimatedDelivery || new Date(Date.now() + 3 * 86400000),
      });
      setActiveShipModal(null);
      setTrackingNumber('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate shipment');
    } finally {
      setUpdating(false);
    }
  };

  const statusBadges = {
    ready_to_ship: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    shipped: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    in_transit: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" /> Logistics & Shipping Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch completed bulk production orders, generate shipment courier tracking, and update order fulfillment status for campaign organizers.
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-xl">
          {queue.length} Fulfillment Shipments
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice / Campaign</th>
                <th className="p-4">Package Summary</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Courier & Tracking</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No orders waiting for shipping.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">#{item.invoiceNumber}</div>
                      <div className="text-[11px] text-indigo-400">{item.campaignName}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{item.itemSummary}</div>
                      <div className="text-[10px] text-slate-400">{item.productsCount} Package(s)</div>
                    </td>

                    <td className="p-4">
                      {item.shippingAddress ? (
                        <div>
                          <div className="font-semibold text-white">{item.shippingAddress.fullName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" /> {item.shippingAddress.city}, {item.shippingAddress.country}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Main Org Warehouse</span>
                      )}
                    </td>

                    <td className="p-4">
                      {item.trackingNumber ? (
                        <div>
                          <div className="font-bold text-slate-200">{item.carrier}</div>
                          <div className="text-[11px] font-mono text-indigo-300">{item.trackingNumber}</div>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold text-[11px]">Dispatch Pending</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border capitalize ${
                          statusBadges[item.shippingStatus] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.shippingStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {item.shippingStatus === 'ready_to_ship' ? (
                        <button
                          onClick={() => setActiveShipModal(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                        >
                          <Send className="w-3.5 h-3.5" /> Generate Shipment
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Shipment Modal */}
      {activeShipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" /> Generate Dispatch Shipment
            </h3>
            <p className="text-xs text-slate-400">
              Order #{activeShipModal.invoiceNumber} • {activeShipModal.campaignName}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Courier Partner</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="TCS Express Logistics">TCS Express Logistics</option>
                  <option value="Leopards Courier Service">Leopards Courier Service</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="M&P Express">M&P Express</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-998810239"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveShipModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
