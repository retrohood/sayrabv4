import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Building2,
  Coins,
  ShieldAlert,
  FileCheck2,
  Megaphone,
  Factory,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function NotificationsView({
  notifications = [],
  onMarkNotificationRead,
  onNavigate,
}) {
  const [filter, setFilter] = useState('all');

  const categories = [
    { key: 'all', label: 'All Notifications' },
    { key: 'verification_request', label: 'Verifications' },
    { key: 'payout_request', label: 'Payout Requests' },
    { key: 'suspicious_transaction', label: 'Security & Fraud' },
    { key: 'techpack_approval', label: 'Techpacks' },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'verification_request':
        return <Building2 size={16} className="text-amber-600" />;
      case 'payout_request':
        return <Coins size={16} className="text-[#367c35]" />;
      case 'suspicious_transaction':
        return <ShieldAlert size={16} className="text-rose-600" />;
      case 'techpack_approval':
        return <FileCheck2 size={16} className="text-indigo-600" />;
      default:
        return <Bell size={16} className="text-[#64748b]" />;
    }
  };

  const handleActionJump = (n) => {
    onMarkNotificationRead(n._id);
    if (n.type === 'verification_request') onNavigate('organizations', 'pending');
    else if (n.type === 'payout_request') onNavigate('payouts', 'all');
    else if (n.type === 'suspicious_transaction') onNavigate('transactions', 'all');
    else if (n.type === 'techpack_approval') onNavigate('manufacturers', 'techpacks');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => {
            const isActive = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                    : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onMarkNotificationRead('all')}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-bold text-[#367c35] hover:bg-[#89ca2e]/15 rounded-xl flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#89ca2e]/30"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? 'bg-white border-[#89ca2e]/50 shadow-xs'
                  : 'bg-[#f7f9f5]/70 border-[#e5e9e3] opacity-85'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-[#10182b]">{n.title}</h4>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#89ca2e] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-[#64748b] mt-1 block">
                    {formatDate(n.createdAt || new Date())}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleActionJump(n)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Review Record</span>
                  <ArrowRight size={13} />
                </button>
                {!n.isRead && (
                  <button
                    onClick={() => onMarkNotificationRead(n._id)}
                    className="p-1.5 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] text-xs transition-colors"
                    title="Mark read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-[#64748b] text-xs bg-white rounded-2xl border border-[#e5e9e3]">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
}
