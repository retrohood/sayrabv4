import { useState } from 'react';
import {
  Layers,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  Package,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Scissors,
  Check,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import api from '../api/client';

export default function FundraiserBulkOrdersView({
  quotations = [],
  onRefresh,
  onOpenChat,
  onOpenProposal,
  onNewQuotation,
}) {
  const [filter, setFilter] = useState('all');
  const [releasingQuoteId, setReleasingQuoteId] = useState(null);
  const [releaseSuccessMsg, setReleaseSuccessMsg] = useState('');
  const [releaseErrorMsg, setReleaseErrorMsg] = useState('');

  // Status mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted_to_admin':
      case 'submitted_for_review':
        return {
          label: 'Admin Reviewing',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          desc: 'Sayrab team is matching the optimal factory for your specifications',
        };
      case 'assigned_to_manufacturer':
      case 'manufacturer_reviewing':
        return {
          label: 'Factory Reviewing',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          desc: 'Assigned manufacturer is drafting itemized landed pricing & production timeline',
        };
      case 'manufacturer_proposal_sent':
        return {
          label: 'Proposal Received — Action Required',
          bg: 'bg-[#89ca2e]/15 text-[#367c35] border-[#89ca2e]/40 shadow-xs animate-pulse',
          dot: 'bg-[#367c35]',
          desc: 'Manufacturer submitted itemized proposal. Review & approve to start production.',
        };
      case 'accepted_by_fundraiser':
      case 'production_started':
        return {
          label: 'In Production',
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          dot: 'bg-cyan-500',
          desc: 'Proposal approved! Factory is currently manufacturing your order batch.',
        };
      case 'completed':
        return {
          label: 'Completed & Delivered',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          desc: 'Production batch and quality inspection completed.',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          desc: 'This quotation request was cancelled or declined.',
        };
      default:
        return {
          label: status ? status.replace(/_/g, ' ') : 'Draft',
          bg: 'bg-[#f7f9f5] text-[#64748b] border-[#e5e9e3]',
          dot: 'bg-slate-400',
          desc: 'Draft quotation',
        };
    }
  };

  // Milestone Progress Steps
  const getMilestoneSteps = (status) => {
    const steps = [
      { id: 1, label: 'Proposal Approved', done: false, current: false },
      { id: 2, label: 'Fabric Sourcing', done: false, current: false },
      { id: 3, label: 'Cutting & Assembly', done: false, current: false },
      { id: 4, label: 'Quality Check (QC)', done: false, current: false },
      { id: 5, label: 'Dispatched & Ready', done: false, current: false },
    ];

    if (status === 'accepted_by_fundraiser') {
      steps[0].done = true;
      steps[1].current = true;
    } else if (status === 'production_started') {
      steps[0].done = true;
      steps[1].done = true;
      steps[2].current = true;
    } else if (status === 'completed') {
      steps.forEach((s) => (s.done = true));
    }
    return steps;
  };

  // Filter calculations
  const filteredQuotations = quotations.filter((q) => {
    if (filter === 'proposals') return q.status === 'manufacturer_proposal_sent';
    if (filter === 'in_production')
      return q.status === 'production_started' || q.status === 'accepted_by_fundraiser';
    if (filter === 'under_review')
      return (
        q.status === 'assigned_to_manufacturer' ||
        q.status === 'submitted_to_admin' ||
        q.status === 'submitted_for_review' ||
        q.status === 'manufacturer_reviewing'
      );
    if (filter === 'completed') return q.status === 'completed';
    return true;
  });

  const countProposals = quotations.filter(
    (q) => q.status === 'manufacturer_proposal_sent'
  ).length;
  const countInProduction = quotations.filter(
    (q) => q.status === 'production_started' || q.status === 'accepted_by_fundraiser'
  ).length;
  const countCompleted = quotations.filter((q) => q.status === 'completed').length;

  // Handle milestone payment release
  const handleReleasePayment = async (quoteId) => {
    if (
      !window.confirm(
        'Are you sure you want to release the milestone payment to the manufacturer for this quotation order?'
      )
    ) {
      return;
    }
    setReleasingQuoteId(quoteId);
    setReleaseSuccessMsg('');
    setReleaseErrorMsg('');

    try {
      const res = await api.post(`/quotations/${quoteId}/release-payment`);
      setReleaseSuccessMsg(
        res.data?.message || 'Milestone payment has been released to manufacturer successfully!'
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to release milestone payment:', err);
      setReleaseErrorMsg(
        err.response?.data?.message || 'Failed to release milestone payment. Please try again.'
      );
    } finally {
      setReleasingQuoteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs flex items-center gap-3.5 hover:border-[#89ca2e]/50 transition-all">
          <div className="p-2.5 bg-[#89ca2e]/10 text-[#367c35] rounded-xl border border-[#89ca2e]/20">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
              Total Quotation Orders
            </p>
            <p className="text-xl font-black text-[#10182b] mt-0.5">{quotations.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs flex items-center gap-3.5 hover:border-amber-400/50 transition-all">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
              Proposals Awaiting Approval
            </p>
            <p className="text-xl font-black text-amber-700 mt-0.5">{countProposals}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs flex items-center gap-3.5 hover:border-cyan-400/50 transition-all">
          <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
            <Scissors size={22} />
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
              In Active Production
            </p>
            <p className="text-xl font-black text-cyan-700 mt-0.5">{countInProduction}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e9e3] shadow-xs flex items-center gap-3.5 hover:border-purple-400/50 transition-all">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
              Completed Orders
            </p>
            <p className="text-xl font-black text-purple-700 mt-0.5">{countCompleted}</p>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {releaseSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-[#367c35] shrink-0" />
          <span>{releaseSuccessMsg}</span>
        </div>
      )}

      {releaseErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{releaseErrorMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e9e3] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Orders', count: quotations.length },
            { id: 'proposals', label: 'Proposals Received', count: countProposals, alert: countProposals > 0 },
            { id: 'in_production', label: 'In Production', count: countInProduction },
            { id: 'under_review', label: 'Under Review' },
            { id: 'completed', label: 'Completed', count: countCompleted },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                  : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    filter === tab.id
                      ? 'bg-[#10182b] text-white font-bold'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-800 font-bold animate-pulse'
                      : 'bg-[#f7f9f5] text-[#64748b] border border-[#e5e9e3]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white hover:bg-[#f7f9f5] text-[#10182b] border border-[#e5e9e3] transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Refresh Quotations"
            >
              <RefreshCw size={14} className="text-[#64748b]" /> <span>Refresh</span>
            </button>
          )}
          {onNewQuotation && (
            <button
              onClick={onNewQuotation}
              className="px-3.5 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Layers size={14} /> <span>New Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white border border-[#e5e9e3] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#89ca2e]/15 border border-[#89ca2e]/30 flex items-center justify-center text-[#367c35] mx-auto mb-4">
            <Layers size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#10182b]">No bulk or sample orders found</h3>
          <p className="text-[#64748b] text-xs mt-2 leading-relaxed">
            {filter !== 'all'
              ? 'No quotation orders match the current filter selection.'
              : 'You have not submitted any bulk production or sample quotation requests yet.'}
          </p>
          {onNewQuotation && filter === 'all' && (
            <button
              onClick={onNewQuotation}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#89ca2e] text-white font-bold text-xs hover:bg-[#78b327] transition-colors cursor-pointer shadow-xs"
            >
              <Layers size={14} /> Create Instant Quotation Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuotations.map((quote) => {
            const badge = getStatusBadge(quote.status);
            const spec = quote.designSpec || {};
            const calc = quote.calculation || {};
            const prop = quote.manufacturerProposal || {};
            const mfg = quote.assignedManufacturer;
            const isProposalReady = quote.status === 'manufacturer_proposal_sent';
            const isInProduction =
              quote.status === 'accepted_by_fundraiser' ||
              quote.status === 'production_started' ||
              quote.status === 'completed';
            const unitPrice =
              Number(prop.landedUnitUsd) ||
              Number(calc?.totals?.landedUnitUsd) ||
              Number(calc?.landedUnitUsd) ||
              45;
            const quantity = Number(quote.quantity) || Number(spec.quantity) || 1;
            const isSample = quote.orderType === 'sample' || quantity === 1;
            const totalCost = (unitPrice * quantity).toFixed(2);
            const milestoneSteps = getMilestoneSteps(quote.status);

            return (
              <div
                key={quote._id}
                className="bg-white rounded-2xl border border-[#e5e9e3] shadow-xs overflow-hidden hover:border-[#89ca2e]/50 transition-all flex flex-col"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 border-b border-[#e5e9e3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f7f9f5]/70">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono text-[#64748b]">
                      ID: #{quote._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-[#64748b] flex items-center gap-1">
                      <Calendar size={13} /> {formatDate(quote.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                        isSample
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}
                    >
                      {isSample ? 'Sample Order (1 Unit)' : `Bulk Production (${quantity} Units)`}
                    </span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
                  {/* Left Column: Tech Pack Preview & Garment Details */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-start gap-3.5">
                      {quote.techPackImage ? (
                        <img
                          src={quote.techPackImage}
                          alt="Tech Pack"
                          className="w-20 h-20 rounded-xl object-cover bg-[#f7f9f5] border border-[#e5e9e3] shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-center justify-center text-[#64748b] shrink-0">
                          <Package size={28} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-[#10182b] line-clamp-1">
                          {spec.styleName || quote.projectName || 'Custom Garment Spec'}
                        </h4>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {spec.garmentType || 'Garment'} • {spec.fabricComposition || 'Standard Fabric'}
                        </p>
                        <p className="text-[11px] text-[#64748b] mt-1">
                          Weight: {spec.gsm || 220} GSM
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#64748b]">
                        <span>Landed Price / Unit:</span>
                        <strong className="text-[#10182b]">${unitPrice.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-[#64748b]">
                        <span>Quantity Batch:</span>
                        <strong className="text-[#10182b]">{quantity} units</strong>
                      </div>
                      <div className="flex justify-between border-t border-[#e5e9e3] pt-1.5 text-[#10182b] font-bold">
                        <span>Total Est. Investment:</span>
                        <strong className="text-[#367c35] font-mono text-sm">${totalCost}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Manufacturer Assignment & Production Status */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] mb-2 flex items-center gap-1.5">
                        <Building2 size={13} className="text-cyan-600" /> Assigned Manufacturer
                      </p>
                      {mfg ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#10182b]">
                              {mfg.companyName || mfg.name}
                            </span>
                            <span className="text-[10px] font-bold text-[#367c35] bg-[#89ca2e]/15 px-2 py-0.5 rounded border border-[#89ca2e]/30">
                              Verified Partner
                            </span>
                          </div>
                          <p className="text-xs text-[#64748b]">
                            {mfg.email} {mfg.phone ? `• ${mfg.phone}` : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-[#64748b] flex items-center gap-2">
                          <Clock size={14} className="text-amber-500 shrink-0" />
                          <span>Sayrab Operations team is currently allocating the best certified factory.</span>
                        </div>
                      )}
                    </div>

                    {/* Milestone Stepper (if in production) */}
                    {isInProduction ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-1.5">
                          <Scissors size={13} className="text-cyan-600" /> Manufacturing Milestones
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {milestoneSteps.map((step) => (
                            <div
                              key={step.id}
                              className={`p-2 rounded-lg border text-center transition-all ${
                                step.done
                                  ? 'bg-[#89ca2e]/15 border-[#89ca2e]/30 text-[#367c35]'
                                  : step.current
                                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800 animate-pulse'
                                  : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b]'
                              }`}
                            >
                              <div className="text-[10px] font-black">{step.id}</div>
                              <div className="text-[9px] font-semibold leading-tight mt-0.5 truncate">
                                {step.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-xs text-[#64748b] leading-relaxed">
                        <span className="text-[#10182b] font-semibold">Current State: </span>
                        {badge.desc}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions (Approve Proposal, Chat, Release Payment) */}
                  <div className="lg:col-span-3 flex flex-col justify-between gap-3">
                    <div className="space-y-2.5">
                      {/* Review & Approve Proposal Button */}
                      {isProposalReady && onOpenProposal && (
                        <button
                          onClick={() => onOpenProposal(quote)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileText size={15} /> Review & Approve Proposal
                        </button>
                      )}

                      {/* Chat with Manufacturer Button */}
                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat(quote)}
                          disabled={!mfg}
                          className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            mfg
                              ? 'bg-[#f7f9f5] hover:bg-white border-[#e5e9e3] hover:border-[#89ca2e] text-[#10182b] shadow-xs'
                              : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] cursor-not-allowed opacity-60'
                          }`}
                        >
                          <MessageSquare size={15} className={mfg ? 'text-cyan-600' : 'text-[#64748b]'} />
                          {mfg ? 'Chat with Factory' : 'Chat (Awaiting Factory)'}
                        </button>
                      )}

                      {/* Release Milestone Payment */}
                      {isInProduction && (
                        <div>
                          {quote.payoutStatus === 'milestone_released' ||
                          quote.payoutStatus === 'completed' ? (
                            <div className="p-2.5 rounded-xl bg-[#89ca2e]/15 border border-[#89ca2e]/30 text-[#367c35] text-xs font-bold flex items-center justify-center gap-2">
                              <CheckCircle2 size={14} /> Milestone Payment Released
                            </div>
                          ) : (
                            <button
                              onClick={() => handleReleasePayment(quote._id)}
                              disabled={releasingQuoteId === quote._id}
                              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <CreditCard size={15} />
                              {releasingQuoteId === quote._id
                                ? 'Releasing Payout...'
                                : 'Release Milestone Payout'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-[#64748b] text-center">
                      Protected by Sayrab Escrow Guarantee
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
