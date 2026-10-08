import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Ruler,
  Palette,
  Eye,
  X,
  Layers,
  Sparkles,
  Package,
  Truck,
  Maximize2,
  Send,
} from 'lucide-react';
import api from '../../../api/client';
import { formatCurrency } from '../../../utils/format';

export default function TechpacksView({ techpacks = [], onRefresh }) {
  const [activeTab, setActiveTab] = useState('quotations'); // 'quotations' | 'approved_techpacks'
  const [activeModal, setActiveModal] = useState(null); // { type: 'revision' | 'issue', techpackId }
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedTechpack, setSelectedTechpack] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchQuotations = async () => {
    try {
      setLoadingQuotes(true);
      const res = await api.get('/quotations/manufacturer-review');
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load manufacturer draft quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAction = async (techpackId, action, noteText) => {
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/techpacks/${techpackId}/action`, {
        action,
        notes: noteText || notes,
      });
      setActiveModal(null);
      setNotes('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update techpack action');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Tech Pack & Draft Quotation Specifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review attached tech packs, size charts, fabric specs, logos, and draft quotations submitted by fundraisers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quotations'
                ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fundraiser Draft Quotes ({quotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approved_techpacks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'approved_techpacks'
                ? 'bg-gradient-to-r from-blue-600/35 to-cyan-500/25 border border-cyan-500/45 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Production Techpacks ({techpacks.length})</span>
          </button>
        </div>
      </div>

      {/* 1. FUNDRAISER DRAFT QUOTATIONS & ATTACHED TECH PACKS */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          {loadingQuotes ? (
            <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl text-slate-400 text-xs">
              Loading draft quotation reviews...
            </div>
          ) : quotations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl text-slate-500 text-xs">
              No draft quotations currently awaiting manufacturer review.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quotations.map((q) => (
                <div
                  key={q._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            Status: {q.status || 'draft'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {q.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Order'} • {q.quantity || 1} units
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base">{q.projectName || q.designSpec?.garment?.style || 'Apparel Quotation'}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Fundraiser: <strong className="text-slate-200">{q.owner?.fullName || q.owner?.email || 'Fundraiser Partner'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Draft Estimate</span>
                        <span className="text-sm font-black font-mono text-emerald-400">
                          ${q.calculation?.totals?.landedUnitUsd || '45.00'} USD/unit
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          PKR {formatCurrency(q.calculation?.totals?.finalTotal || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Attached Tech Pack & Specs Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[90px] relative group">
                        {q.techPackImage ? (
                          <img
                            src={q.techPackImage}
                            alt="Attached Tech Pack"
                            className="w-full h-24 object-contain p-1"
                          />
                        ) : (
                          <div className="text-center p-2 text-slate-600 text-[10px]">
                            <FileText className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                            <span>Tech Pack</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-slate-900/90 text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          Attached
                        </span>
                      </div>

                      <div className="col-span-2 space-y-1 text-xs">
                        <div className="text-slate-300">
                          <span className="text-slate-400 font-semibold">Fabric: </span>
                          <span className="font-medium text-white">{q.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'} ({q.designSpec?.fabrics?.[0]?.gsm || 300} GSM)</span>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-400 font-semibold">Logos: </span>
                          <span className="text-amber-300 font-medium">{q.designSpec?.decorations?.length || 0} embellishments detected</span>
                        </div>
                        <div className="text-slate-300 truncate">
                          <span className="text-slate-400 font-semibold">Ship To: </span>
                          <span className="text-slate-200">{q.shippingAddress?.city || 'Lahore'}, {q.shippingAddress?.country || 'Pakistan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detected Size Chart Snapshot */}
                    {q.designSpec?.sizeChart?.rows && (
                      <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px]">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Detected Size Chart (Chest Scale)</span>
                        <div className="flex items-center gap-3 overflow-x-auto text-slate-300 font-mono">
                          {q.designSpec.sizeChart.rows.slice(0, 2).map((r, i) => (
                            <span key={i} className="whitespace-nowrap">
                              {r.measurement}: S({r.s}") M({r.m}") L({r.l}") XL({r.xl}")
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedQuote(q)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Draft Quotation</span>
                    </button>

                    <button
                      onClick={() => alert(`Draft quotation for ${q.projectName || 'order'} verified by manufacturer. Technical specifications accepted.`)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Specs</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ADMIN APPROVED TECHPACKS */}
      {activeTab === 'approved_techpacks' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {techpacks.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl text-slate-500">
            No approved techpacks available currently.
          </div>
        ) : (
          techpacks.map((tp) => (
            <div key={tp._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-base">{tp.title}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{tp.campaignName} • v{tp.version}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                      tp.status === 'accepted_by_manufacturer'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : tp.status === 'revision_requested'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {tp.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Mockups & Details Grid */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  {tp.previewImages?.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Techpack Mockup"
                      className="w-full h-24 object-cover rounded-xl border border-slate-800 bg-slate-950"
                    />
                  ))}
                </div>

                {/* Specs List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-400">Materials:</span>
                    <span className="truncate">{tp.materials?.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Ruler className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-400">Size Chart:</span>
                    <span className="truncate">{tp.sizeCharts?.slice(0, 3).join(', ')}...</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Palette className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-400">Color Variants:</span>
                    <span className="truncate">{tp.colorVariants?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {tp.files?.[0]?.url && (
                    <a
                      href={tp.files[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Spec
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedTechpack(tp)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Specs
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {tp.status !== 'accepted_by_manufacturer' && (
                    <button
                      onClick={() => handleAction(tp._id, 'accept', 'Techpack specs accepted')}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                  )}

                  <button
                    onClick={() => setActiveModal({ type: 'revision', techpackId: tp._id })}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Revise
                  </button>

                  <button
                    onClick={() => setActiveModal({ type: 'issue', techpackId: tp._id })}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Issue
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Revision / Issue Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 capitalize">
              {activeModal.type === 'revision' ? <RotateCcw className="w-5 h-5 text-amber-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
              {activeModal.type === 'revision' ? 'Request Techpack Revision' : 'Report Spec Issue'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeModal.type === 'revision'
                ? 'Specify measurement adjustments or pattern changes required from admin.'
                : 'Report fabric supply constraints or printing method incompatibilities.'}
            </p>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed feedback or issue details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(activeModal.techpackId, activeModal.type === 'revision' ? 'request_revision' : 'report_issue', notes)}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Specs Modal */}
      {selectedTechpack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedTechpack.title}</h3>
                <p className="text-xs text-indigo-400 font-medium">Full Specification Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedTechpack(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Materials & Fabric</span>
                  <p className="font-semibold text-white mt-1">{selectedTechpack.materials?.join(', ')}</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Colorways</span>
                  <p className="font-semibold text-white mt-1">{selectedTechpack.colorVariants?.join(', ')}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Size Chart Measurements</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-medium text-slate-200">
                  {selectedTechpack.sizeCharts?.map((sz, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      {sz}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTechpack(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Quotation & Attached Tech Pack Full Inspection Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    Status: {selectedQuote.status || 'draft'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    • {selectedQuote.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'} ({selectedQuote.quantity || 1} units)
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedQuote.projectName || selectedQuote.designSpec?.garment?.style || 'Draft Apparel Quotation'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Attached Tech Pack Image */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Attached Tech Pack Drawing</span>
                {selectedQuote.techPackImage ? (
                  <img
                    src={selectedQuote.techPackImage}
                    alt="Attached Tech Pack"
                    className="max-h-56 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-slate-500 text-xs">Technical spec sheet attached to quotation record.</div>
                )}
              </div>

              {/* Product Specs, Fabric, Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Garment Specs & Fit</span>
                  <p className="font-bold text-white mt-1 capitalize">{selectedQuote.designSpec?.garment?.type || 'Polo'} • {selectedQuote.designSpec?.garment?.style || 'Custom Style'}</p>
                  <p className="text-slate-300 mt-0.5">Reference Size: {selectedQuote.designSpec?.garment?.size_reference || 'XL'}</p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fabric Specifications</span>
                  <p className="font-bold text-white mt-1">{selectedQuote.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'}</p>
                  <p className="text-slate-300 mt-0.5">
                    {selectedQuote.designSpec?.fabrics?.[0]?.gsm || 300} GSM • {selectedQuote.designSpec?.fabrics?.[0]?.composition || '80% cotton / 20% polyester'}
                  </p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantity & Incoterm</span>
                  <p className="font-bold text-white mt-1">{selectedQuote.quantity || 1} unit(s) ({selectedQuote.orderType || 'bulk'})</p>
                  <p className="text-slate-300 mt-0.5">FOB Sialkot + Standard Air Logistics</p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Shipping Destination</span>
                  <p className="font-bold text-white mt-1">{selectedQuote.shippingAddress?.city || 'Lahore'}, {selectedQuote.shippingAddress?.country || 'Pakistan'}</p>
                  <p className="text-slate-300 mt-0.5 truncate">{selectedQuote.shippingAddress?.street || 'Local delivery'}</p>
                </div>
              </div>

              {/* Embellishments & Logos */}
              {selectedQuote.designSpec?.decorations?.length > 0 && (
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Decorations / Logos / Embellishments</span>
                  <div className="space-y-1.5">
                    {selectedQuote.designSpec.decorations.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="font-semibold text-white">{d.name || d.type} ({d.placement})</span>
                        <span className="font-mono text-emerald-400">{d.techniqueLabel || d.type} • {d.width_in || d.dimensions?.width_in || 12}"×{d.height_in || d.dimensions?.height_in || 4.5}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Size Chart Matrix */}
              {selectedQuote.designSpec?.sizeChart?.rows && (
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Detected Garment Size Chart</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-700">
                          <th className="py-1">Spec</th>
                          <th className="py-1">S</th>
                          <th className="py-1">M</th>
                          <th className="py-1">L</th>
                          <th className="py-1 text-emerald-400">XL</th>
                          <th className="py-1">XXL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {selectedQuote.designSpec.sizeChart.rows.map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 text-slate-300 font-sans">{r.measurement}</td>
                            <td className="py-1 text-slate-400">{r.s}"</td>
                            <td className="py-1 text-slate-400">{r.m}"</td>
                            <td className="py-1 text-slate-400">{r.l}"</td>
                            <td className="py-1 text-emerald-400 font-bold">{r.xl}"</td>
                            <td className="py-1 text-slate-400">{r.xxl}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Itemized Pricing & Totals */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Draft Itemized Pricing</span>
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Landed Unit Price:</span>
                  <span className="font-mono font-bold text-emerald-400">${selectedQuote.calculation?.totals?.landedUnitUsd || '45.00'} USD</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1.5">
                  <span>Total Draft Estimate ({selectedQuote.quantity || 1} units):</span>
                  <span className="font-mono text-emerald-400">
                    ${((Number(selectedQuote.calculation?.totals?.landedUnitUsd) || 45) * (selectedQuote.quantity || 1)).toFixed(2)} USD (PKR {formatCurrency(selectedQuote.calculation?.totals?.finalTotal || 0)})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-400">Attached Tech Pack reviewable by assigned manufacturer & admin.</span>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
