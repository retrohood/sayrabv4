import { useState } from 'react';
import {
  Factory,
  Search,
  Filter,
  FileCheck2,
  Layers,
  Truck,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Star,
  Sparkles,
  X,
  FileText,
  Send,
} from 'lucide-react';
import { formatDate } from '../../../utils/format';

export default function ManufacturersView({
  subFilter,
  setSubFilter,
  manufacturers,
  techpacks,
  orders,
  onReviewTechpack,
  onUpdateOrderStatus,
  onCreateManufacturer,
}) {
  const [activeTab, setActiveTab] = useState(subFilter || 'partners');
  const [search, setSearch] = useState('');
  const [selectedTechpack, setSelectedTechpack] = useState(null);
  const [techpackActionModal, setTechpackActionModal] = useState(null); // { tp, action: 'approve' | 'revision' | 'reject' }
  const [assignedManId, setAssignedManId] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newManModal, setNewManModal] = useState(false);
  const [newManForm, setNewManForm] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    specialties: 'Apparel, Hoodies, Tees',
    capacityPerMonth: 10000,
  });

  // Keep internal tab in sync with subFilter
  const currentTab = subFilter && subFilter !== 'all' ? subFilter : activeTab;

  const handleTechpackAction = async () => {
    if (!techpackActionModal) return;
    const { tp, action } = techpackActionModal;

    const targetStatus =
      action === 'approve'
        ? 'approved'
        : action === 'revision'
        ? 'revision_requested'
        : 'rejected';

    try {
      await onReviewTechpack(tp._id, {
        status: targetStatus,
        assignedManufacturerId: assignedManId || tp.assignedManufacturer?._id,
        adminNotes,
        revisionNotes,
      });
      setTechpackActionModal(null);
      setAdminNotes('');
      setRevisionNotes('');
      setAssignedManId('');
      if (selectedTechpack?._id === tp._id) {
        setSelectedTechpack((prev) => ({
          ...prev,
          status: targetStatus,
          adminNotes,
          revisionNotes,
        }));
      }
    } catch (e) {
      alert(e.message || 'Action failed');
    }
  };

  const handleCreateManufacturer = async (e) => {
    e.preventDefault();
    try {
      await onCreateManufacturer({
        ...newManForm,
        specialties: newManForm.specialties.split(',').map((s) => s.trim()),
      });
      setNewManModal(false);
      setNewManForm({
        name: '',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        specialties: 'Apparel, Hoodies, Tees',
        capacityPerMonth: 10000,
      });
    } catch (err) {
      alert(err.message || 'Failed to create manufacturer');
    }
  };

  const handleProductionStatusChange = async (orderId, newStatus) => {
    try {
      await onUpdateOrderStatus(orderId, { productionStatus: newStatus });
    } catch (err) {
      alert(err.message || 'Failed to update production status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('partners');
              setSubFilter('partners');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentTab === 'partners'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Factory size={15} />
            <span>Manufacturing Partners</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('techpacks');
              setSubFilter('techpacks');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentTab === 'techpacks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck2 size={15} />
            <span>Techpack Approvals</span>
            {techpacks?.filter((t) => t.status === 'pending_review').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {techpacks.filter((t) => t.status === 'pending_review').length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('production');
              setSubFilter('production');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentTab === 'production'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={15} />
            <span>Production Board</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('shipping');
              setSubFilter('shipping');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentTab === 'shipping'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck size={15} />
            <span>Shipping & Dispatch</span>
          </button>
        </div>

        {currentTab === 'partners' && (
          <button
            onClick={() => setNewManModal(true)}
            className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            <span>Add Partner</span>
          </button>
        )}
      </div>

      {/* 1. PARTNERS DIRECTORY */}
      {currentTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {manufacturers.map((m) => (
            <div
              key={m._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm">
                    <Factory size={20} className="text-emerald-600" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{m.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{m.companyName}</p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <p>
                    <span className="text-slate-400">Contact:</span> {m.contactPerson} ({m.phone})
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span> {m.email}
                  </p>
                  <p>
                    <span className="text-slate-400">Location:</span> {m.address}
                  </p>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {m.specialties?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scorecard Box */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">On-Time Rate</span>
                  <span className="font-bold text-emerald-600">
                    {m.performance?.onTimeDeliveryRate || 98}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Quality Score</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{m.performance?.qualityScore || 4.9}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Active Queue</span>
                  <span className="font-bold text-indigo-600">{m.activeOrdersCount || 12}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. TECHPACK APPROVAL WORKFLOW */}
      {currentTab === 'techpacks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {techpacks.map((tp) => (
              <div
                key={tp._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Preview Image */}
                  <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative group">
                    {tp.previewImages && tp.previewImages[0] ? (
                      <img
                        src={tp.previewImages[0]}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <FileText size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tp.status === 'approved'
                            ? 'bg-emerald-500 text-white'
                            : tp.status === 'revision_requested'
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {tp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{tp.title}</h4>
                  <p className="text-xs text-emerald-600 font-medium mb-2">{tp.campaign?.title}</p>
                  <p className="text-[11px] text-slate-400">Version: {tp.version} &bull; Designer: {tp.designer?.fullName}</p>

                  {/* Assigned Manufacturer */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <span className="text-[10px] text-slate-400 block">Assigned Manufacturer</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {tp.assignedManufacturer?.name || 'Unassigned — Pending Selection'}
                    </span>
                  </div>

                  {tp.revisionNotes && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                      <strong>Revision Note:</strong> {tp.revisionNotes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                  <button
                    onClick={() => setSelectedTechpack(tp)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Inspect Spec
                  </button>

                  {tp.status === 'pending_review' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setTechpackActionModal({ tp, action: 'revision' });
                          setAssignedManId(tp.assignedManufacturer?._id || '');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs"
                      >
                        Revise
                      </button>
                      <button
                        onClick={() => {
                          setTechpackActionModal({ tp, action: 'approve' });
                          setAssignedManId(tp.assignedManufacturer?._id || manufacturers[0]?._id || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRODUCTION KANBAN BOARD */}
      {currentTab === 'production' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['waiting', 'in_production', 'quality_check', 'shipped', 'delivered'].map((st) => {
            const colOrders = orders.filter((o) => (o.productionStatus || 'waiting') === st);

            return (
              <div
                key={st}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {st.replace('_', ' ')}
                  </span>
                  <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colOrders.length > 0 ? (
                    colOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                          <span>{ord.invoiceNumber || ord._id.slice(-6)}</span>
                          <span className="text-emerald-600 font-sans">{ord.assignedManufacturer?.name?.split(' ')[0] || 'Apex'}</span>
                        </div>

                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {ord.products?.[0]?.name} x {ord.products?.[0]?.quantity}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{ord.campaignId?.title}</p>

                        {/* Status Change Selector */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Move state:</span>
                          <select
                            value={ord.productionStatus || 'waiting'}
                            onChange={(e) => handleProductionStatusChange(ord._id, e.target.value)}
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 border-none rounded-md px-1.5 py-0.5 focus:outline-hidden"
                          >
                            <option value="waiting">Waiting</option>
                            <option value="in_production">In Production</option>
                            <option value="quality_check">Quality Check</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No orders in this column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SHIPPING & DISPATCH */}
      {currentTab === 'shipping' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Merchandise Items</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {o.invoiceNumber || 'INV-2026'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white">{o.customerId?.fullName}</span>
                    <p className="text-slate-400 text-[11px]">{o.shippingAddress?.city}, {o.shippingAddress?.country}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {o.products?.map((p, idx) => (
                      <span key={idx} className="block text-[11px]">
                        {p.name} ({p.quantity}x) {p.size ? `• ${p.size}` : ''}
                      </span>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {o.carrier || 'TCS Express Logistics'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-600 font-bold">
                    {o.trackingNumber || 'Pending Tracking'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {o.productionStatus || o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Techpack Action Modal (Approve / Revise) */}
      {techpackActionModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 capitalize">
              {techpackActionModal.action === 'approve'
                ? 'Approve & Dispatch Techpack to Manufacturer'
                : 'Request Designer Revision'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Techpack: <strong>{techpackActionModal.tp.title}</strong>
            </p>

            {techpackActionModal.action === 'approve' && (
              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Manufacturer Partner
                  </label>
                  <select
                    value={assignedManId}
                    onChange={(e) => setAssignedManId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                  >
                    {manufacturers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.specialties?.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Approval Notes for Manufacturer
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Standard 320 GSM brushed fleece sample cleared for production."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {techpackActionModal.action === 'revision' && (
              <div className="space-y-1.5 mb-5 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Revision Request Details (For Designer)
                </label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Specify measurements, colorway changes, or print dimension corrections needed..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTechpackActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTechpackAction}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Techpack Detail Inspection Modal */}
      {selectedTechpack && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedTechpack.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Version {selectedTechpack.version} &bull; {selectedTechpack.campaign?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedTechpack(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Images Preview Carousel */}
              {selectedTechpack.previewImages && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedTechpack.previewImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="h-32 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  ))}
                </div>
              )}

              {/* Spec Files */}
              <div>
                <span className="font-bold block text-slate-900 dark:text-white mb-2">Technical Specification Files:</span>
                {selectedTechpack.files?.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-bold flex items-center gap-1"
                    >
                      <span>Download Spec</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTechpack(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manufacturer Modal */}
      {newManModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateManufacturer}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Manufacturing Partner
            </h3>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="font-semibold block mb-1">Partner / Brand Name</label>
                <input
                  required
                  type="text"
                  value={newManForm.name}
                  onChange={(e) => setNewManForm({ ...newManForm, name: e.target.value })}
                  placeholder="e.g. Apex Textile Mills"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Contact Person</label>
                <input
                  required
                  type="text"
                  value={newManForm.contactPerson}
                  onChange={(e) => setNewManForm({ ...newManForm, contactPerson: e.target.value })}
                  placeholder="e.g. Zubair Qureshi"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newManForm.email}
                  onChange={(e) => setNewManForm({ ...newManForm, email: e.target.value })}
                  placeholder="contact@manufacturer.pk"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={newManForm.specialties}
                  onChange={(e) => setNewManForm({ ...newManForm, specialties: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNewManModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Save Partner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
