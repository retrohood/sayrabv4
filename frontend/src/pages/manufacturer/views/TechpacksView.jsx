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
      <div className="bg-white border border-[#e5e9e3] p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <FileText className="w-5 h-5" />
            </span>
            Tech Pack & Draft Quotation Specifications
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Review attached tech packs, size charts, fabric specs, logos, and draft quotations submitted by fundraisers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f5f7fb] p-1 rounded-2xl border border-[#e5e9e3] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quotations'
                ? 'bg-[#10182b] text-white shadow-sm'
                : 'text-[#64748b] hover:text-[#172033]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#89ca2e]" />
            <span>Fundraiser Draft Quotes ({quotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approved_techpacks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'approved_techpacks'
                ? 'bg-[#10182b] text-white shadow-sm'
                : 'text-[#64748b] hover:text-[#172033]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0ea5c6]" />
            <span>Production Techpacks ({techpacks.length})</span>
          </button>
        </div>
      </div>

      {/* 1. FUNDRAISER DRAFT QUOTATIONS & ATTACHED TECH PACKS */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          {loadingQuotes ? (
            <div className="bg-white border border-[#e5e9e3] p-12 text-center rounded-3xl shadow-sm text-[#64748b] text-xs">
              Loading draft quotation reviews...
            </div>
          ) : quotations.length === 0 ? (
            <div className="bg-white border border-[#e5e9e3] p-12 text-center rounded-3xl shadow-sm text-[#64748b] text-xs">
              No draft quotations currently awaiting manufacturer review.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quotations.map((q) => (
                <div
                  key={q._id}
                  className="bg-white border border-[#e5e9e3] rounded-3xl p-5 space-y-4 shadow-sm hover:border-[#89ca2e]/60 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e5e9e3]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                            Status: {q.status || 'draft'}
                          </span>
                          <span className="text-xs text-[#64748b] font-mono">
                            {q.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Order'} • {q.quantity || 1} units
                          </span>
                        </div>
                        <h3 className="font-bold text-[#172033] text-base">{q.projectName || q.designSpec?.garment?.style || 'Apparel Quotation'}</h3>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          Fundraiser: <strong className="text-[#172033]">{q.owner?.fullName || q.owner?.email || 'Fundraiser Partner'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#64748b] block uppercase font-bold">Draft Estimate</span>
                        <span className="text-sm font-black font-mono text-[#367c35]">
                          ${q.calculation?.totals?.landedUnitUsd || '45.00'} USD/unit
                        </span>
                        <span className="text-[10px] text-[#64748b] block">
                          PKR {formatCurrency(q.calculation?.totals?.finalTotal || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Attached Tech Pack & Specs Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 rounded-2xl overflow-hidden border border-[#e5e9e3] bg-[#f7f9f5] flex items-center justify-center min-h-[90px] relative group">
                        {q.techPackImage ? (
                          <img
                            src={q.techPackImage}
                            alt="Attached Tech Pack"
                            className="w-full h-24 object-contain p-1"
                          />
                        ) : (
                          <div className="text-center p-2 text-[#94a3b8] text-[10px]">
                            <FileText className="w-6 h-6 mx-auto mb-1 text-[#94a3b8]" />
                            <span>Tech Pack</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-white/95 text-[9px] font-bold text-[#172033] px-1.5 py-0.5 rounded border border-[#e5e9e3] shadow-xs">
                          Attached
                        </span>
                      </div>

                      <div className="col-span-2 space-y-1 text-xs">
                        <div className="text-[#172033]">
                          <span className="text-[#64748b] font-semibold">Fabric: </span>
                          <span className="font-bold">{q.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'} ({q.designSpec?.fabrics?.[0]?.gsm || 300} GSM)</span>
                        </div>
                        <div className="text-[#172033]">
                          <span className="text-[#64748b] font-semibold">Logos: </span>
                          <span className="text-amber-700 font-bold">{q.designSpec?.decorations?.length || 0} embellishments detected</span>
                        </div>
                        <div className="text-[#172033] truncate">
                          <span className="text-[#64748b] font-semibold">Ship To: </span>
                          <span className="text-[#172033]">{q.shippingAddress?.city || 'Lahore'}, {q.shippingAddress?.country || 'Pakistan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detected Size Chart Snapshot */}
                    {q.designSpec?.sizeChart?.rows && (
                      <div className="p-2.5 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-[11px]">
                        <span className="font-bold text-[#64748b] uppercase text-[9px] block mb-1">Detected Size Chart (Chest Scale)</span>
                        <div className="flex items-center gap-3 overflow-x-auto text-[#172033] font-mono">
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
                  <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedQuote(q)}
                      className="px-3.5 py-2 rounded-xl bg-[#f5f7fb] hover:bg-[#e5e9e3] text-[#172033] font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer border border-[#e5e9e3]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0ea5c6]" />
                      <span>Inspect Draft Quotation</span>
                    </button>

                    <button
                      onClick={() => alert(`Draft quotation for ${q.projectName || 'order'} verified by manufacturer. Technical specifications accepted.`)}
                      className="px-3.5 py-2 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
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
          <div className="col-span-2 bg-white border border-[#e5e9e3] p-12 text-center rounded-3xl shadow-sm text-[#64748b] text-xs">
            No approved techpacks available currently.
          </div>
        ) : (
          techpacks.map((tp) => (
            <div key={tp._id} className="bg-white border border-[#e5e9e3] rounded-3xl p-5 space-y-4 shadow-sm hover:border-[#89ca2e]/60 hover:shadow-md transition flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e5e9e3]">
                  <div>
                    <h3 className="font-bold text-[#172033] text-base">{tp.title}</h3>
                    <p className="text-xs text-[#0ea5c6] font-bold">{tp.campaignName} • v{tp.version}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      tp.status === 'accepted_by_manufacturer'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : tp.status === 'revision_requested'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
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
                      className="w-full h-24 object-cover rounded-2xl border border-[#e5e9e3] bg-[#f7f9f5]"
                    />
                  ))}
                </div>

                {/* Specs List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#172033]">
                    <Layers className="w-4 h-4 text-[#0ea5c6] shrink-0" />
                    <span className="font-semibold text-[#64748b]">Materials:</span>
                    <span className="truncate">{tp.materials?.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#172033]">
                    <Ruler className="w-4 h-4 text-[#0ea5c6] shrink-0" />
                    <span className="font-semibold text-[#64748b]">Size Chart:</span>
                    <span className="truncate">{tp.sizeCharts?.slice(0, 3).join(', ')}...</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#172033]">
                    <Palette className="w-4 h-4 text-[#0ea5c6] shrink-0" />
                    <span className="font-semibold text-[#64748b]">Color Variants:</span>
                    <span className="truncate">{tp.colorVariants?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#e5e9e3] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {tp.files?.[0]?.url && (
                    <a
                      href={tp.files[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#f5f7fb] hover:bg-[#e5e9e3] text-[#172033] border border-[#e5e9e3] font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0ea5c6]" /> PDF Spec
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedTechpack(tp)}
                    className="px-3 py-1.5 rounded-xl bg-[#f5f7fb] hover:bg-[#e5e9e3] text-[#172033] border border-[#e5e9e3] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#367c35]" /> Full Specs
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {tp.status !== 'accepted_by_manufacturer' && (
                    <button
                      onClick={() => handleAction(tp._id, 'accept', 'Techpack specs accepted')}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs inline-flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                  )}

                  <button
                    onClick={() => setActiveModal({ type: 'revision', techpackId: tp._id })}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Revise
                  </button>

                  <button
                    onClick={() => setActiveModal({ type: 'issue', techpackId: tp._id })}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2 capitalize">
              {activeModal.type === 'revision' ? <RotateCcw className="w-5 h-5 text-amber-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
              {activeModal.type === 'revision' ? 'Request Techpack Revision' : 'Report Spec Issue'}
            </h3>
            <p className="text-xs text-[#64748b]">
              {activeModal.type === 'revision'
                ? 'Specify measurement adjustments or pattern changes required from admin.'
                : 'Report fabric supply constraints or printing method incompatibilities.'}
            </p>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed feedback or issue details..."
              className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-2xl p-3 text-xs text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f7fb] text-[#64748b] text-xs font-semibold hover:bg-[#e5e9e3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(activeModal.techpackId, activeModal.type === 'revision' ? 'request_revision' : 'report_issue', notes)}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Specs Modal */}
      {selectedTechpack && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
              <div>
                <h3 className="text-base font-bold text-[#172033]">{selectedTechpack.title}</h3>
                <p className="text-xs text-[#0ea5c6] font-bold">Full Specification Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedTechpack(null)}
                className="p-1 rounded-xl bg-[#f5f7fb] text-[#64748b] hover:text-[#172033] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-semibold">Materials & Fabric</span>
                  <p className="font-bold text-[#172033] mt-1">{selectedTechpack.materials?.join(', ')}</p>
                </div>
                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-semibold">Colorways</span>
                  <p className="font-bold text-[#172033] mt-1">{selectedTechpack.colorVariants?.join(', ')}</p>
                </div>
              </div>

              <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                <span className="text-[10px] text-[#64748b] uppercase font-semibold">Size Chart Measurements</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-medium text-[#172033]">
                  {selectedTechpack.sizeCharts?.map((sz, i) => (
                    <div key={i} className="p-2 bg-white rounded-xl border border-[#e5e9e3]">
                      {sz}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTechpack(null)}
                className="px-4 py-2 rounded-xl bg-[#10182b] text-white font-bold text-xs hover:bg-[#172033] cursor-pointer"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Quotation & Attached Tech Pack Full Inspection Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#e5e9e3] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                    Status: {selectedQuote.status || 'draft'}
                  </span>
                  <span className="text-xs text-[#64748b] font-mono">
                    • {selectedQuote.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'} ({selectedQuote.quantity || 1} units)
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#172033]">
                  {selectedQuote.projectName || selectedQuote.designSpec?.garment?.style || 'Draft Apparel Quotation'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 rounded-xl bg-[#f5f7fb] text-[#64748b] hover:text-[#172033] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Attached Tech Pack Image */}
              <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] text-center">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-2">Attached Tech Pack Drawing</span>
                {selectedQuote.techPackImage ? (
                  <img
                    src={selectedQuote.techPackImage}
                    alt="Attached Tech Pack"
                    className="max-h-56 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-[#94a3b8] text-xs">Technical spec sheet attached to quotation record.</div>
                )}
              </div>

              {/* Product Specs, Fabric, Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Garment Specs & Fit</span>
                  <p className="font-bold text-[#172033] mt-1 capitalize">{selectedQuote.designSpec?.garment?.type || 'Polo'} • {selectedQuote.designSpec?.garment?.style || 'Custom Style'}</p>
                  <p className="text-[#64748b] mt-0.5">Reference Size: {selectedQuote.designSpec?.garment?.size_reference || 'XL'}</p>
                </div>

                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Fabric Specifications</span>
                  <p className="font-bold text-[#172033] mt-1">{selectedQuote.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'}</p>
                  <p className="text-[#64748b] mt-0.5">
                    {selectedQuote.designSpec?.fabrics?.[0]?.gsm || 300} GSM • {selectedQuote.designSpec?.fabrics?.[0]?.composition || '80% cotton / 20% polyester'}
                  </p>
                </div>

                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Quantity & Incoterm</span>
                  <p className="font-bold text-[#172033] mt-1">{selectedQuote.quantity || 1} unit(s) ({selectedQuote.orderType || 'bulk'})</p>
                  <p className="text-[#64748b] mt-0.5">FOB Sialkot + Standard Air Logistics</p>
                </div>

                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Shipping Destination</span>
                  <p className="font-bold text-[#172033] mt-1">{selectedQuote.shippingAddress?.city || 'Lahore'}, {selectedQuote.shippingAddress?.country || 'Pakistan'}</p>
                  <p className="text-[#64748b] mt-0.5 truncate">{selectedQuote.shippingAddress?.street || 'Local delivery'}</p>
                </div>
              </div>

              {/* Embellishments & Logos */}
              {selectedQuote.designSpec?.decorations?.length > 0 && (
                <div className="p-3.5 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-2">Decorations / Logos / Embellishments</span>
                  <div className="space-y-1.5">
                    {selectedQuote.designSpec.decorations.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#e5e9e3]">
                        <span className="font-semibold text-[#172033]">{d.name || d.type} ({d.placement})</span>
                        <span className="font-mono text-[#367c35] font-bold">{d.techniqueLabel || d.type} • {d.width_in || d.dimensions?.width_in || 12}"×{d.height_in || d.dimensions?.height_in || 4.5}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Size Chart Matrix */}
              {selectedQuote.designSpec?.sizeChart?.rows && (
                <div className="p-3.5 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-2">Detected Garment Size Chart</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[#64748b] border-b border-[#e5e9e3]">
                          <th className="py-1">Spec</th>
                          <th className="py-1">S</th>
                          <th className="py-1">M</th>
                          <th className="py-1">L</th>
                          <th className="py-1 text-[#367c35]">XL</th>
                          <th className="py-1">XXL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e9e3] font-mono">
                        {selectedQuote.designSpec.sizeChart.rows.map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 text-[#172033] font-sans font-medium">{r.measurement}</td>
                            <td className="py-1 text-[#64748b]">{r.s}"</td>
                            <td className="py-1 text-[#64748b]">{r.m}"</td>
                            <td className="py-1 text-[#64748b]">{r.l}"</td>
                            <td className="py-1 text-[#367c35] font-bold">{r.xl}"</td>
                            <td className="py-1 text-[#64748b]">{r.xxl}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Itemized Pricing & Totals */}
              <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] space-y-2">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block">Draft Itemized Pricing</span>
                <div className="flex justify-between text-[#172033]">
                  <span>Estimated Landed Unit Price:</span>
                  <span className="font-mono font-bold text-[#367c35]">${selectedQuote.calculation?.totals?.landedUnitUsd || '45.00'} USD</span>
                </div>
                <div className="flex justify-between text-[#172033] font-bold border-t border-[#e5e9e3] pt-1.5">
                  <span>Total Draft Estimate ({selectedQuote.quantity || 1} units):</span>
                  <span className="font-mono text-[#367c35]">
                    ${((Number(selectedQuote.calculation?.totals?.landedUnitUsd) || 45) * (selectedQuote.quantity || 1)).toFixed(2)} USD (PKR {formatCurrency(selectedQuote.calculation?.totals?.finalTotal || 0)})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#e5e9e3] bg-white flex items-center justify-between">
              <span className="text-xs text-[#64748b]">Attached Tech Pack reviewable by assigned manufacturer & admin.</span>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs cursor-pointer"
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
