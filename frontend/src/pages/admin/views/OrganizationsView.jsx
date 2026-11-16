import { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  FileText,
  ExternalLink,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Send,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

export default function OrganizationsView({
  organizations = [],
  subFilter,
  setSubFilter,
  onReviewOrganization,
}) {
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { org, action: 'verify' | 'reject' | 'suspend' }
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Filter list
  const filteredOrgs = organizations.filter((org) => {
    const matchesFilter =
      subFilter === 'all' || !subFilter ? true : org.status === subFilter;
    const matchesSearch =
      !search ||
      org.name?.toLowerCase().includes(search.toLowerCase()) ||
      org.category?.toLowerCase().includes(search.toLowerCase()) ||
      org.contactEmail?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleActionConfirm = async () => {
    if (!actionModal) return;
    if (actionModal.action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason so the organization leader knows what to fix.');
      return;
    }

    setProcessing(true);
    try {
      const targetStatus =
        actionModal.action === 'verify'
          ? 'verified'
          : actionModal.action === 'reject'
          ? 'rejected'
          : 'suspended';

      await onReviewOrganization(actionModal.org._id, targetStatus, rejectionReason);
      setActionModal(null);
      setRejectionReason('');
      if (selectedOrg?._id === actionModal.org._id) {
        setSelectedOrg((prev) => ({ ...prev, status: targetStatus, rejectionReason }));
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
            <CheckCircle2 size={13} />
            <span>Verified</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} />
            <span>Rejected</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748b] border border-[#e5e9e3]">
            <Ban size={13} />
            <span>Suspended</span>
          </span>
        );
      default:
        return <span className="text-xs text-[#64748b]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Organizations' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'verified', label: 'Verified' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => {
            const isActive = subFilter === tab.id || (!subFilter && tab.id === 'all');
            return (
              <button
                key={tab.id}
                onClick={() => setSubFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                    : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, category..."
            className="w-full pl-9 pr-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] focus:border-[#89ca2e] focus:bg-white rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:outline-hidden transition-colors"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Organization</th>
                <th className="py-3.5 px-4">Leader / Contact</th>
                <th className="py-3.5 px-4">Registration #</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Financials</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr
                    key={org._id}
                    className="hover:bg-[#f7f9f5]/70 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover border border-[#e5e9e3]"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] font-bold flex items-center justify-center border border-[#89ca2e]/30">
                            <Building2 size={18} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#10182b] text-sm flex items-center gap-1.5">
                            <span>{org.name}</span>
                            {org.status === 'verified' && (
                              <ShieldCheck size={15} className="text-[#367c35]" title="Verified Organization" />
                            )}
                          </div>
                          <p className="text-[#64748b] text-[11px]">{org.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#10182b]">
                        {org.leader?.fullName || 'N/A'}
                      </div>
                      <p className="text-[#64748b] text-[11px]">{org.contactEmail || org.leader?.email}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-[#64748b]">
                      {org.registrationNumber || 'Not provided'}
                    </td>
                    <td className="py-4 px-4">{statusBadge(org.status)}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#10182b]">
                        {formatCurrency(org.totalRaised || 0)}
                      </div>
                      <p className="text-[11px] text-amber-700 font-medium">
                        Pending: {formatCurrency(org.pendingPayoutBalance || 0)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="px-3 py-1.5 rounded-lg border border-[#e5e9e3] text-[#10182b] hover:bg-[#f7f9f5] font-semibold flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <Eye size={13} className="text-[#64748b]" />
                          <span>Inspect</span>
                        </button>
                        {org.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setActionModal({ org, action: 'verify' })}
                              className="px-3 py-1.5 rounded-lg bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-[11px] shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setActionModal({ org, action: 'reject' })}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {org.status === 'verified' && (
                          <button
                            onClick={() => setActionModal({ org, action: 'suspend' })}
                            className="px-2.5 py-1.5 rounded-lg text-[#64748b] hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            title="Suspend organization"
                          >
                            Suspend
                          </button>
                        )}
                        {org.status === 'suspended' && (
                          <button
                            onClick={() => setActionModal({ org, action: 'verify' })}
                            className="px-2.5 py-1.5 rounded-lg text-[#367c35] hover:bg-[#89ca2e]/15 font-bold text-[11px] transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748b]">
                    No organizations found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Inspection Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-[#e5e9e3] mb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#89ca2e]/15 text-[#367c35] font-bold flex items-center justify-center text-xl border border-[#89ca2e]/30">
                  {selectedOrg.logo ? (
                    <img src={selectedOrg.logo} alt="" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#10182b] flex items-center gap-2">
                    <span>{selectedOrg.name}</span>
                    {statusBadge(selectedOrg.status)}
                  </h3>
                  <p className="text-xs text-[#64748b]">{selectedOrg.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1.5 text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 text-xs text-[#10182b]">
              {/* Description */}
              {selectedOrg.description && (
                <div>
                  <h4 className="font-bold text-[#10182b] mb-1">About Organization</h4>
                  <p className="leading-relaxed text-[#64748b]">{selectedOrg.description}</p>
                </div>
              )}

              {/* Rejection/Suspension Notice */}
              {selectedOrg.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold">Admin Note / Reason:</span>
                  <p className="mt-1">{selectedOrg.rejectionReason}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                <div>
                  <span className="text-[#64748b] block text-[11px]">Primary Leader</span>
                  <span className="font-semibold text-[#10182b]">
                    {selectedOrg.leader?.fullName || 'N/A'}
                  </span>
                  <span className="block text-[#64748b]">{selectedOrg.leader?.email}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[11px]">Contact Email & Phone</span>
                  <span className="font-semibold text-[#10182b]">{selectedOrg.contactEmail}</span>
                  <span className="block text-[#64748b]">{selectedOrg.phone || 'No phone provided'}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[11px]">Registration & Tax NTN</span>
                  <span className="font-semibold text-[#10182b] font-mono">
                    {selectedOrg.registrationNumber || 'None'}
                  </span>
                  <span className="block text-[#64748b] font-mono">Tax ID: {selectedOrg.taxId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[11px]">Address & Jurisdiction</span>
                  <span className="font-semibold text-[#10182b]">
                    {selectedOrg.address || 'Pakistan'}
                  </span>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-bold text-[#10182b] mb-2">Registered Bank Account for Payouts</h4>
                <div className="p-3.5 rounded-xl bg-[#89ca2e]/10 border border-[#89ca2e]/30 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#64748b] block">Bank Name</span>
                    <span className="font-semibold text-[#10182b]">{selectedOrg.bankDetails?.bankName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] block">Account Title</span>
                    <span className="font-semibold text-[#10182b]">{selectedOrg.bankDetails?.accountHolderName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] block">Account Number</span>
                    <span className="font-mono text-[#10182b]">{selectedOrg.bankDetails?.accountNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] block">IBAN Number</span>
                    <span className="font-mono text-[#10182b]">{selectedOrg.bankDetails?.iban || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Submitted Documents Review */}
              <div>
                <h4 className="font-bold text-[#10182b] mb-2">Submitted Verification Documents</h4>
                {selectedOrg.documents && selectedOrg.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrg.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#e5e9e3] hover:bg-[#f7f9f5] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={18} className="text-[#367c35]" />
                          <div>
                            <span className="font-semibold text-[#10182b]">{doc.title}</span>
                            <span className="text-[10px] text-[#64748b] block">
                              Uploaded {formatDate(doc.uploadedAt || new Date())}
                            </span>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#f7f9f5] border border-[#e5e9e3] hover:bg-[#89ca2e]/15 text-[#367c35] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect Doc</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748b] italic">No verification documents attached.</p>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#e5e9e3] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Close
              </button>
              {selectedOrg.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setActionModal({ org: selectedOrg, action: 'reject' });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    Reject with Reason
                  </button>
                  <button
                    onClick={() => {
                      setActionModal({ org: selectedOrg, action: 'verify' });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] text-[#10182b] hover:bg-[#7ab828] shadow-xs transition-colors"
                  >
                    Approve Verification
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Reason Input Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#10182b] capitalize mb-1">
              {actionModal.action === 'verify'
                ? 'Approve & Verify Organization'
                : actionModal.action === 'reject'
                ? 'Reject Verification Request'
                : 'Suspend Organization'}
            </h3>
            <p className="text-xs text-[#64748b] mb-4">
              Organization: <strong className="text-[#10182b]">{actionModal.org.name}</strong>
            </p>

            {actionModal.action === 'reject' && (
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-semibold text-[#10182b]">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain clearly what document was missing or failed verification..."
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] placeholder-[#64748b] focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            )}

            {actionModal.action === 'verify' && (
              <p className="text-xs text-[#10182b] mb-4 p-3 rounded-xl bg-[#89ca2e]/10 border border-[#89ca2e]/30">
                Approving this organization will grant it the <strong>Verified Badge</strong> across all linked campaigns and activate payout eligibility.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                disabled={processing}
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={processing}
                onClick={handleActionConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                  actionModal.action === 'verify'
                    ? 'bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b]'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
