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
      <div className="fixed inset-0 z-60 bg-[#10182b]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-5 border-b border-[#e5e9e3] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#10182b]">
                    Manufacturer Finalized Quotation Proposal
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 font-bold uppercase">
                    Ready for Approval
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Factory: <strong className="text-[#10182b]">{quotation.assignedManufacturer?.name || 'Assigned Manufacturing Partner'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition cursor-pointer border border-[#e5e9e3]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {actionSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Pricing Summary Banner */}
            <div className="p-5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-1">
                  Final Landed Unit Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-[#367c35]">
                    ${landedUnitUsd} USD
                  </span>
                  <span className="text-xs text-[#64748b] font-mono">/ finished unit</span>
                </div>
                <span className="text-[11px] text-[#64748b] block mt-1">
                  Order Run: <strong className="text-[#10182b]">{qty} unit(s)</strong> ({quotation.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'})
                </span>
              </div>

              <div className="sm:text-right p-3 rounded-xl bg-white border border-[#e5e9e3] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#64748b] block">Total Order Price</span>
                <span className="text-2xl font-black font-mono text-[#10182b]">
                  ${totalQuoteUsd} USD
                </span>
                <span className="text-[10px] text-[#367c35] font-mono font-bold block">
                  PKR {formatCurrency(prop.finalTotalPkr || quotation.calculation?.totals?.finalTotal || 0)} Total
                </span>
              </div>
            </div>

            {/* Delivery Timeline & Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#89ca2e]/10 text-[#367c35] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Delivery Timeline</span>
                  <p className="font-bold text-[#10182b] mt-0.5">
                    {prop.estimatedLeadDays || 14} Business Days
                  </p>
                  <span className="text-[11px] text-[#64748b]">From sample approval / order kickoff</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#89ca2e]/10 text-[#367c35] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Shipping Destination</span>
                  <p className="font-bold text-[#10182b] mt-0.5 truncate">
                    {quotation.shippingAddress?.city || 'Lahore'}, {quotation.shippingAddress?.country || 'Pakistan'}
                  </p>
                  <span className="text-[11px] text-[#64748b]">International express courier included</span>
                </div>
              </div>
            </div>

            {/* Itemized Price Breakdown (Margin baked in cleanly without internal factory margin line) */}
            <div className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e9e3]">
                <h4 className="font-bold text-[#10182b] uppercase tracking-wider text-xs flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#367c35]" />
                  Itemized Component Pricing Breakdown
                </h4>
                <span className="text-[10px] text-[#64748b]">Unit Landed Cost Basis</span>
              </div>

              <div className="divide-y divide-[#e5e9e3]">
                {itemPricing.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#10182b] block">{item.name}</span>
                      <span className="text-[10px] text-[#64748b] capitalize">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#10182b] block">
                        PKR {formatCurrency(item.unitCostPkr)}
                      </span>
                      <span className="text-[10px] text-[#64748b] font-mono">
                        ${(item.unitCostPkr / 280).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturer Notes */}
            {prop.customNotes && (
              <div className="p-4 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] space-y-1">
                <span className="text-[10px] text-[#367c35] font-bold uppercase tracking-wider block">
                  Factory Production & Material Notes
                </span>
                <p className="text-[#10182b] leading-relaxed italic">
                  "{prop.customNotes}"
                </p>
              </div>
            )}

            {/* Revision Request Form */}
            {showRevisionForm && (
              <form onSubmit={handleRequestRevision} className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                <h4 className="font-bold text-amber-900 text-xs">
                  Request Revision from Manufacturer
                </h4>
                <p className="text-[11px] text-amber-800/80">
                  Specify any changes regarding fabric GSM, colorway, stitch details, or pricing adjustments needed.
                </p>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g., Can we adjust the collar twill color to off-white and shorten lead time by 3 days?"
                  className="w-full p-3 rounded-xl bg-white border border-[#e5e9e3] text-xs text-[#10182b] placeholder-slate-400 focus:outline-none focus:border-[#89ca2e]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-slate-100"
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
          <div className="p-5 border-t border-[#e5e9e3] bg-white backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => setShowChat(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#367c35] border border-[#89ca2e]/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#367c35]" />
              <span>Chat with Factory</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!showRevisionForm && (
                <button
                  type="button"
                  onClick={() => setShowRevisionForm(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#10182b] border border-[#e5e9e3] font-bold text-xs cursor-pointer transition shadow-xs"
                >
                  Request Revision
                </button>
              )}

              <button
                type="button"
                disabled={accepting}
                onClick={handleAcceptProposal}
                className="px-6 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition flex-1 sm:flex-initial"
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
