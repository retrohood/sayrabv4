import { Bell, Package, FileText, FlaskConical, DollarSign, Truck, Check } from 'lucide-react';

export default function NotificationsView({ notifications = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'new_order': return <Package className="w-4 h-4 text-[#0ea5c6]" />;
      case 'techpack_approved': return <FileText className="w-4 h-4 text-amber-600" />;
      case 'sample_approval': return <FlaskConical className="w-4 h-4 text-[#367c35]" />;
      case 'payment_update': return <DollarSign className="w-4 h-4 text-[#367c35]" />;
      default: return <Bell className="w-4 h-4 text-[#0ea5c6]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e5e9e3] p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <Bell className="w-5 h-5" />
            </span>
            Real-time System Alerts & Notifications
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Stay updated with new orders, techpack releases, sample feedback, and revenue releases.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 space-y-3 shadow-sm">
        {notifications.length === 0 ? (
          <p className="text-xs text-[#94a3b8] text-center py-8">No unread notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                n.read
                  ? 'bg-[#f8fafc] border-[#e5e9e3] text-[#64748b]'
                  : 'bg-[#f0fdf4] border-[#89ca2e]/40 text-[#172033] shadow-xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-[#e5e9e3] shrink-0 mt-0.5 shadow-xs">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#172033] text-xs">{n.title}</h4>
                  <span className="text-[10px] text-[#64748b]">
                    {new Date(n.time).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-1">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
