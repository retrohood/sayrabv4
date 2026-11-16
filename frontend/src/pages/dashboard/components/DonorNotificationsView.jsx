import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Receipt,
  Megaphone,
  Sparkles,
  Info,
  Trash2,
  Check,
} from 'lucide-react';
import { formatDate } from '../../../utils/format';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    type: 'receipt',
    title: 'Donation Receipt Generated',
    description: 'Your contribution of PKR 5,000 to "Clean Water Wells Project" was verified and allocated.',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    icon: Receipt,
    color: 'text-[#367c35] bg-[#89ca2e]/10',
  },
  {
    id: 2,
    type: 'milestone',
    title: 'Campaign Milestone Reached! 🎉',
    description: '"Life-Saving Heart Surgery for 6-Year-Old Ayan" has crossed 75% of its fundraising goal!',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    icon: Megaphone,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    id: 3,
    type: 'system',
    title: 'Welcome to Sayrab Philanthropy',
    description: 'Explore verified campaigns, purchase purpose-driven merchandise, and track all your impact receipts.',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    icon: Sparkles,
    color: 'text-blue-600 bg-blue-50',
  },
];

export default function DonorNotificationsView() {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClear = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'receipts') return n.type === 'receipt';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">Notifications & Alerts</h2>
          <p className="text-xs text-[#64748b]">
            Milestones, donation receipts, and transparent organizer updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-[#f7f9f5] hover:bg-[#e5e9e3] text-[#10182b] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#e5e9e3]"
          >
            <Check size={14} className="text-[#367c35]" />
            <span>Mark all read</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread' },
          { id: 'receipts', label: 'Receipts & Payments' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#89ca2e] text-white'
                : 'bg-white text-[#64748b] border border-[#e5e9e3] hover:text-[#10182b]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-12 text-center shadow-xs">
          <Bell size={36} className="mx-auto text-[#64748b] mb-3" />
          <h3 className="text-sm font-bold text-[#10182b]">No notifications to display</h3>
          <p className="text-xs text-[#64748b] mt-1">
            You are completely up to date.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-4 sm:p-6 shadow-xs divide-y divide-[#e5e9e3]">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`py-4 flex items-start gap-4 transition-colors px-2 rounded-2xl ${
                  !item.isRead ? 'bg-[#89ca2e]/5' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#10182b] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#64748b] shrink-0">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
