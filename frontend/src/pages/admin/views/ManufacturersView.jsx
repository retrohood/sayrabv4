import { useState, useEffect } from 'react';
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
  Calculator,
  Ban,
  UserCheck,
  Maximize2,
  Ruler,
  MessageSquare,
} from 'lucide-react';
import api from '../../../api/client';
import { formatDate, formatCurrency } from '../../../utils/format';
import QuotationChatModal from '../../../components/QuotationChatModal';

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
  
  // Quotation Assignment & Management State
  const [adminQuotations, setAdminQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [quoteFilterStatus, setQuoteFilterStatus] = useState('all');
  const [assignQuoteModal, setAssignQuoteModal] = useState(null); // quotation object
  const [targetManufacturerId, setTargetManufacturerId] = useState('');
  const [assignAdminNotes, setAssignAdminNotes] = useState('');
  const [cancelQuoteModal, setCancelQuoteModal] = useState(null); // quotation object
  const [cancelReason, setCancelReason] = useState('');
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState(null);
  const [updatingQuote, setUpdatingQuote] = useState(false);
  const [adminChatQuotation, setAdminChatQuotation] = useState(null);

  const fetchAdminQuotations = async () => {
    try {
      setLoadingQuotations(true);
      const res = await api.get('/quotations/admin/all');
      setAdminQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load admin quotations:', err);
    } finally {
      setLoadingQuotations(false);
    }
  };

  useEffect(() => {
    fetchAdminQuotations();
  }, []);

  const handleAssignQuotation = async () => {
    if (!assignQuoteModal || !targetManufacturerId) {
      alert('Please select a manufacturing partner to assign this quotation.');
      return;
    }
    try {
      setUpdatingQuote(true);
      await api.post(`/quotations/${assignQuoteModal._id}/assign-manufacturer`, {
        manufacturerId: targetManufacturerId,
        adminNotes: assignAdminNotes,
      });
      setAssignQuoteModal(null);
      setTargetManufacturerId('');
      setAssignAdminNotes('');
      fetchAdminQuotations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign quotation to manufacturer');
    } finally {
      setUpdatingQuote(false);
    }
  };

  const handleCancelQuotation = async () => {
    if (!cancelQuoteModal) return;
    try {
      setUpdatingQuote(true);
      await api.post(`/quotations/${cancelQuoteModal._id}/cancel`, {
        reason: cancelReason || 'Cancelled / Struck by Administrator before production',
      });
      setCancelQuoteModal(null);
      setCancelReason('');
      fetchAdminQuotations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel quotation');
    } finally {
      setUpdatingQuote(false);
    }
  };

  const handleStartProduction = async (quoteId) => {
    try {
      setUpdatingQuote(true);
      await api.post(`/quotations/${quoteId}/start-production`);
      if (selectedQuoteDetail?._id === quoteId) {
        setSelectedQuoteDetail((prev) => ({ ...prev, status: 'production_started' }));
      }
      fetchAdminQuotations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start production');
    } finally {
      setUpdatingQuote(false);
    }
  };

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
          <button
            onClick={() => {
              setActiveTab('quotations');
              setSubFilter('quotations');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              currentTab === 'quotations'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator size={15} />
            <span>Quotation Assignments</span>
            {adminQuotations?.filter((q) => ['submitted_to_admin', 'submitted_for_review'].includes(q.status)).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {adminQuotations.filter((q) => ['submitted_to_admin', 'submitted_for_review'].includes(q.status)).length}
              </span>
            )}
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

      {/* ============================================================= */}
      {/* 5. QUOTATION ASSIGNMENTS (ADMIN CONTROLLED - NO OPEN RFQ) */}
      {/* ============================================================= */}
      {currentTab === 'quotations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Informative Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Admin Quotation Assignment Workflow (No Open RFQ Bidding)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                  Fundraisers submit draft quotations for review. As Admin, evaluate the extracted tech pack specs, select exactly <strong>one</strong> qualified manufacturer partner, or cancel/strike the request prior to production.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminQuotations}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Refresh Quotes</span>
              </button>
            </div>
          </div>

          {/* Filter Status Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'all', label: 'All Quotations' },
              { id: 'submitted_to_admin', label: 'Pending Assignment' },
              { id: 'assigned_to_manufacturer', label: 'Assigned' },
              { id: 'manufacturer_reviewing', label: 'In Review' },
              { id: 'manufacturer_proposal_sent', label: 'Proposal Sent' },
              { id: 'accepted_by_fundraiser', label: 'Accepted' },
              { id: 'production_started', label: 'In Production' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setQuoteFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  quoteFilterStatus === st.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Quotations List */}
          {loadingQuotations ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Loading quotation requests...
            </div>
          ) : adminQuotations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No quotation requests found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {adminQuotations
                .filter((q) => {
                  if (quoteFilterStatus === 'all') return true;
                  if (quoteFilterStatus === 'submitted_to_admin') {
                    return q.status === 'submitted_to_admin' || q.status === 'submitted_for_review';
                  }
                  return q.status === quoteFilterStatus;
                })
                .map((quote) => (
                  <div
                    key={quote._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                                quote.status === 'submitted_to_admin' || quote.status === 'submitted_for_review'
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                  : quote.status === 'assigned_to_manufacturer'
                                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                                  : quote.status === 'production_started'
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                                  : quote.status === 'cancelled'
                                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              Status: {quote.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {quote.orderType === 'sample' ? 'Sample' : 'Bulk'} • {quote.quantity || 1} units
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            {quote.projectName || quote.designSpec?.garment?.style || 'Custom Apparel Quote'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Fundraiser: <strong className="text-slate-700 dark:text-slate-300">{quote.owner?.fullName || quote.owner?.email || 'Fundraiser User'}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Draft Total</span>
                          <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                            ${((Number(quote.calculation?.totals?.landedUnitUsd) || 45) * (quote.quantity || 1)).toFixed(2)} USD
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            ${quote.calculation?.totals?.landedUnitUsd || '45.00'}/unit
                          </span>
                        </div>
                      </div>

                      {/* Attached Techpack Mockup + Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[90px] relative">
                          {quote.techPackImage ? (
                            <img
                              src={quote.techPackImage}
                              alt="Attached Tech Pack"
                              className="w-full h-24 object-contain p-1"
                            />
                          ) : (
                            <div className="p-2 text-center text-slate-400 text-[10px]">
                              <FileText className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                              <span>Tech Pack</span>
                            </div>
                          )}
                        </div>

                        <div className="col-span-2 space-y-1 text-xs">
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong className="text-slate-800 dark:text-white">Fabric:</strong> {quote.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'} ({quote.designSpec?.fabrics?.[0]?.gsm || 300} GSM)
                          </p>
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong className="text-slate-800 dark:text-white">Decorations:</strong> {quote.designSpec?.decorations?.length || 0} logos detected
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 truncate">
                            <strong className="text-slate-800 dark:text-white">Ship To:</strong> {quote.shippingAddress?.city || 'Lahore'}, {quote.shippingAddress?.country || 'Pakistan'}
                          </p>
                          <div className="pt-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Manufacturer:</span>
                            {quote.assignedManufacturer ? (
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                {quote.assignedManufacturer.name || quote.assignedManufacturer.companyName || 'Assigned Factory'}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                ⚠ Unassigned (Awaiting Admin Selection)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {quote.cancelledReason && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                          <strong>Cancellation Reason:</strong> {quote.cancelledReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteDetail(quote)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Specs
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminChatQuotation(quote)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Admin Chat Oversight"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-500" /> Chat
                        </button>

                        {quote.status !== 'cancelled' && quote.status !== 'production_started' && quote.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelQuoteModal(quote);
                              setCancelReason('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" /> Strike / Cancel
                          </button>
                        )}
                      </div>

                      {quote.status !== 'cancelled' && quote.status !== 'production_started' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssignQuoteModal(quote);
                            setTargetManufacturerId(quote.assignedManufacturer?._id || '');
                            setAssignAdminNotes(quote.adminNotes || '');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{quote.assignedManufacturer ? 'Re-assign Factory' : 'Assign Manufacturer'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Assign Manufacturer Modal */}
      {assignQuoteModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  Assign Quotation to Manufacturer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct assignment. No open RFQ. Only the selected manufacturer will view this quotation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignQuoteModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {assignQuoteModal.projectName || 'Quotation Request'}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Order: {assignQuoteModal.quantity || 1} units ({assignQuoteModal.orderType || 'bulk'}) • Fundraiser: {assignQuoteModal.owner?.fullName || 'Fundraiser'}
                </span>
              </div>

              <div>
                <label className="font-bold block text-slate-900 dark:text-white mb-1.5">
                  Select Qualified Manufacturing Partner *
                </label>
                <select
                  value={targetManufacturerId}
                  onChange={(e) => setTargetManufacturerId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Choose Manufacturer --</option>
                  {manufacturers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.specialties?.join(', ') || 'Apparel'}) • {m.companyName || m.contactPerson}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block text-slate-900 dark:text-white mb-1.5">
                  Admin Internal Instructions / Notes for Manufacturer
                </label>
                <textarea
                  rows={3}
                  value={assignAdminNotes}
                  onChange={(e) => setAssignAdminNotes(e.target.value)}
                  placeholder="e.g., Fast-track sample timeline, check stitch count on chenille logo..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssignQuoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignQuotation}
                disabled={updatingQuote || !targetManufacturerId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-xs"
              >
                {updatingQuote ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Cancel / Strike Quotation Modal */}
      {cancelQuoteModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" /> Cancel / Strike Quotation
              </h3>
              <button
                type="button"
                onClick={() => setCancelQuoteModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to cancel this quotation request before production starts? The fundraiser and manufacturer will be notified.
              </p>

              <div>
                <label className="font-bold block text-slate-900 dark:text-white mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Unclear artwork dimensions, duplicate request, fabric out of season..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancelQuoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelQuotation}
                disabled={updatingQuote}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                {updatingQuote ? 'Cancelling...' : 'Confirm Strike / Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Quotation Detail & Techpack Inspection Modal */}
      {selectedQuoteDetail && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedQuoteDetail.projectName || 'Quotation Technical Spec Sheet'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fundraiser: {selectedQuoteDetail.owner?.fullName || 'Fundraiser User'} • Status: {selectedQuoteDetail.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Attached Tech Pack Drawing</span>
                {selectedQuoteDetail.techPackImage ? (
                  <img
                    src={selectedQuoteDetail.techPackImage}
                    alt="Attached Techpack"
                    className="max-h-56 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-slate-400">Attached Tech Pack Drawing</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fabric</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedQuoteDetail.designSpec?.fabrics?.[0]?.name || 'Double Knit'} ({selectedQuoteDetail.designSpec?.fabrics?.[0]?.gsm || 300} GSM)
                  </p>
                  <p className="text-slate-500 mt-0.5">{selectedQuoteDetail.designSpec?.fabrics?.[0]?.composition}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Type & Quantity</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedQuoteDetail.quantity || 1} units ({selectedQuoteDetail.orderType || 'bulk'})
                  </p>
                  <p className="text-slate-500 mt-0.5">FOB Sialkot + Courier Delivery</p>
                </div>
              </div>

              {selectedQuoteDetail.designSpec?.decorations?.length > 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Decorations / Logos</span>
                  <div className="space-y-1">
                    {selectedQuoteDetail.designSpec.decorations.map((d, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{d.name || d.type} ({d.placement})</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{d.techniqueLabel || d.type} • {d.width_in || 12}"×{d.height_in || 4.5}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturer Proposal Breakdown (If Submitted) */}
              {selectedQuoteDetail.manufacturerProposal && (
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      Manufacturer Quotation Proposal & Margin Breakdown
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold font-mono">
                      {selectedQuoteDetail.manufacturerProposal.marginPercent}% Gross Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Unit Landed Price</span>
                      <strong className="text-emerald-600 font-mono text-sm font-black">
                        ${selectedQuoteDetail.manufacturerProposal.landedUnitUsd} USD
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Factory Margin Amount</span>
                      <strong className="text-cyan-600 font-mono text-sm font-black">
                        PKR {formatCurrency(selectedQuoteDetail.manufacturerProposal.marginAmountPkr)}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Batch Landed Total</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm font-black">
                        ${selectedQuoteDetail.manufacturerProposal.totalPriceUsd} USD
                      </strong>
                    </div>
                  </div>

                  {selectedQuoteDetail.manufacturerProposal.customNotes && (
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{selectedQuoteDetail.manufacturerProposal.customNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                {selectedQuoteDetail.status === 'production_started' ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Production Active
                  </span>
                ) : selectedQuoteDetail.status === 'accepted_by_fundraiser' || selectedQuoteDetail.status === 'manufacturer_proposal_sent' ? (
                  <button
                    type="button"
                    onClick={() => handleStartProduction(selectedQuoteDetail._id)}
                    disabled={updatingQuote}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch Production Run</span>
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuoteDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Chat Oversight Modal */}
      {adminChatQuotation && (
        <QuotationChatModal
          quotation={adminChatQuotation}
          onClose={() => setAdminChatQuotation(null)}
        />
      )}
    </div>
  );
}
