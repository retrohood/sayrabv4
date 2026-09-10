import { useState } from 'react';
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
} from 'lucide-react';
import api from '../../../api/client';

export default function TechpacksView({ techpacks = [], onRefresh }) {
  const [activeModal, setActiveModal] = useState(null); // { type: 'revision' | 'issue', techpackId }
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedTechpack, setSelectedTechpack] = useState(null);

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
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Admin Approved Techpack Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review design spec sheets, vector mockups, fabric GSM measurements, size charts, and colorways prior to sampling.
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-xl">
          {techpacks.length} Active Specs
        </span>
      </div>

      {/* Techpacks List / Cards */}
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
    </div>
  );
}
