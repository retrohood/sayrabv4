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
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          desc: 'Sayrab team is matching the optimal factory for your specifications',
        };
      case 'assigned_to_manufacturer':
      case 'manufacturer_reviewing':
        return {
          label: 'Factory Reviewing',
          bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
          desc: 'Assigned manufacturer is drafting itemized landed pricing & production timeline',
        };
      case 'manufacturer_proposal_sent':
        return {
          label: 'Proposal Received — Action Required',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
          dot: 'bg-emerald-400',
          desc: 'Manufacturer submitted itemized proposal. Review & approve to start production.',
        };
      case 'accepted_by_fundraiser':
      case 'production_started':
        return {
          label: 'In Production',
          bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400',
          desc: 'Proposal approved! Factory is currently manufacturing your order batch.',
        };
      case 'completed':
        return {
          label: 'Completed & Delivered',
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
          desc: 'Production batch and quality inspection completed.',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          desc: 'This quotation request was cancelled or declined.',
        };
      default:
        return {
          label: status ? status.replace(/_/g, ' ') : 'Draft',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
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
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-emerald-500/40 transition-all">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Total Quotation Orders
            </p>
            <p className="text-xl font-black text-white mt-0.5">{quotations.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-amber-500/40 transition-all">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Proposals Awaiting Approval
            </p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{countProposals}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-cyan-500/40 transition-all">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Scissors size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              In Active Production
            </p>
            <p className="text-xl font-black text-cyan-300 mt-0.5">{countInProduction}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-purple-500/40 transition-all">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Completed Orders
            </p>
            <p className="text-xl font-black text-purple-300 mt-0.5">{countCompleted}</p>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {releaseSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{releaseSuccessMsg}</span>
        </div>
      )}

      {releaseErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span>{releaseErrorMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tab.alert
                      ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                      : 'bg-slate-800 text-slate-300'
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
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Quotations"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          )}
          {onNewQuotation && (
            <button
              onClick={onNewQuotation}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Layers size={14} /> New Quotation
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <Layers size={28} />
          </div>
          <h3 className="text-lg font-bold text-white">No bulk or sample orders found</h3>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            {filter !== 'all'
              ? 'No quotation orders match the current filter selection.'
              : 'You have not submitted any bulk production or sample quotation requests yet.'}
          </p>
          {onNewQuotation && filter === 'all' && (
            <button
              onClick={onNewQuotation}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
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
                className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-all flex flex-col"
              >
                {/* Header Row */}
                <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ID: #{quote._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={13} /> {formatDate(quote.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                        isSample
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      }`}
                    >
                      {isSample ? 'Sample Order (1 Unit)' : `Bulk Production (${quantity} Units)`}
                    </span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Tech Pack Preview & Garment Details */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-start gap-3.5">
                      {quote.techPackImage ? (
                        <img
                          src={quote.techPackImage}
                          alt="Tech Pack"
                          className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                          <Package size={28} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-white line-clamp-1">
                          {spec.styleName || quote.projectName || 'Custom Garment Spec'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {spec.garmentType || 'Garment'} • {spec.fabricComposition || 'Standard Fabric'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Weight: {spec.gsm || 220} GSM
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Landed Price / Unit:</span>
                        <strong className="text-white">${unitPrice.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Quantity Batch:</span>
                        <strong className="text-white">{quantity} units</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1.5 text-slate-300 font-bold">
                        <span>Total Est. Investment:</span>
                        <strong className="text-emerald-400 font-mono text-sm">${totalCost}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Manufacturer Assignment & Production Status */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Building2 size={13} className="text-cyan-400" /> Assigned Manufacturer
                      </p>
                      {mfg ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">
                              {mfg.companyName || mfg.name}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Verified Partner
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {mfg.email} {mfg.phone ? `• ${mfg.phone}` : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Clock size={14} className="text-amber-400 shrink-0" />
                          <span>Sayrab Operations team is currently allocating the best certified factory.</span>
                        </div>
                      )}
                    </div>

                    {/* Milestone Stepper (if in production) */}
                    {isInProduction ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Scissors size={13} className="text-cyan-400" /> Manufacturing Milestones
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {milestoneSteps.map((step) => (
                            <div
                              key={step.id}
                              className={`p-2 rounded-lg border text-center transition-all ${
                                step.done
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : step.current
                                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 animate-pulse'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
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
                      <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
                        <span className="text-slate-300 font-semibold">Current State: </span>
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
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
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
                              ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-white hover:border-cyan-500/40 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <MessageSquare size={15} className={mfg ? 'text-cyan-400' : 'text-slate-600'} />
                          {mfg ? 'Chat with Factory' : 'Chat (Awaiting Factory)'}
                        </button>
                      )}

                      {/* Release Milestone Payment */}
                      {isInProduction && (
                        <div>
                          {quote.payoutStatus === 'milestone_released' ||
                          quote.payoutStatus === 'completed' ? (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                              <CheckCircle2 size={14} /> Milestone Payment Released
                            </div>
                          ) : (
                            <button
                              onClick={() => handleReleasePayment(quote._id)}
                              disabled={releasingQuoteId === quote._id}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

                    <div className="text-[11px] text-slate-500 text-center">
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
