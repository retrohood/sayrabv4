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
    ready_to_ship: 'bg-amber-50 text-amber-700 border-amber-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e5e9e3] p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <Truck className="w-5 h-5" />
            </span>
            Logistics & Shipping Management
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Dispatch completed bulk production orders, generate shipment courier tracking, and update order fulfillment status for campaign organizers.
          </p>
        </div>
        <span className="text-xs font-bold bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20 px-3 py-1.5 rounded-xl">
          {queue.length} Fulfillment Shipments
        </span>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] text-[#64748b] font-bold border-b border-[#e5e9e3] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice / Campaign</th>
                <th className="p-4">Package Summary</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Courier & Tracking</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#172033]">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#94a3b8]">
                    No orders waiting for shipping.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item._id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#172033]">#{item.invoiceNumber}</div>
                      <div className="text-[11px] text-[#0ea5c6] font-bold">{item.campaignName}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-[#172033]">{item.itemSummary}</div>
                      <div className="text-[10px] text-[#64748b]">{item.productsCount} Package(s)</div>
                    </td>

                    <td className="p-4">
                      {item.shippingAddress ? (
                        <div>
                          <div className="font-semibold text-[#172033]">{item.shippingAddress.fullName}</div>
                          <div className="text-[10px] text-[#64748b] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0ea5c6]" /> {item.shippingAddress.city}, {item.shippingAddress.country}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#94a3b8]">Main Org Warehouse</span>
                      )}
                    </td>

                    <td className="p-4">
                      {item.trackingNumber ? (
                        <div>
                          <div className="font-bold text-[#172033]">{item.carrier}</div>
                          <div className="text-[11px] font-mono text-[#0ea5c6]">{item.trackingNumber}</div>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">Dispatch Pending</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                          statusBadges[item.shippingStatus] || 'bg-gray-100 text-[#64748b] border-gray-200'
                        }`}
                      >
                        {item.shippingStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {item.shippingStatus === 'ready_to_ship' ? (
                        <button
                          onClick={() => setActiveShipModal(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-[#89ca2e]" /> Generate Shipment
                        </button>
                      ) : (
                        <span className="text-[#367c35] font-bold text-xs inline-flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#0ea5c6]" /> Generate Dispatch Shipment
            </h3>
            <p className="text-xs text-[#64748b]">
              Order #{activeShipModal.invoiceNumber} • {activeShipModal.campaignName}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748b] font-bold mb-1">Courier Partner</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
                >
                  <option value="TCS Express Logistics">TCS Express Logistics</option>
                  <option value="Leopards Courier Service">Leopards Courier Service</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="M&P Express">M&P Express</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748b] font-bold mb-1">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-998810239"
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#64748b] font-bold mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveShipModal(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f7fb] text-[#64748b] text-xs font-semibold hover:bg-[#e5e9e3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold shadow-sm cursor-pointer"
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
