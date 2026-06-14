import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
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
    return <div className="py-20 text-center text-slate-500">Loading order...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-primary-600">Order #{order._id.slice(-8).toUpperCase()}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Order Tracking</h1>
        <p className="mt-1 text-slate-500">Placed {formatDate(order.createdAt)}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {timeline.map((status, index) => {
            const complete = index <= activeIndex;
            const Icon = complete ? CheckCircle2 : Circle;
            return (
              <div key={status} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Icon className={`h-5 w-5 ${complete ? 'text-primary-600' : 'text-slate-300'}`} />
                <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{status}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="font-semibold text-slate-900">Items</h2>
            <div className="mt-3 divide-y divide-slate-200">
              {order.products.map((item) => (
                <div key={`${item.productId}-${item.name}`} className="flex justify-between py-3 text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Fulfillment</h2>
            <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p>Payment: <span className="font-semibold capitalize text-slate-900">{order.paymentStatus}</span></p>
              <p className="mt-2">Production: <span className="font-semibold capitalize text-slate-900">{order.productionStatus?.replace('_', ' ')}</span></p>
              {order.trackingNumber && <p className="mt-2">Tracking: <span className="font-semibold text-slate-900">{order.trackingNumber}</span></p>}
              {order.campaignId?.title && <p className="mt-2">Campaign: <span className="font-semibold text-slate-900">{order.campaignId.title}</span></p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
