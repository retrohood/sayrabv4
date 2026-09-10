import { useState } from 'react';
import {
  FlaskConical,
  Upload,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Building2,
  ExternalLink,
} from 'lucide-react';
import api from '../../../api/client';

export default function SampleProductionView({ samples = [], onRefresh }) {
  const [activeSample, setActiveSample] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [courier, setCourier] = useState('TCS Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const workflowSteps = [
    { label: 'Receive Techpack', status: 'completed' },
    { label: 'Produce Sample', status: 'in_progress' },
    { label: 'Upload Sample Photos', status: 'pending' },
    { label: 'Ship Sample', status: 'pending' },
    { label: 'Leader Approval', status: 'pending' },
    { label: 'Bulk Production Starts', status: 'pending' },
  ];

  const handleUpdate = async (sampleId, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/api/manufacturer/samples/${sampleId}`, {
        status: newStatus,
        samplePhoto: photoUrl || undefined,
        courier: courier || undefined,
        trackingNumber: trackingNumber || undefined,
      });
      setActiveSample(null);
      setPhotoUrl('');
      setTrackingNumber('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update sample');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Visual Workflow Diagram */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" /> Pre-Bulk Sample Production & Approval Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Produce physical prototype samples, upload high-res detailed photographs, enter physical sample courier tracking, and wait for Organization Leader approval before initiating bulk manufacturing.
          </p>
        </div>

        {/* Interactive Step Pipeline Visual */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] gap-2">
            {workflowSteps.map((st, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 || i === 1
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 mt-1">{st.label}</span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {samples.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl text-slate-500">
            No sample production jobs assigned currently.
          </div>
        ) : (
          samples.map((smp) => (
            <div key={smp._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">{smp.techpack?.title || 'Sample Prototype'}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{smp.campaign?.title || 'Campaign Sample'}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                    smp.status === 'approved_by_leader'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : smp.status === 'sample_completed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {smp.status.replace('_', ' ')}
                </span>
              </div>

              {/* Sample Photos Gallery */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Uploaded Sample Photos ({smp.samplePhotos?.length || 0})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {smp.samplePhotos?.length > 0 ? (
                    smp.samplePhotos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p.url}
                        alt="Sample"
                        className="w-full h-20 object-cover rounded-xl border border-slate-800 bg-slate-950"
                      />
                    ))
                  ) : (
                    <div className="col-span-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <ImageIcon className="w-4 h-4" /> No photos uploaded yet
                    </div>
                  )}
                </div>
              </div>

              {/* Courier & Tracking */}
              {smp.trackingNumber && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-indigo-400" /> Courier: {smp.courier}
                    </span>
                    <span className="text-emerald-400 font-bold">Shipped</span>
                  </div>
                  <p className="text-slate-300">Tracking #: <strong className="text-white">{smp.trackingNumber}</strong></p>
                </div>
              )}

              {/* Leader Feedback */}
              {smp.leaderFeedback && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Org Leader Approval Note:
                  </span>
                  <p className="text-slate-200">{smp.leaderFeedback}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveSample(smp)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photos & Tracking
                </button>

                {smp.status !== 'sample_completed' && (
                  <button
                    onClick={() => handleUpdate(smp._id, 'sample_completed')}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Photos & Tracking Modal */}
      {activeSample && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" /> Upload Sample Photos & Tracking
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sample Photo Image URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Courier Service</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="TCS Express Logistics">TCS Express Logistics</option>
                  <option value="Leopards Courier Service">Leopards Courier Service</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="M&P Express">M&P Express</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-998810239"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveSample(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(activeSample._id, 'sample_shipped')}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save & Dispatch Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
