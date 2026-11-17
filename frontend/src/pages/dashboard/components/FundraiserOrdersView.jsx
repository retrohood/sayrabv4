import {
  Package,
  ShoppingBag,
  Coins,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function FundraiserOrdersView({
  campaignOrders = [],
}) {
  const totalUnits = campaignOrders.reduce(
    (sum, o) => sum + (o.products?.reduce((pSum, p) => pSum + (p.quantity || 1), 0) || 1),
    0
  );

  const totalRevenue = campaignOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount || o.amount || 0) * 0.5),
    0
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <h2 className="text-xl font-black text-[#10182b]">Merchandise Orders Received</h2>
        <p className="text-xs text-[#64748b]">
          Review buyer orders for your campaign merchandise and verified 50% profit share allocations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Orders Received
          </span>
          <p className="text-2xl font-black text-[#10182b]">{campaignOrders.length}</p>
          <p className="text-[11px] text-[#64748b] mt-1">Linked campaign sales</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Units Ordered
          </span>
          <p className="text-2xl font-black text-[#10182b]">{totalUnits}</p>
          <p className="text-[11px] text-[#64748b] mt-1">Total pieces sold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Your 50% Profit Share
          </span>
          <p className="text-2xl font-black text-[#367c35]">
            +{formatCurrency(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#367c35] font-semibold mt-1">
            Credited directly to campaign funds
          </p>
        </div>
      </div>

      {/* Orders Table */}
      {campaignOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <Package size={48} className="text-[#64748b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#10182b]">No merchandise orders received yet</h3>
          <p className="text-xs text-[#64748b] mt-1">
            Orders placed by supporters on the Merchandise Store will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items / Details</th>
                  <th className="px-6 py-4">Your 50% Share</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e9e3]">
                {campaignOrders.map((ord, idx) => (
                  <tr key={ord._id || idx} className="hover:bg-[#f7f9f5]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#10182b]">
                      #{ord._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#10182b] block">
                        {ord.shippingAddress?.fullName || 'Online Supporter'}
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        {ord.shippingAddress?.city || 'Pakistan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {ord.products?.map((p, pIdx) => (
                          <div key={pIdx} className="text-[11px] text-[#10182b]">
                            <span>{p.quantity || 1}x {p.name || p.productId?.name || 'Campaign Merchandise'}</span>
                            {p.size && <span className="text-[#64748b] ml-1">({p.size})</span>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-[#367c35] text-sm">
                      +{formatCurrency((Number(ord.totalAmount || ord.amount || 0)) * 0.5)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                        {ord.deliveryStatus || ord.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
