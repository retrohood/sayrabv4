import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  KeyRound,
  Ban,
  Trash2,
  CheckCircle,
  Eye,
  Clock,
  Mail,
  Phone,
  X,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function UsersView({ users, onUpdateStatus, onResetPassword, onDeleteUser }) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordResetModal, setPasswordResetModal] = useState(null); // { user, tempPassword }

  const rolesList = [
    { key: 'all', label: 'All Users' },
    { key: 'org_leader', label: 'Org Leaders' },
    { key: 'fundraiser', label: 'Fundraisers' },
    { key: 'member', label: 'Members' },
    { key: 'customer', label: 'Customers' },
    { key: 'donor', label: 'Donors' },
    { key: 'manufacturer', label: 'Manufacturers' },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'org_leader'
        ? u.role === 'org_leader' || u.role === 'manager'
        : u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ? true : u.status === statusFilter;

    const matchesSearch =
      !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleResetPassword = async (u) => {
    if (confirm(`Reset password for ${u.fullName}?`)) {
      try {
        const res = await onResetPassword(u._id);
        setPasswordResetModal({ user: u, tempPassword: res.tempPassword || 'Sayrab@2026' });
      } catch (e) {
        alert(e.message || 'Password reset failed');
      }
    }
  };

  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
    if (confirm(`Are you sure you want to change ${u.fullName}'s status to ${nextStatus}?`)) {
      try {
        await onUpdateStatus(u._id, nextStatus);
        if (selectedUser?._id === u._id) {
          setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
        }
      } catch (e) {
        alert(e.message || 'Status update failed');
      }
    }
  };

  const handleDelete = async (u) => {
    if (confirm(`Permanent action: Delete user account for ${u.fullName}? This cannot be undone.`)) {
      try {
        await onDeleteUser(u._id);
        if (selectedUser?._id === u._id) setSelectedUser(null);
      } catch (e) {
        alert(e.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {rolesList.map((r) => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === r.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm shadow-2xs">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {u.fullName}
                          </div>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <Ban size={11} />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle size={11} />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {u.phone || 'No phone'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(u.createdAt || new Date())}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Profile & Audit Trail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'suspended'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                          title={u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile & Activity Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-md">
                  {selectedUser.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px] block">Role</span>
                  <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Account Status</span>
                  <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{selectedUser.status || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Phone Number</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">CNIC / ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedUser.cnic || 'N/A'}</span>
                </div>
              </div>

              {/* Activity History Log */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span>Activity History</span>
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  {selectedUser.activityLog && selectedUser.activityLog.length > 0 ? (
                    selectedUser.activityLog.map((log, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] shadow-2xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(log.createdAt || new Date())}</span>
                        </div>
                        {log.details && <p className="text-slate-500 mt-0.5">{log.details}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-slate-400 italic">No recent activity logged for this account.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleResetPassword(selectedUser)}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <KeyRound size={13} />
                <span>Reset Password</span>
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal Notification */}
      {passwordResetModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <KeyRound size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Temporary Password Generated
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Password for <strong>{passwordResetModal.user.fullName}</strong> has been reset. Share this secure temporary credential:
            </p>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-sm font-bold text-emerald-600 select-all mb-5">
              {passwordResetModal.tempPassword}
            </div>

            <button
              onClick={() => setPasswordResetModal(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-xs"
            >
              Done & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
