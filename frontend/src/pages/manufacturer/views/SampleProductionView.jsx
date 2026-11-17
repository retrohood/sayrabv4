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
      <div className="bg-white border border-[#e5e9e3] p-6 rounded-3xl shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-black text-[#172033] flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/20">
              <FlaskConical className="w-5 h-5" />
            </span>
            Pre-Bulk Sample Production & Approval Pipeline
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Produce physical prototype samples, upload high-res detailed photographs, enter physical sample courier tracking, and wait for Organization Leader approval before initiating bulk manufacturing.
          </p>
        </div>

        {/* Interactive Step Pipeline Visual */}
        <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] gap-2">
            {workflowSteps.map((st, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 || i === 1
                        ? 'bg-[#10182b] text-white shadow-sm'
                        : 'bg-white text-[#64748b] border border-[#e5e9e3]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[10px] font-bold text-[#172033] mt-1">{st.label}</span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {samples.length === 0 ? (
          <div className="col-span-2 bg-white border border-[#e5e9e3] p-12 text-center rounded-3xl shadow-sm text-[#94a3b8]">
            No sample production jobs assigned currently.
          </div>
        ) : (
          samples.map((smp) => (
            <div key={smp._id} className="bg-white border border-[#e5e9e3] rounded-3xl p-5 space-y-4 shadow-sm hover:border-[#89ca2e]/60 hover:shadow-md transition">
              <div className="flex items-start justify-between pb-3 border-b border-[#e5e9e3]">
                <div>
                  <h3 className="font-bold text-[#172033] text-base">{smp.techpack?.title || 'Sample Prototype'}</h3>
                  <p className="text-xs text-[#0ea5c6] font-bold">{smp.campaign?.title || 'Campaign Sample'}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    smp.status === 'approved_by_leader'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : smp.status === 'sample_completed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {smp.status.replace('_', ' ')}
                </span>
              </div>

              {/* Sample Photos Gallery */}
              <div>
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-2">
                  Uploaded Sample Photos ({smp.samplePhotos?.length || 0})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {smp.samplePhotos?.length > 0 ? (
                    smp.samplePhotos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p.url}
                        alt="Sample"
                        className="w-full h-20 object-cover rounded-2xl border border-[#e5e9e3] bg-[#f7f9f5]"
                      />
                    ))
                  ) : (
                    <div className="col-span-3 p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-center text-xs text-[#94a3b8] flex items-center justify-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#94a3b8]" /> No photos uploaded yet
                    </div>
                  )}
                </div>
              </div>

              {/* Courier & Tracking */}
              {smp.trackingNumber && (
                <div className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#64748b]">
                    <span className="flex items-center gap-1 font-bold text-[#172033]">
                      <Truck className="w-3.5 h-3.5 text-[#0ea5c6]" /> Courier: {smp.courier}
                    </span>
                    <span className="text-[#367c35] font-bold">Shipped</span>
                  </div>
                  <p className="text-[#64748b]">Tracking #: <strong className="text-[#172033] font-mono">{smp.trackingNumber}</strong></p>
                </div>
              )}

              {/* Leader Feedback */}
              {smp.leaderFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-[#367c35] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Org Leader Approval Note:
                  </span>
                  <p className="text-[#172033]">{smp.leaderFeedback}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveSample(smp)}
                  className="px-3.5 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#89ca2e]" /> Upload Photos & Tracking
                </button>

                {smp.status !== 'sample_completed' && (
                  <button
                    onClick={() => handleUpdate(smp._id, 'sample_completed')}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#0ea5c6]" /> Upload Sample Photos & Tracking
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748b] font-bold mb-1">Sample Photo Image URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
                />
              </div>

              <div>
                <label className="block text-[#64748b] font-bold mb-1">Courier Service</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6]"
                >
                  <option value="TCS Express Logistics">TCS Express Logistics</option>
                  <option value="Leopards Courier Service">Leopards Courier Service</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="M&P Express">M&P Express</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748b] font-bold mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-998810239"
                  className="w-full bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl p-2.5 text-[#172033] focus:outline-none focus:border-[#0ea5c6] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveSample(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f7fb] text-[#64748b] text-xs font-semibold hover:bg-[#e5e9e3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(activeSample._id, 'sample_shipped')}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold cursor-pointer"
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
