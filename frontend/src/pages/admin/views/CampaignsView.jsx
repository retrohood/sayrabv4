import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Search,
  Filter,
  Eye,
  Star,
  EyeOff,
  Pause,
  Play,
  Ban,
  ExternalLink,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function CampaignsView({ campaigns, onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [terminateModal, setTerminateModal] = useState(null); // campaign
  const [terminateReason, setTerminateReason] = useState('');

  const statuses = ['all', 'active', 'pending', 'completed', 'cancelled', 'terminated', 'paused'];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;
    const matchesSearch =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.organizer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.organization?.name?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleToggleFeatured = async (c) => {
    try {
      await onUpdateStatus(c._id, { isFeatured: !c.isFeatured });
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleToggleHide = async (c) => {
    try {
      await onUpdateStatus(c._id, { isHidden: !c.isHidden });
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleTogglePause = async (c) => {
    const nextStatus = c.status === 'paused' ? 'active' : 'paused';
    try {
      await onUpdateStatus(c._id, { status: nextStatus });
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleTerminate = async () => {
    if (!terminateReason.trim()) {
      alert('Please state the termination reason.');
      return;
    }
    try {
      await onUpdateStatus(terminateModal._id, {
        status: 'terminated',
        terminationReason: terminateReason,
        isHidden: true,
      });
      setTerminateModal(null);
      setTerminateReason('');
    } catch (e) {
      alert(e.message || 'Termination failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={11} />
            <span>Active</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCircle2 size={11} />
            <span>Completed</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Pause size={11} />
            <span>Paused</span>
          </span>
        );
      case 'terminated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <Ban size={11} />
            <span>Terminated</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s === 'all' ? 'All Campaigns' : s}
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
            placeholder="Search campaigns, org..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Campaign</th>
                <th className="py-3.5 px-4">Owner / Organization</th>
                <th className="py-3.5 px-4">Goal & Raised</th>
                <th className="py-3.5 px-4">Merch & Orders</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((c) => {
                  const raised = c.amountRaised || c.raisedAmount || 0;
                  const goal = c.fundingGoal || c.goalAmount || 1;
                  const pct = Math.round((raised / goal) * 100);

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                            {c.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{c.category}</span>
                          {c.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                          {c.isHidden && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-700 text-[9px] font-bold">
                              Hidden
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {c.organization?.name || c.organizer?.fullName || 'Sayrab Fundraiser'}
                        </div>
                        <p className="text-slate-400 text-[11px]">{c.organizer?.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(raised)}
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full my-1 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(pct, 100)}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {pct}% of {formatCurrency(goal)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {c.ordersCount || 0} orders
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {c.productsCount || 0} products listed
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(c.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Feature Star */}
                          <button
                            onClick={() => handleToggleFeatured(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.isFeatured
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                            }`}
                            title={c.isFeatured ? 'Unfeature' : 'Feature on homepage carousel'}
                          >
                            <Star size={15} fill={c.isFeatured ? 'currentColor' : 'none'} />
                          </button>

                          {/* Pause / Resume */}
                          <button
                            onClick={() => handleTogglePause(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.status === 'paused'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                            }`}
                            title={c.status === 'paused' ? 'Resume Campaign' : 'Pause Campaign'}
                          >
                            {c.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
                          </button>

                          {/* Hide / Unhide */}
                          <button
                            onClick={() => handleToggleHide(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.isHidden
                                ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={c.isHidden ? 'Unhide Campaign' : 'Hide from Public Search'}
                          >
                            {c.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          {/* Terminate Action */}
                          {c.status !== 'terminated' && (
                            <button
                              onClick={() => setTerminateModal(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Terminate Campaign"
                            >
                              <Ban size={15} />
                            </button>
                          )}

                          {/* Inspect Modal */}
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Inspect Details"
                          >
                            <BarChart2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No campaigns found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminate Confirmation Modal */}
      {terminateModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
              <AlertTriangle size={20} />
              <span>Terminate Campaign</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Campaign: <strong>{terminateModal.title}</strong>. Terminating will immediately halt donations and hide the campaign.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Termination (Required)
              </label>
              <textarea
                rows={3}
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                placeholder="Violation of terms, fraudulent documents, etc."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTerminateModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Inspection & Analytics Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCampaign.title}
                </h3>
                <p className="text-xs text-slate-400">{selectedCampaign.category}</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px] block">Funding Goal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedCampaign.fundingGoal || selectedCampaign.goalAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Raised</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(selectedCampaign.amountRaised || selectedCampaign.raisedAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Merchandise Revenue</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedCampaign.orderRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Donor Count</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedCampaign.donorCount || 0} supporters
                  </span>
                </div>
              </div>

              {selectedCampaign.terminationReason && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                  <span className="font-bold block">Termination Reason:</span>
                  <p>{selectedCampaign.terminationReason}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {selectedCampaign.slug && (
                <Link
                  to={`/campaigns/${selectedCampaign.slug}`}
                  target="_blank"
                  className="text-emerald-600 hover:underline font-semibold flex items-center gap-1 text-xs"
                >
                  <span>Open Public Campaign Page</span>
                  <ExternalLink size={13} />
                </Link>
              )}
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
