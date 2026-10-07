import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Truck, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/format';

const timeline = ['placed', 'paid', 'production', 'shipped', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  const activeIndex = useMemo(
    () => Math.max(0, timeline.indexOf(order?.orderStatus || 'placed')),
    [order]
  );

  if (!order) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3" />
        <p className="text-xs">Loading order delivery status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              ORDER #{order._id.slice(-8).toUpperCase()}
            </span>
            <h1 className="text-2xl font-black text-white mt-0.5 flex items-center gap-2">
              <Truck size={22} className="text-cyan-400" /> Delivery Progress
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto border border-slate-700"
          >
            My Buyer Portal →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {timeline.map((status, index) => {
            const complete = index <= activeIndex;
            const Icon = complete ? CheckCircle2 : Circle;
            return (
              <div
                key={status}
                className={`rounded-2xl border p-4 transition-all ${
                  complete
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/60 text-slate-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${complete ? 'text-cyan-400' : 'text-slate-600'}`} />
                <p className="mt-2 text-xs font-extrabold capitalize text-white">{status}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 pt-2">
          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="font-extrabold text-white text-xs uppercase tracking-wider text-cyan-400">
              Purchased Items
            </h2>
            <div className="divide-y divide-slate-800/80">
              {order.products.map((item) => (
                <div key={`${item.productId}-${item.name}`} className="flex justify-between py-2.5 text-xs text-slate-300">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-bold text-white">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-black text-white">
              <span>Total Paid</span>
              <span className="text-cyan-400">{formatCurrency(order.total)}</span>
            </div>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h2 className="font-extrabold text-white text-xs uppercase tracking-wider text-cyan-400">
              Fulfillment Logistics
            </h2>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold uppercase text-emerald-400">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Production Stage:</span>
                <span className="font-bold uppercase text-slate-200">{order.productionStatus?.replace('_', ' ')}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span>Tracking Code:</span>
                  <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{order.trackingNumber}</span>
                </div>
              )}
              {order.campaignId?.title && (
                <div className="flex justify-between">
                  <span>Linked Campaign:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[180px]">{order.campaignId.title}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
