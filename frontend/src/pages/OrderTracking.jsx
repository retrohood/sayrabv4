import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Truck, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/format';

const timeline = ['placed', 'paid', 'production', 'shipped', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => {});
  }, [id]);

  const activeIndex = useMemo(
    () => Math.max(0, timeline.indexOf(order?.orderStatus || 'placed')),
    [order]
  );

  if (!order) {
    return (
      <div className="py-24 text-center text-[#64748b]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#89ca2e] mx-auto mb-3" />
        <p className="text-xs">Loading order delivery status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 text-[#172033]">
      <div className="rounded-3xl border border-[#e5e9e3] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e9e3] pb-4">
          <div>
            <span className="text-xs font-bold text-[#367c35] font-mono">
              ORDER #{order._id.slice(-8).toUpperCase()}
            </span>
            <h1 className="text-2xl font-black text-[#10182b] mt-0.5 flex items-center gap-2">
              <Truck size={22} className="text-[#367c35]" /> Delivery Progress
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-[#f7f9f5] hover:bg-slate-100 text-[#10182b] text-xs font-bold rounded-xl transition-colors self-start sm:self-auto border border-[#e5e9e3]"
          >
            My Buyer Portal →
          </Link>
        </div>

        {/* 5-Step Timeline */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          {timeline.map((status, index) => {
            const complete = index <= activeIndex;
            const Icon = complete ? CheckCircle2 : Circle;
            return (
              <div
                key={status}
                className={`rounded-2xl border p-4 transition-all ${
                  complete
                    ? 'border-[#89ca2e] bg-[#89ca2e]/10 text-[#367c35] shadow-xs'
                    : 'border-[#e5e9e3] bg-[#f7f9f5] text-[#64748b]'
                }`}
              >
                <Icon className={`h-5 w-5 ${complete ? 'text-[#367c35]' : 'text-[#64748b]'}`} />
                <p className="mt-2 text-xs font-black capitalize text-[#10182b]">{status}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 pt-2">
          {/* Purchased Items */}
          <section className="bg-[#f7f9f5] p-5 rounded-2xl border border-[#e5e9e3] space-y-3">
            <h2 className="font-extrabold text-[#10182b] text-xs uppercase tracking-wider text-[#367c35]">
              Purchased Items
            </h2>
            <div className="divide-y divide-[#e5e9e3]">
              {order.products?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-xs text-[#172033]">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-bold text-[#10182b]">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-[#e5e9e3] pt-3 text-sm font-black text-[#10182b]">
              <span>Total Paid</span>
              <span className="text-[#367c35]">{formatCurrency(order.total)}</span>
            </div>
          </section>

          {/* Fulfillment Logistics */}
          <section className="bg-[#f7f9f5] p-5 rounded-2xl border border-[#e5e9e3] space-y-3 text-xs">
            <h2 className="font-extrabold text-[#10182b] text-xs uppercase tracking-wider text-[#367c35]">
              Fulfillment Logistics
            </h2>
            <div className="space-y-2 text-[#64748b]">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold uppercase text-[#367c35]">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Production Stage:</span>
                <span className="font-bold text-[#10182b] capitalize">{order.orderStatus}</span>
              </div>
              {order.shippingAddress && (
                <div className="pt-2 border-t border-[#e5e9e3]">
                  <p className="font-bold text-[#10182b] mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-[#367c35]" /> Destination Address:
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    {order.shippingAddress.fullName && `${order.shippingAddress.fullName}, `}
                    {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
