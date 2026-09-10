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
  notifications,
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
        return <Building2 size={16} className="text-amber-500" />;
      case 'payout_request':
        return <Coins size={16} className="text-emerald-500" />;
      case 'suspicious_transaction':
        return <ShieldAlert size={16} className="text-rose-500" />;
      case 'techpack_approval':
        return <FileCheck2 size={16} className="text-indigo-500" />;
      default:
        return <Bell size={16} className="text-slate-400" />;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === c.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onMarkNotificationRead('all')}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center gap-1.5 transition-colors"
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
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatDate(n.createdAt || new Date())}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleActionJump(n)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <span>Review Record</span>
                  <ArrowRight size={13} />
                </button>
                {!n.isRead && (
                  <button
                    onClick={() => onMarkNotificationRead(n._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs"
                    title="Mark read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
}
