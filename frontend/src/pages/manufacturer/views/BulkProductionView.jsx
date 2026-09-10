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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-400" /> Bulk Manufacturing Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control bulk unit production progress (%), adjust batch SLA completion rates, and trigger Quality Check phase after sample approval.
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-xl">
          {orders.length} Bulk Batches
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl text-slate-500">
            No bulk manufacturing batches in queue.
          </div>
        ) : (
          orders.map((ord) => {
            const currentProgress = progressInput[ord._id] ?? (ord.bulkProgress || 0);

            return (
              <div key={ord._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-base">{ord.campaignName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Product: <strong className="text-slate-200">{ord.product}</strong> • Org: <strong className="text-indigo-400">{ord.organization}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Deadline: {new Date(ord.deadline).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Batch Specifications Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-400" /> Total Units
                    </span>
                    <p className="font-bold text-white text-sm mt-1">{ord.quantity} Pcs</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-indigo-400" /> Sizes
                    </span>
                    <p className="font-bold text-white text-sm mt-1">S, M, L, XL, 2XL</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Palette className="w-3 h-3 text-indigo-400" /> Colors
                    </span>
                    <p className="font-bold text-white text-sm mt-1">Jet Black / Heather</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-indigo-400" /> Progress %
                    </span>
                    <p className="font-bold text-emerald-400 text-sm mt-1">{ord.bulkProgress || 0}%</p>
                  </div>
                </div>

                {/* Progress % Interactive Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Update Bulk Production Progress (%)</span>
                    <span className="text-emerald-400">{currentProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentProgress}
                    onChange={(e) => setProgressInput({ ...progressInput, [ord._id]: Number(e.target.value) })}
                    onMouseUp={() => handleBulkAction(ord._id, 'update_progress', currentProgress)}
                    onTouchEnd={() => handleBulkAction(ord._id, 'update_progress', currentProgress)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction(ord._id, 'start', 15)}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Production
                    </button>

                    <button
                      onClick={() => handleBulkAction(ord._id, 'pause')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause Batch
                    </button>
                  </div>

                  <button
                    onClick={() => handleBulkAction(ord._id, 'complete', 100)}
                    disabled={updating}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
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
