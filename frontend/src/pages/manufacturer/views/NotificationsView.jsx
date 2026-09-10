import { Bell, Package, FileText, FlaskConical, DollarSign, Truck, Check } from 'lucide-react';

export default function NotificationsView({ notifications = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'new_order': return <Package className="w-4 h-4 text-blue-400" />;
      case 'techpack_approved': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'sample_approval': return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      case 'payment_update': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" /> Real-time System Alerts & Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with new orders, techpack releases, sample feedback, and revenue releases.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No unread notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
                n.read
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-slate-800/80 border-indigo-500/30 text-slate-200'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.time).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
