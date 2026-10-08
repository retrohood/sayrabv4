import { useState } from 'react';
import {
  CheckCircle2,
  X,
  Clock,
  Truck,
  MessageSquare,
  AlertCircle,
  Package,
  Layers,
  Scissors,
  DollarSign,
  ShieldCheck,
  Send,
  Factory,
  RefreshCw,
  FileText,
} from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/format';
import QuotationChatModal from './QuotationChatModal';

export default function FundraiserProposalModal({ quotation, onClose, onUpdated }) {
  const [accepting, setAccepting] = useState(false);
  const [requestingRevision, setRequestingRevision] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  if (!quotation) return null;

  const prop = quotation.manufacturerProposal || {};
  const qty = Number(quotation.quantity) || 1;
  const landedUnitUsd =
    Number(prop.landedUnitUsd) ||
    Number(quotation.calculation?.totals?.landedUnitUsd) ||
    45;
  const totalQuoteUsd = (landedUnitUsd * qty).toFixed(2);
  const marginMultiplier = 1 + (Number(prop.marginPercent) || 30) / 100;

  // Baked-in itemized pricing (Margin baked into item costs as required)
  const itemPricing = Array.isArray(prop.itemPricing) && prop.itemPricing.length > 0
    ? prop.itemPricing.map((item) => ({
        ...item,
        unitCostPkr: Math.round(Number(item.unitCostPkr || 0) * marginMultiplier),
      }))
    : [
        {
          name: 'Main Shell & Body Fabric (Knitted/Woven Spec)',
          category: 'Fabric',
          unitCostPkr: Math.round((Number(prop.costBreakdown?.fabricCost) || 1400) * marginMultiplier),
        },
        {
          name: 'Garment CMT Stitching & Construction',
          category: 'Tailoring',
          unitCostPkr: Math.round((Number(prop.costBreakdown?.stitchingCost) || 1200) * marginMultiplier),
        },
        {
          name: 'Embellishments, Embroidery & Screenprints',
          category: 'Decorations',
          unitCostPkr: Math.round((Number(prop.costBreakdown?.embroideryCost) || 1800) * marginMultiplier),
        },
        {
          name: 'Ribbed Cuffs, Twill, Buttons & Custom Labels',
          category: 'Trims',
          unitCostPkr: Math.round((Number(prop.costBreakdown?.trimsCost) || 350) * marginMultiplier),
        },
        {
          name: 'International Air Courier Logistics to Destination',
          category: 'Logistics',
          unitCostPkr: Math.round((Number(prop.costBreakdown?.shippingCost) || 800) * marginMultiplier),
        },
      ];

  const handleAcceptProposal = async () => {
    try {
      setAccepting(true);
      setActionError('');
      setActionSuccess('');

      const res = await api.post(`/quotations/${quotation._id}/accept-proposal`);
      setActionSuccess('Proposal accepted! Production order initiated and assigned to manufacturer.');

      if (onUpdated) onUpdated(res.data.quotation || res.data);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Accept proposal failed:', err);
      setActionError(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setAccepting(false);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      alert('Please specify the revisions or changes you would like the factory to make.');
      return;
    }

    try {
      setRequestingRevision(true);
      setActionError('');
      setActionSuccess('');

      const res = await api.post(`/quotations/${quotation._id}/request-revision`, {
        revisionNotes,
      });

      setActionSuccess('Revision request sent to the manufacturing partner.');
      if (onUpdated) onUpdated(res.data);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Revision request failed:', err);
      setActionError(err.response?.data?.message || 'Failed to send revision request');
    } finally {
      setRequestingRevision(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Manufacturer Finalized Quotation Proposal
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    Ready for Approval
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Factory: <strong className="text-white">{quotation.assignedManufacturer?.name || 'Assigned Manufacturing Partner'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {actionSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Pricing Summary Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-950/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Final Landed Unit Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    ${landedUnitUsd} USD
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ finished unit</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Order Run: <strong className="text-white">{qty} unit(s)</strong> ({quotation.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'})
                </span>
              </div>

              <div className="sm:text-right p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Order Price</span>
                <span className="text-2xl font-black font-mono text-white">
                  ${totalQuoteUsd} USD
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  PKR {formatCurrency(prop.finalTotalPkr || quotation.calculation?.totals?.finalTotal || 0)} Total
                </span>
              </div>
            </div>

            {/* Delivery Timeline & Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Timeline</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {prop.estimatedLeadDays || 14} Business Days
                  </p>
                  <span className="text-[11px] text-slate-400">From sample approval / order kickoff</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Shipping Destination</span>
                  <p className="font-bold text-slate-200 mt-0.5 truncate">
                    {quotation.shippingAddress?.city || 'Lahore'}, {quotation.shippingAddress?.country || 'Pakistan'}
                  </p>
                  <span className="text-[11px] text-slate-400">International express courier included</span>
                </div>
              </div>
            </div>

            {/* Itemized Price Breakdown (Margin baked in cleanly without internal factory margin line) */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Itemized Component Pricing Breakdown
                </h4>
                <span className="text-[10px] text-slate-400">Unit Landed Cost Basis</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {itemPricing.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-200 block">
                        PKR {formatCurrency(item.unitCostPkr)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ${(item.unitCostPkr / 280).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturer Notes */}
            {prop.customNotes && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  Factory Production & Material Notes
                </span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{prop.customNotes}"
                </p>
              </div>
            )}

            {/* Revision Request Form */}
            {showRevisionForm && (
              <form onSubmit={handleRequestRevision} className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3 animate-in fade-in">
                <h4 className="font-bold text-amber-300 text-xs">
                  Request Revision from Manufacturer
                </h4>
                <p className="text-[11px] text-slate-400">
                  Specify any changes regarding fabric GSM, colorway, stitch details, or pricing adjustments needed.
                </p>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g., Can we adjust the collar twill color to off-white and shorten lead time by 3 days?"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestingRevision}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
                  >
                    {requestingRevision ? 'Sending Request...' : 'Submit Revision Request'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => setShowChat(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Chat with Factory</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!showRevisionForm && (
                <button
                  type="button"
                  onClick={() => setShowRevisionForm(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs cursor-pointer transition"
                >
                  Request Revision
                </button>
              )}

              <button
                type="button"
                disabled={accepting}
                onClick={handleAcceptProposal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition flex-1 sm:flex-initial"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{accepting ? 'Starting Production...' : 'Accept Proposal & Start Production'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChat && (
        <QuotationChatModal quotation={quotation} onClose={() => setShowChat(false)} />
      )}
    </>
  );
}
