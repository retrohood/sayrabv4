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
  RefreshCw,
  Check,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function CampaignsView({ campaigns = [], onUpdateStatus, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [terminateModal, setTerminateModal] = useState(null); // campaign
  const [terminateReason, setTerminateReason] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statuses = ['all', 'pending', 'active', 'completed', 'paused', 'terminated'];

  const filteredCampaigns = campaigns.filter((c) => {
    const isPendingVerification =
      c.status === 'pending' ||
      c.verificationStatus === 'pending_verification' ||
      c.verificationStatus === 'pending' ||
      c.verificationStatus === 'under_review';

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? isPendingVerification
        : c.status === statusFilter;

    const matchesSearch =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.organizer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.organization?.name?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleManualRefresh = async () => {
    if (!onRefresh) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleApproveVerification = async (c) => {
    try {
      await onUpdateStatus(c._id, {
        verificationStatus: 'verified',
        status: c.status === 'pending' ? 'active' : c.status,
      });
      if (selectedCampaign && selectedCampaign._id === c._id) {
        setSelectedCampaign((prev) => ({ ...prev, verificationStatus: 'verified' }));
      }
    } catch (e) {
      alert(e.message || 'Verification approval failed');
    }
  };

  const handleRejectVerification = async () => {
    if (!rejectReason.trim()) {
      alert('Please state the rejection reason.');
      return;
    }
    try {
      await onUpdateStatus(rejectModal._id, {
        verificationStatus: 'rejected',
        rejectionReason: rejectReason,
      });
      if (selectedCampaign && selectedCampaign._id === rejectModal._id) {
        setSelectedCampaign((prev) => ({
          ...prev,
          verificationStatus: 'rejected',
          rejectionReason: rejectReason,
        }));
      }
      setRejectModal(null);
      setRejectReason('');
    } catch (e) {
      alert(e.message || 'Verification rejection failed');
    }
  };

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
            <CheckCircle2 size={11} />
            <span>Active</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={11} />
            <span>Completed</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Pause size={11} />
            <span>Paused</span>
          </span>
        );
      case 'terminated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban size={11} />
            <span>Terminated</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f7f9f5] text-[#64748b] border border-[#e5e9e3] capitalize">
            {status}
          </span>
        );
    }
  };

  const getVerificationBadge = (verificationStatus) => {
    switch (verificationStatus) {
      case 'verified':
      case 'emergency_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
            <ShieldCheck size={11} />
            <span>Verified</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert size={11} />
            <span>Rejected</span>
          </span>
        );
      case 'pending_verification':
      case 'pending':
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} />
            <span>Verification Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  isActive
                    ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                    : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                }`}
              >
                {s === 'all' ? 'All Campaigns' : s}
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {onRefresh && (
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 bg-[#f7f9f5] border border-[#e5e9e3] hover:border-[#89ca2e] hover:bg-white text-[#10182b] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              title="Refresh campaigns list"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#367c35]' : 'text-[#64748b]'} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns, org..."
              className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] focus:border-[#89ca2e] focus:bg-white rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:outline-hidden transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Campaign</th>
                <th className="py-3.5 px-4">Owner / Organization</th>
                <th className="py-3.5 px-4">Goal & Raised</th>
                <th className="py-3.5 px-4">Merch & Orders</th>
                <th className="py-3.5 px-4">Status & Verification</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((c) => {
                  const raised = c.amountRaised || c.raisedAmount || 0;
                  const goal = c.fundingGoal || c.goalAmount || 1;
                  const pct = Math.round((raised / goal) * 100);

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-[#f7f9f5]/70 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-[#10182b] text-xs leading-snug">
                            {c.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#64748b]">{c.category}</span>
                          {c.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                          {c.isHidden && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-slate-200 text-[#64748b] text-[9px] font-bold">
                              Hidden
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#10182b] text-xs">
                          {c.organization?.name || c.organizer?.fullName || 'Sayrab Fundraiser'}
                        </div>
                        <p className="text-[#64748b] text-[11px]">{c.organizer?.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#10182b]">
                          {formatCurrency(raised)}
                        </div>
                        <div className="w-24 h-1.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-full my-1 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(pct, 100)}%` }}
                            className="h-full bg-[#89ca2e] rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-[#64748b]">
                          {pct}% of {formatCurrency(goal)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#10182b]">
                          {c.ordersCount || 0} orders
                        </div>
                        <span className="text-[10px] text-[#64748b]">
                          {c.productsCount || 0} products listed
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(c.status)}
                          {getVerificationBadge(c.verificationStatus)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Verify Button */}
                          {c.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => handleApproveVerification(c)}
                              className="p-1.5 rounded-lg text-[#367c35] hover:bg-[#89ca2e]/20 transition-colors"
                              title="Verify / Approve Campaign"
                            >
                              <ShieldCheck size={15} />
                            </button>
                          )}

                          {/* Quick Reject Verification Button */}
                          {c.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => setRejectModal(c)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Reject Campaign Verification"
                            >
                              <ShieldAlert size={15} />
                            </button>
                          )}

                          {/* Feature Star */}
                          <button
                            onClick={() => handleToggleFeatured(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.isFeatured
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-[#64748b] hover:text-amber-500 hover:bg-[#f7f9f5]'
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
                                ? 'text-[#367c35] hover:bg-[#89ca2e]/15'
                                : 'text-[#64748b] hover:text-amber-700 hover:bg-amber-50'
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
                                ? 'text-[#10182b] bg-[#e5e9e3]'
                                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                            }`}
                            title={c.isHidden ? 'Unhide Campaign' : 'Hide from Public Search'}
                          >
                            {c.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          {/* Terminate Action */}
                          {c.status !== 'terminated' && (
                            <button
                              onClick={() => setTerminateModal(c)}
                              className="p-1.5 rounded-lg text-[#64748b] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Terminate Campaign"
                            >
                              <Ban size={15} />
                            </button>
                          )}

                          {/* Inspect Modal */}
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="p-1.5 rounded-lg text-[#367c35] hover:bg-[#89ca2e]/15 transition-colors"
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
                  <td colSpan={6} className="py-12 text-center text-[#64748b]">
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
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
              <AlertTriangle size={20} />
              <span>Terminate Campaign</span>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Campaign: <strong className="text-[#10182b]">{terminateModal.title}</strong>. Terminating will immediately halt donations and hide the campaign.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-[#10182b]">
                Reason for Termination (Required)
              </label>
              <textarea
                rows={3}
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                placeholder="Violation of terms, fraudulent documents, etc."
                className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTerminateModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Verification Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
              <ShieldAlert size={20} />
              <span>Reject Campaign Verification</span>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Campaign: <strong className="text-[#10182b]">{rejectModal.title}</strong>. Rejecting verification will keep fund withdrawals restricted. The organizer will be notified.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-[#10182b]">
                Rejection Reason (Required)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Incomplete documentation, missing NGO tax registration, unverifiable beneficiary, etc."
                className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectVerification}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Inspection & Analytics Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-[#e5e9e3] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#10182b]">
                  {selectedCampaign.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#64748b]">{selectedCampaign.category}</span>
                  {getStatusBadge(selectedCampaign.status)}
                  {getVerificationBadge(selectedCampaign.verificationStatus)}
                </div>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                <div>
                  <span className="text-[#64748b] text-[10px] block">Funding Goal</span>
                  <span className="font-bold text-[#10182b]">
                    {formatCurrency(selectedCampaign.fundingGoal || selectedCampaign.goalAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] text-[10px] block">Total Raised</span>
                  <span className="font-bold text-[#367c35]">
                    {formatCurrency(selectedCampaign.amountRaised || selectedCampaign.raisedAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] text-[10px] block">Merchandise Revenue</span>
                  <span className="font-bold text-[#10182b]">
                    {formatCurrency(selectedCampaign.orderRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] text-[10px] block">Donor Count</span>
                  <span className="font-bold text-[#10182b]">
                    {selectedCampaign.donorCount || 0} supporters
                  </span>
                </div>
              </div>

              {selectedCampaign.verificationStatus !== 'verified' && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-amber-900 block text-xs">Verification Action Required</span>
                    <p className="text-[11px] text-amber-800">
                      Unverified campaigns can accept donations, but withdrawal of funds is strictly restricted until approved.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveVerification(selectedCampaign)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#367c35] text-white hover:bg-[#367c35]/90 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <ShieldCheck size={13} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectModal(selectedCampaign)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <ShieldAlert size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedCampaign.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block">Verification Rejection Reason:</span>
                  <p>{selectedCampaign.rejectionReason}</p>
                </div>
              )}

              {selectedCampaign.terminationReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block">Termination Reason:</span>
                  <p>{selectedCampaign.terminationReason}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#e5e9e3] flex items-center justify-between">
              <Link
                to={`/campaigns/${selectedCampaign.slug || selectedCampaign._id}`}
                target="_blank"
                className="text-[#367c35] hover:underline font-semibold flex items-center gap-1 text-xs"
              >
                <span>Open Public Campaign Page</span>
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] hover:bg-[#e5e9e3] transition-colors"
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
