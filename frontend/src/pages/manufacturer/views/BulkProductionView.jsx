import { useState } from 'react';
import {
  Factory,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Clock,
  Calendar,
  Layers,
  Palette,
  Ruler,
} from 'lucide-react';
import api from '../../../api/client';

export default function BulkProductionView({ orders = [], onRefresh }) {
  const [updating, setUpdating] = useState(false);
  const [progressInput, setProgressInput] = useState({});

  const handleBulkAction = async (orderId, action, progressValue) => {
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/bulk/${orderId}`, {
        action,
        progress: progressValue !== undefined ? progressValue : progressInput[orderId],
      });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bulk production');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e5e9e3] p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <Factory className="w-5 h-5" />
            </span>
            Bulk Manufacturing Management
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Control bulk unit production progress (%), adjust batch SLA completion rates, and trigger Quality Check phase after sample approval.
          </p>
        </div>
        <span className="text-xs font-bold bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20 px-3 py-1.5 rounded-xl">
          {orders.length} Bulk Batches
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white border border-[#e5e9e3] p-12 text-center rounded-3xl shadow-sm text-[#94a3b8]">
            No bulk manufacturing batches in queue.
          </div>
        ) : (
          orders.map((ord) => {
            const currentProgress = progressInput[ord._id] ?? (ord.bulkProgress || 0);

            return (
              <div key={ord._id} className="bg-white border border-[#e5e9e3] rounded-3xl p-5 space-y-4 shadow-sm hover:border-[#89ca2e]/60 transition">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#e5e9e3]">
                  <div>
                    <h3 className="font-bold text-[#172033] text-base">{ord.campaignName}</h3>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Product: <strong className="text-[#172033]">{ord.product}</strong> • Org: <strong className="text-[#0ea5c6]">{ord.organization}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#64748b] flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" /> Deadline: {new Date(ord.deadline).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 font-bold border border-cyan-200 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Batch Specifications Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#0ea5c6]" /> Total Units
                    </span>
                    <p className="font-bold text-[#172033] text-sm mt-1">{ord.quantity} Pcs</p>
                  </div>

                  <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-[#0ea5c6]" /> Sizes
                    </span>
                    <p className="font-bold text-[#172033] text-sm mt-1">S, M, L, XL, 2XL</p>
                  </div>

                  <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
                      <Palette className="w-3 h-3 text-[#0ea5c6]" /> Colors
                    </span>
                    <p className="font-bold text-[#172033] text-sm mt-1">Jet Black / Heather</p>
                  </div>

                  <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-[#0ea5c6]" /> Progress %
                    </span>
                    <p className="font-bold text-[#367c35] text-sm mt-1">{ord.bulkProgress || 0}%</p>
                  </div>
                </div>

                {/* Progress % Interactive Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#172033]">Update Bulk Production Progress (%)</span>
                    <span className="text-[#367c35] font-mono">{currentProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProgress}
                    onChange={(e) => setProgressInput({ ...progressInput, [ord._id]: Number(e.target.value) })}
                    onMouseUp={() => handleBulkAction(ord._id, 'update_progress', currentProgress)}
                    onTouchEnd={() => handleBulkAction(ord._id, 'update_progress', currentProgress)}
                    className="w-full accent-[#0ea5c6] cursor-pointer"
                  />
                  <div className="w-full bg-[#f5f7fb] h-2.5 rounded-full overflow-hidden border border-[#e5e9e3]">
                    <div
                      className="bg-gradient-to-r from-[#0ea5c6] to-[#89ca2e] h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="pt-3 border-t border-[#e5e9e3] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction(ord._id, 'start', 15)}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-[#89ca2e]" /> Start Production
                    </button>

                    <button
                      onClick={() => handleBulkAction(ord._id, 'pause')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause Batch
                    </button>
                  </div>

                  <button
                    onClick={() => handleBulkAction(ord._id, 'complete', 100)}
                    disabled={updating}
                    className="px-4 py-1.5 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete Production
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
