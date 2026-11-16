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
  manufacturers = [],
  techpacks = [],
  orders = [],
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('partners');
              setSubFilter('partners');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'partners'
                ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'techpacks'
                ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'production'
                ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'shipping'
                ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'quotations'
                ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
            }`}
          >
            <Calculator size={15} />
            <span>Quotation Assignments</span>
            {adminQuotations?.filter((q) => ['submitted_to_admin', 'submitted_for_review'].includes(q.status)).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#10182b] text-white text-[10px] font-bold">
                {adminQuotations.filter((q) => ['submitted_to_admin', 'submitted_for_review'].includes(q.status)).length}
              </span>
            )}
          </button>
        </div>

        {currentTab === 'partners' && (
          <button
            onClick={() => setNewManModal(true)}
            className="self-start sm:self-auto px-4 py-2 bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
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
              className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#89ca2e]/15 text-[#367c35] font-bold flex items-center justify-center text-sm border border-[#89ca2e]/30">
                    <Factory size={20} />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'active'
                        ? 'bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#10182b] mb-0.5">{m.name}</h3>
                <p className="text-xs text-[#64748b] mb-3">{m.companyName}</p>

                <div className="space-y-1.5 text-xs text-[#64748b] mb-4">
                  <p>
                    <span className="text-[#10182b] font-medium">Contact:</span> {m.contactPerson} ({m.phone})
                  </p>
                  <p>
                    <span className="text-[#10182b] font-medium">Email:</span> {m.email}
                  </p>
                  <p>
                    <span className="text-[#10182b] font-medium">Location:</span> {m.address}
                  </p>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {m.specialties?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scorecard Box */}
              <div className="pt-3 border-t border-[#e5e9e3] grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#64748b] block">On-Time Rate</span>
                  <span className="font-bold text-[#367c35]">
                    {m.performance?.onTimeDeliveryRate || 98}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] block">Quality Score</span>
                  <span className="font-bold text-[#10182b] flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>{m.performance?.qualityScore || 4.9}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] block">Active Queue</span>
                  <span className="font-bold text-[#10182b]">{m.activeOrdersCount || 12}</span>
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
                className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Preview Image */}
                  <div className="h-40 w-full rounded-xl overflow-hidden bg-[#f7f9f5] border border-[#e5e9e3] mb-3 relative group">
                    {tp.previewImages && tp.previewImages[0] ? (
                      <img
                        src={tp.previewImages[0]}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#64748b]">
                        <FileText size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tp.status === 'approved'
                            ? 'bg-[#89ca2e] text-[#10182b]'
                            : tp.status === 'revision_requested'
                            ? 'bg-amber-500 text-white'
                            : 'bg-[#10182b] text-white'
                        }`}
                      >
                        {tp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-[#10182b] mb-0.5">{tp.title}</h4>
                  <p className="text-xs text-[#367c35] font-semibold mb-2">{tp.campaign?.title}</p>
                  <p className="text-[11px] text-[#64748b]">Version: {tp.version} &bull; Designer: {tp.designer?.fullName}</p>

                  {/* Assigned Manufacturer */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-xs">
                    <span className="text-[10px] text-[#64748b] block">Assigned Manufacturer</span>
                    <span className="font-semibold text-[#10182b]">
                      {tp.assignedManufacturer?.name || 'Unassigned — Pending Selection'}
                    </span>
                  </div>

                  {tp.revisionNotes && (
                    <p className="text-xs text-amber-800 mt-2 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                      <strong>Revision Note:</strong> {tp.revisionNotes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#e5e9e3] flex items-center justify-between mt-4">
                  <button
                    onClick={() => setSelectedTechpack(tp)}
                    className="px-3 py-1.5 rounded-lg border border-[#e5e9e3] text-[#10182b] hover:bg-[#f7f9f5] font-semibold text-xs transition-colors"
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
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-colors"
                      >
                        Revise
                      </button>
                      <button
                        onClick={() => {
                          setTechpackActionModal({ tp, action: 'approve' });
                          setAssignedManId(tp.assignedManufacturer?._id || manufacturers[0]?._id || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-xs shadow-xs transition-colors"
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
                className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e5e9e3]">
                  <span className="font-bold text-xs text-[#10182b] uppercase tracking-wider">
                    {st.replace('_', ' ')}
                  </span>
                  <span className="h-5 w-5 rounded-full bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] text-[10px] font-bold flex items-center justify-center">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colOrders.length > 0 ? (
                    colOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-3.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#64748b]">
                          <span>{ord.invoiceNumber || ord._id.slice(-6)}</span>
                          <span className="text-[#367c35] font-sans">{ord.assignedManufacturer?.name?.split(' ')[0] || 'Apex'}</span>
                        </div>

                        <p className="font-bold text-xs text-[#10182b]">
                          {ord.products?.[0]?.name} x {ord.products?.[0]?.quantity}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate">{ord.campaignId?.title}</p>

                        {/* Status Change Selector */}
                        <div className="pt-2 border-t border-[#e5e9e3] flex items-center justify-between">
                          <span className="text-[10px] text-[#64748b]">Move state:</span>
                          <select
                            value={ord.productionStatus || 'waiting'}
                            onChange={(e) => handleProductionStatusChange(ord._id, e.target.value)}
                            className="text-[10px] font-semibold bg-white border border-[#e5e9e3] rounded-md px-2 py-0.5 text-[#10182b] focus:outline-hidden focus:border-[#89ca2e]"
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
                    <div className="py-8 text-center text-[#64748b] text-xs italic">
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
        <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f9f5] border-b border-[#e5e9e3] text-[#64748b] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Merchandise Items</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-[#f7f9f5]/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#10182b]">
                    {o.invoiceNumber || 'INV-2026'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#10182b]">{o.customerId?.fullName}</span>
                    <p className="text-[#64748b] text-[11px]">{o.shippingAddress?.city}, {o.shippingAddress?.country}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {o.products?.map((p, idx) => (
                      <span key={idx} className="block text-[11px]">
                        {p.name} ({p.quantity}x) {p.size ? `• ${p.size}` : ''}
                      </span>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#10182b]">
                    {o.carrier || 'TCS Express Logistics'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#367c35] font-bold">
                    {o.trackingNumber || 'Pending Tracking'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
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
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#10182b] mb-1 capitalize">
              {techpackActionModal.action === 'approve'
                ? 'Approve & Dispatch Techpack to Manufacturer'
                : 'Request Designer Revision'}
            </h3>
            <p className="text-xs text-[#64748b] mb-4">
              Techpack: <strong className="text-[#10182b]">{techpackActionModal.tp.title}</strong>
            </p>

            {techpackActionModal.action === 'approve' && (
              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="font-semibold text-[#10182b] block mb-1">
                    Select Manufacturer Partner
                  </label>
                  <select
                    value={assignedManId}
                    onChange={(e) => setAssignedManId(e.target.value)}
                    className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl focus:border-[#89ca2e] text-[#10182b] focus:outline-hidden"
                  >
                    {manufacturers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.specialties?.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#10182b] block mb-1">
                    Approval Notes for Manufacturer
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Standard 320 GSM brushed fleece sample cleared for production."
                    className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl focus:border-[#89ca2e] text-[#10182b] placeholder-[#64748b] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {techpackActionModal.action === 'revision' && (
              <div className="space-y-1.5 mb-5 text-xs">
                <label className="font-semibold text-[#10182b]">
                  Revision Request Details (For Designer)
                </label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Specify measurements, colorway changes, or print dimension corrections needed..."
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl focus:border-amber-500 text-[#10182b] placeholder-[#64748b] focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTechpackActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTechpackAction}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] shadow-xs transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Techpack Detail Inspection Modal */}
      {selectedTechpack && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-[#e5e9e3] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#10182b]">
                  {selectedTechpack.title}
                </h3>
                <p className="text-xs text-[#64748b]">
                  Version {selectedTechpack.version} &bull; {selectedTechpack.campaign?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedTechpack(null)}
                className="p-1.5 text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] rounded-lg transition-colors"
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
                      className="h-32 w-full object-cover rounded-xl border border-[#e5e9e3]"
                    />
                  ))}
                </div>
              )}

              {/* Spec Files */}
              <div>
                <span className="font-bold block text-[#10182b] mb-2">Technical Specification Files:</span>
                {selectedTechpack.files?.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                    <span className="font-semibold text-[#10182b]">{f.name}</span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#367c35] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Download Spec</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#e5e9e3] flex justify-end">
              <button
                onClick={() => setSelectedTechpack(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] hover:bg-[#e5e9e3] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manufacturer Modal */}
      {newManModal && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateManufacturer}
            className="bg-white border border-[#e5e9e3] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-base font-bold text-[#10182b] mb-4">
              Add Manufacturing Partner
            </h3>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="font-semibold block mb-1 text-[#10182b]">Partner / Brand Name</label>
                <input
                  required
                  type="text"
                  value={newManForm.name}
                  onChange={(e) => setNewManForm({ ...newManForm, name: e.target.value })}
                  placeholder="e.g. Apex Textile Mills"
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-[#10182b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#10182b]">Contact Person</label>
                <input
                  required
                  type="text"
                  value={newManForm.contactPerson}
                  onChange={(e) => setNewManForm({ ...newManForm, contactPerson: e.target.value })}
                  placeholder="e.g. Zubair Qureshi"
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-[#10182b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#10182b]">Email</label>
                <input
                  required
                  type="email"
                  value={newManForm.email}
                  onChange={(e) => setNewManForm({ ...newManForm, email: e.target.value })}
                  placeholder="contact@manufacturer.pk"
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-[#10182b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#10182b]">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={newManForm.specialties}
                  onChange={(e) => setNewManForm({ ...newManForm, specialties: e.target.value })}
                  className="w-full p-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-[#10182b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNewManModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] shadow-xs transition-colors"
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
          <div className="p-5 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] shrink-0 border border-[#89ca2e]/30">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#10182b]">
                  Admin Quotation Assignment Workflow (No Open RFQ Bidding)
                </h3>
                <p className="text-xs text-[#64748b] mt-1 max-w-3xl">
                  Fundraisers submit draft quotations for review. As Admin, evaluate the extracted tech pack specs, select exactly <strong>one</strong> qualified manufacturer partner, or cancel/strike the request prior to production.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminQuotations}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#e5e9e3] hover:bg-[#f7f9f5] text-[#10182b] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#367c35]" />
                <span>Refresh Quotes</span>
              </button>
            </div>
          </div>

          {/* Filter Status Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#e5e9e3]">
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
                    ? 'bg-[#89ca2e] text-[#10182b] font-bold shadow-xs'
                    : 'bg-white text-[#64748b] border border-[#e5e9e3] hover:text-[#10182b] hover:bg-[#f7f9f5]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Quotations List */}
          {loadingQuotations ? (
            <div className="p-12 text-center text-xs text-[#64748b] bg-white rounded-2xl border border-[#e5e9e3]">
              Loading quotation requests...
            </div>
          ) : adminQuotations.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748b] bg-white rounded-2xl border border-[#e5e9e3]">
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
                    className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e5e9e3]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                                quote.status === 'submitted_to_admin' || quote.status === 'submitted_for_review'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : quote.status === 'assigned_to_manufacturer'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : quote.status === 'production_started'
                                  ? 'bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30'
                                  : quote.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-[#f7f9f5] text-[#64748b] border border-[#e5e9e3]'
                              }`}
                            >
                              Status: {quote.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-[#64748b] font-mono">
                              {quote.orderType === 'sample' ? 'Sample' : 'Bulk'} • {quote.quantity || 1} units
                            </span>
                          </div>
                          <h4 className="font-bold text-[#10182b] text-base">
                            {quote.projectName || quote.designSpec?.garment?.style || 'Custom Apparel Quote'}
                          </h4>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            Fundraiser: <strong className="text-[#10182b]">{quote.owner?.fullName || quote.owner?.email || 'Fundraiser User'}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#64748b] block uppercase">Draft Total</span>
                          <span className="text-sm font-black font-mono text-[#367c35]">
                            ${((Number(quote.calculation?.totals?.landedUnitUsd) || 45) * (quote.quantity || 1)).toFixed(2)} USD
                          </span>
                          <span className="text-[10px] text-[#64748b] block">
                            ${quote.calculation?.totals?.landedUnitUsd || '45.00'}/unit
                          </span>
                        </div>
                      </div>

                      {/* Attached Techpack Mockup + Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 rounded-xl overflow-hidden border border-[#e5e9e3] bg-[#f7f9f5] flex items-center justify-center min-h-[90px] relative">
                          {quote.techPackImage ? (
                            <img
                              src={quote.techPackImage}
                              alt="Attached Tech Pack"
                              className="w-full h-24 object-contain p-1"
                            />
                          ) : (
                            <div className="p-2 text-center text-[#64748b] text-[10px]">
                              <FileText className="w-6 h-6 mx-auto mb-1 text-[#64748b]" />
                              <span>Tech Pack</span>
                            </div>
                          )}
                        </div>

                        <div className="col-span-2 space-y-1 text-xs">
                          <p className="text-[#64748b]">
                            <strong className="text-[#10182b]">Fabric:</strong> {quote.designSpec?.fabrics?.[0]?.name || 'Double Knit Fabric'} ({quote.designSpec?.fabrics?.[0]?.gsm || 300} GSM)
                          </p>
                          <p className="text-[#64748b]">
                            <strong className="text-[#10182b]">Decorations:</strong> {quote.designSpec?.decorations?.length || 0} logos detected
                          </p>
                          <p className="text-[#64748b] truncate">
                            <strong className="text-[#10182b]">Ship To:</strong> {quote.shippingAddress?.city || 'Lahore'}, {quote.shippingAddress?.country || 'Pakistan'}
                          </p>
                          <div className="pt-1">
                            <span className="text-[10px] text-[#64748b] uppercase font-bold block">Assigned Manufacturer:</span>
                            {quote.assignedManufacturer ? (
                              <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                {quote.assignedManufacturer.name || quote.assignedManufacturer.companyName || 'Assigned Factory'}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-700">
                                ⚠ Unassigned (Awaiting Admin Selection)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {quote.cancelledReason && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                          <strong>Cancellation Reason:</strong> {quote.cancelledReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-[#e5e9e3] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteDetail(quote)}
                          className="px-3 py-1.5 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] hover:bg-[#e5e9e3] text-[#10182b] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#64748b]" /> Specs
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminChatQuotation(quote)}
                          className="px-3 py-1.5 rounded-xl bg-[#89ca2e]/15 border border-[#89ca2e]/30 hover:bg-[#89ca2e]/25 text-[#367c35] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Admin Chat Oversight"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#367c35]" /> Chat
                        </button>

                        {quote.status !== 'cancelled' && quote.status !== 'production_started' && quote.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelQuoteModal(quote);
                              setCancelReason('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
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
                          className="px-3.5 py-1.5 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
              <div>
                <h3 className="text-base font-bold text-[#10182b] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#367c35]" />
                  Assign Quotation to Manufacturer
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Direct assignment. No open RFQ. Only the selected manufacturer will view this quotation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignQuoteModal(null)}
                className="p-1 rounded-lg text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]">
                <span className="font-bold text-[#10182b] block">
                  {assignQuoteModal.projectName || 'Quotation Request'}
                </span>
                <span className="text-[#64748b] block mt-0.5">
                  Order: {assignQuoteModal.quantity || 1} units ({assignQuoteModal.orderType || 'bulk'}) • Fundraiser: {assignQuoteModal.owner?.fullName || 'Fundraiser'}
                </span>
              </div>

              <div>
                <label className="font-bold block text-[#10182b] mb-1.5">
                  Select Qualified Manufacturing Partner *
                </label>
                <select
                  value={targetManufacturerId}
                  onChange={(e) => setTargetManufacturerId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] font-medium focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
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
                <label className="font-bold block text-[#10182b] mb-1.5">
                  Admin Internal Instructions / Notes for Manufacturer
                </label>
                <textarea
                  rows={3}
                  value={assignAdminNotes}
                  onChange={(e) => setAssignAdminNotes(e.target.value)}
                  placeholder="e.g., Fast-track sample timeline, check stitch count on chenille logo..."
                  className="w-full p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] focus:border-[#89ca2e] focus:bg-white focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e9e3]">
              <button
                type="button"
                onClick={() => setAssignQuoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignQuotation}
                disabled={updatingQuote || !targetManufacturerId}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] hover:bg-[#7ab828] disabled:opacity-50 text-[#10182b] shadow-xs transition-colors"
              >
                {updatingQuote ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Cancel / Strike Quotation Modal */}
      {cancelQuoteModal && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Ban className="w-5 h-5" /> Cancel / Strike Quotation
              </h3>
              <button
                type="button"
                onClick={() => setCancelQuoteModal(null)}
                className="p-1 rounded-lg text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#64748b]">
                Are you sure you want to cancel this quotation request before production starts? The fundraiser and manufacturer will be notified.
              </p>

              <div>
                <label className="font-bold block text-[#10182b] mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Unclear artwork dimensions, duplicate request, fabric out of season..."
                  className="w-full p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] placeholder-[#64748b] focus:border-rose-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e9e3]">
              <button
                type="button"
                onClick={() => setCancelQuoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelQuotation}
                disabled={updatingQuote}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
              >
                {updatingQuote ? 'Cancelling...' : 'Confirm Strike / Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Quotation Detail & Techpack Inspection Modal */}
      {selectedQuoteDetail && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#e5e9e3] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#10182b]">
                  {selectedQuoteDetail.projectName || 'Quotation Technical Spec Sheet'}
                </h3>
                <p className="text-xs text-[#64748b]">
                  Fundraiser: {selectedQuoteDetail.owner?.fullName || 'Fundraiser User'} • Status: {selectedQuoteDetail.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteDetail(null)}
                className="p-1 rounded-lg text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#f7f9f5] p-4 rounded-2xl border border-[#e5e9e3] text-center">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-2">Attached Tech Pack Drawing</span>
                {selectedQuoteDetail.techPackImage ? (
                  <img
                    src={selectedQuoteDetail.techPackImage}
                    alt="Attached Techpack"
                    className="max-h-56 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-[#64748b]">Attached Tech Pack Drawing</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Fabric</span>
                  <p className="font-bold text-[#10182b] mt-0.5">
                    {selectedQuoteDetail.designSpec?.fabrics?.[0]?.name || 'Double Knit'} ({selectedQuoteDetail.designSpec?.fabrics?.[0]?.gsm || 300} GSM)
                  </p>
                  <p className="text-[#64748b] mt-0.5">{selectedQuoteDetail.designSpec?.fabrics?.[0]?.composition}</p>
                </div>

                <div className="p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block">Order Type & Quantity</span>
                  <p className="font-bold text-[#10182b] mt-0.5">
                    {selectedQuoteDetail.quantity || 1} units ({selectedQuoteDetail.orderType || 'bulk'})
                  </p>
                  <p className="text-[#64748b] mt-0.5">FOB Sialkot + Courier Delivery</p>
                </div>
              </div>

              {selectedQuoteDetail.designSpec?.decorations?.length > 0 && (
                <div className="p-3.5 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-2">Decorations / Logos</span>
                  <div className="space-y-1">
                    {selectedQuoteDetail.designSpec.decorations.map((d, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-[#e5e9e3]">
                        <span className="font-semibold text-[#10182b]">{d.name || d.type} ({d.placement})</span>
                        <span className="font-mono text-[#367c35]">{d.techniqueLabel || d.type} • {d.width_in || 12}"×{d.height_in || 4.5}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturer Proposal Breakdown (If Submitted) */}
              {selectedQuoteDetail.manufacturerProposal && (
                <div className="p-4 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#89ca2e]/30">
                    <h4 className="font-bold text-[#10182b] flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-[#367c35]" />
                      Manufacturer Quotation Proposal & Margin Breakdown
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#89ca2e]/20 text-[#367c35] font-bold font-mono">
                      {selectedQuoteDetail.manufacturerProposal.marginPercent}% Gross Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] block">Unit Landed Price</span>
                      <strong className="text-[#367c35] font-mono text-sm font-black">
                        ${selectedQuoteDetail.manufacturerProposal.landedUnitUsd} USD
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] block">Factory Margin Amount</span>
                      <strong className="text-[#10182b] font-mono text-sm font-black">
                        PKR {formatCurrency(selectedQuoteDetail.manufacturerProposal.marginAmountPkr)}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] block">Batch Landed Total</span>
                      <strong className="text-[#10182b] font-mono text-sm font-black">
                        ${selectedQuoteDetail.manufacturerProposal.totalPriceUsd} USD
                      </strong>
                    </div>
                  </div>

                  {selectedQuoteDetail.manufacturerProposal.customNotes && (
                    <p className="text-[#64748b] text-[11px] italic bg-white p-2.5 rounded-xl border border-[#e5e9e3]">
                      "{selectedQuoteDetail.manufacturerProposal.customNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e5e9e3] flex items-center justify-between">
              <div>
                {selectedQuoteDetail.status === 'production_started' ? (
                  <span className="text-xs font-bold text-[#367c35] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Production Active
                  </span>
                ) : selectedQuoteDetail.status === 'accepted_by_fundraiser' || selectedQuoteDetail.status === 'manufacturer_proposal_sent' ? (
                  <button
                    type="button"
                    onClick={() => handleStartProduction(selectedQuoteDetail._id)}
                    disabled={updatingQuote}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#f7f9f5] border border-[#e5e9e3] hover:bg-[#e5e9e3] text-[#10182b] transition-colors"
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
