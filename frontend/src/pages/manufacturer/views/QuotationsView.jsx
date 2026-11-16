import { useState, useMemo } from 'react';
import {
  Calculator,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Send,
  Sparkles,
  DollarSign,
  TrendingUp,
  Truck,
  MapPin,
  Layers,
  Scissors,
  Package,
  Check,
  ChevronRight,
  Info,
  Maximize2,
  X,
  RefreshCw,
  Plus,
  Trash2,
  ShieldCheck,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import api from '../../../api/client';
import { formatCurrency } from '../../../utils/format';
import QuotationChatModal from '../../../components/QuotationChatModal';

const USD_EXCHANGE_RATE = 280;

export default function QuotationsView({ quotations = [], onRefresh }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [activeChatQuotation, setActiveChatQuotation] = useState(null);
  const [imageModalUrl, setImageModalUrl] = useState(null);
  const [savingAction, setSavingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // --------------------------------------------------------------------------
  // Quotation Editor State (Synchronized with Selected Quotation)
  // --------------------------------------------------------------------------
  const [marginPercent, setMarginPercent] = useState(30);
  const [leadTimeDays, setLeadTimeDays] = useState(14);
  const [sampleAvailable, setSampleAvailable] = useState(true);
  const [manufacturerNotes, setManufacturerNotes] = useState('');

  // Rates in PKR
  const [costRates, setCostRates] = useState({
    fabricCost: 1400,
    stitchingCost: 1200,
    embroideryCost: 1800,
    trimsCost: 350,
    shippingCost: 800,
    overheadCost: 450,
  });

  // Itemized line items
  const [itemPricing, setItemPricing] = useState([]);

  // Initialize editor when opening a quote
  const handleOpenReviewModal = (quote) => {
    setSelectedQuote(quote);
    setActionSuccess('');
    setActionError('');

    // Pre-fill from existing manufacturerProposal or calculation
    if (quote.manufacturerProposal) {
      const prop = quote.manufacturerProposal;
      setMarginPercent(Number(prop.marginPercent) || 30);
      setLeadTimeDays(Number(prop.estimatedLeadDays) || 14);
      setSampleAvailable(prop.sampleAvailable !== false);
      setManufacturerNotes(prop.customNotes || quote.manufacturerNotes || '');
      if (prop.costBreakdown) {
        setCostRates({
          fabricCost: Number(prop.costBreakdown.fabricCost) || 1400,
          stitchingCost: Number(prop.costBreakdown.stitchingCost) || 1200,
          embroideryCost: Number(prop.costBreakdown.embroideryCost) || 1800,
          trimsCost: Number(prop.costBreakdown.trimsCost) || 350,
          shippingCost: Number(prop.costBreakdown.shippingCost) || 800,
          overheadCost: Number(prop.costBreakdown.overheadCost) || 450,
        });
      }
      if (Array.isArray(prop.itemPricing) && prop.itemPricing.length > 0) {
        setItemPricing(prop.itemPricing);
      } else {
        generateDefaultItemPricing(quote);
      }
    } else {
      // Derive from initial deterministic calculation
      const lines = quote.calculation?.lines || [];
      const fab = lines.filter((l) => l.category === 'fabric').reduce((s, l) => s + l.amount, 0) || 1400;
      const cmt = lines.filter((l) => l.category === 'construction').reduce((s, l) => s + l.amount, 0) || 1200;
      const emb = lines.filter((l) => l.category === 'embellishment').reduce((s, l) => s + l.amount, 0) || 1800;
      const trm = lines.filter((l) => l.category === 'trim').reduce((s, l) => s + l.amount, 0) || 350;
      const ovh = lines.filter((l) => l.category === 'fixed').reduce((s, l) => s + l.amount, 0) || 450;
      const shp = (quote.calculation?.totals?.shippingUnitUsd ? quote.calculation.totals.shippingUnitUsd * USD_EXCHANGE_RATE : 800) || 800;

      setCostRates({
        fabricCost: Math.round(fab),
        stitchingCost: Math.round(cmt),
        embroideryCost: Math.round(emb),
        trimsCost: Math.round(trm),
        shippingCost: Math.round(shp),
        overheadCost: Math.round(ovh),
      });
      setMarginPercent(30);
      setLeadTimeDays(quote.orderType === 'sample' ? 7 : 18);
      setSampleAvailable(true);
      setManufacturerNotes(quote.manufacturerNotes || 'Fabric milled in Sialkot. Premium stitching with high-density embroidery.');
      generateDefaultItemPricing(quote, { fab, cmt, emb, trm, shp, ovh });
    }
  };

  const generateDefaultItemPricing = (quote, precalculated = null) => {
    const spec = quote.designSpec || {};
    const decs = spec.decorations || [];
    const fabricName = spec.fabrics?.[0]?.name || '300 GSM Double Knit Cotton';

    const items = [
      {
        id: 'item-fabric-1',
        name: `Main Fabric: ${fabricName}`,
        category: 'Fabric',
        unitCostPkr: precalculated?.fab || 1400,
        qty: 1,
      },
      {
        id: 'item-cmt-1',
        name: `Garment CMT & Tailoring (${spec.garment?.type || 'Apparel'})`,
        category: 'Stitching',
        unitCostPkr: precalculated?.cmt || 1200,
        qty: 1,
      },
    ];

    if (decs.length > 0) {
      decs.forEach((d, idx) => {
        items.push({
          id: `item-deco-${idx}`,
          name: `${d.placement || 'Front'} ${d.type || 'Embellishment'} (${d.width_in || 10}"×${d.height_in || 4}")`,
          category: 'Embroidery',
          unitCostPkr: Math.round((precalculated?.emb || 1800) / decs.length),
          qty: 1,
        });
      });
    } else {
      items.push({
        id: 'item-deco-0',
        name: 'Embroidery & Embellishments Package',
        category: 'Embroidery',
        unitCostPkr: precalculated?.emb || 1800,
        qty: 1,
      });
    }

    items.push({
      id: 'item-trims-1',
      name: 'Ribbed Cuffs, Buttons & Woven Care Tags',
      category: 'Trims',
      unitCostPkr: precalculated?.trm || 350,
      qty: 1,
    });

    items.push({
      id: 'item-overhead-1',
      name: 'Grading, Pattern Setup & Energy Overhead',
      category: 'Overhead',
      unitCostPkr: precalculated?.ovh || 450,
      qty: 1,
    });

    items.push({
      id: 'item-shipping-1',
      name: `International Air Courier (${quote.shippingAddress?.city || 'Export'})`,
      category: 'Shipping',
      unitCostPkr: precalculated?.shp || 800,
      qty: 1,
    });

    setItemPricing(items);
  };

  // --------------------------------------------------------------------------
  // Dynamic Real-Time Calculations (Recalculates automatically when rates/margin change)
  // --------------------------------------------------------------------------
  const calculatedProposal = useMemo(() => {
    if (!selectedQuote) return null;

    const qty = Number(selectedQuote.quantity) || 1;
    const { fabricCost, stitchingCost, embroideryCost, trimsCost, shippingCost, overheadCost } = costRates;

    const subtotalCostPkr =
      Number(fabricCost || 0) +
      Number(stitchingCost || 0) +
      Number(embroideryCost || 0) +
      Number(trimsCost || 0) +
      Number(shippingCost || 0) +
      Number(overheadCost || 0);

    const marginPct = Number(marginPercent) || 0;
    const marginAmountPkr = Math.round(subtotalCostPkr * (marginPct / 100));
    const finalTotalUnitPkr = subtotalCostPkr + marginAmountPkr;
    const finalTotalBatchPkr = finalTotalUnitPkr * qty;

    const landedUnitUsd = +(finalTotalUnitPkr / USD_EXCHANGE_RATE).toFixed(2);
    const totalPriceUsd = +(landedUnitUsd * qty).toFixed(2);
    const profitTotalUsd = +((marginAmountPkr * qty) / USD_EXCHANGE_RATE).toFixed(2);

    return {
      subtotalCostPkr,
      marginPercent: marginPct,
      marginAmountPkr,
      finalTotalUnitPkr,
      finalTotalBatchPkr,
      landedUnitUsd,
      totalPriceUsd,
      profitTotalUsd,
      costBreakdown: {
        fabricCost: Number(fabricCost || 0),
        stitchingCost: Number(stitchingCost || 0),
        embroideryCost: Number(embroideryCost || 0),
        trimsCost: Number(trimsCost || 0),
        shippingCost: Number(shippingCost || 0),
        overheadCost: Number(overheadCost || 0),
        subtotalCostPkr,
      },
    };
  }, [selectedQuote, costRates, marginPercent]);

  // Handle rate input changes
  const handleRateChange = (field, value) => {
    const val = Number(value) || 0;
    setCostRates((prev) => ({ ...prev, [field]: val }));
  };

  // Submit Proposal to Fundraiser
  const handleSendProposal = async (actionType = 'proposal') => {
    if (!selectedQuote || !calculatedProposal) return;

    try {
      setSavingAction(true);
      setActionError('');
      setActionSuccess('');

      const proposalPayload = {
        costBreakdown: calculatedProposal.costBreakdown,
        itemPricing,
        marginPercent: calculatedProposal.marginPercent,
        marginAmountPkr: calculatedProposal.marginAmountPkr,
        finalTotalPkr: calculatedProposal.finalTotalBatchPkr,
        landedUnitUsd: calculatedProposal.landedUnitUsd,
        totalPriceUsd: calculatedProposal.totalPriceUsd,
        estimatedLeadDays: Number(leadTimeDays) || 14,
        sampleAvailable,
        customNotes: manufacturerNotes,
        submittedAt: new Date().toISOString(),
      };

      await api.post(`/quotations/${selectedQuote._id}/manufacturer-response`, {
        action: actionType, // 'proposal' or 'review'
        notes: manufacturerNotes,
        proposal: proposalPayload,
      });

      setActionSuccess(
        actionType === 'proposal'
          ? 'Finalized quotation proposal dispatched to fundraiser!'
          : 'Quotation marked as Under Review by Manufacturer.'
      );

      if (onRefresh) onRefresh();

      setTimeout(() => {
        if (actionType === 'proposal') {
          setSelectedQuote(null);
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to submit proposal:', err);
      setActionError(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSavingAction(false);
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) {
      if (statusFilter === 'pending' && !['assigned_to_manufacturer', 'manufacturer_reviewing'].includes(q.status)) {
        return false;
      }
      if (statusFilter !== 'pending' && q.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const qry = search.toLowerCase();
      const matchTitle = (q.projectName || q.designSpec?.garment?.style || '').toLowerCase().includes(qry);
      const matchOwner = (q.owner?.fullName || q.owner?.email || '').toLowerCase().includes(qry);
      const matchCity = (q.shippingAddress?.city || '').toLowerCase().includes(qry);
      if (!matchTitle && !matchOwner && !matchCity) return false;
    }
    return true;
  });

  // KPI Metrics
  const metrics = {
    total: quotations.length,
    pendingAction: quotations.filter((q) => ['assigned_to_manufacturer', 'manufacturer_reviewing'].includes(q.status)).length,
    proposalSent: quotations.filter((q) => q.status === 'manufacturer_proposal_sent').length,
    accepted: quotations.filter((q) => ['accepted_by_fundraiser', 'production_started', 'completed'].includes(q.status)).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#10182b] via-[#16243d] to-[#367c35] border border-[#1e2a42] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#89ca2e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-white/10 text-[#89ca2e] border border-white/20 shadow-sm">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#89ca2e] bg-[#89ca2e]/15 border border-[#89ca2e]/30 px-3 py-1 rounded-full">
                Manufacturer Quotation Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Assigned Quotation Requests
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Admin-assigned direct quotation requests. Inspect tech packs, configure component rates, dial in custom margins with real-time recalculation, and dispatch finalized proposals.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#10182b]" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] text-xs font-medium mb-1">
            <span>Total Assigned Quotes</span>
            <FileText className="w-4 h-4 text-[#0ea5c6]" />
          </div>
          <div className="text-2xl font-black text-[#10182b]">{metrics.total}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Direct from Platform Admin</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium mb-1">
            <span>Needs Proposal Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.pendingAction}</div>
          <div className="text-[11px] text-amber-600 mt-1">Awaiting your costing</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-medium mb-1">
            <span>Proposals Dispatched</span>
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700">{metrics.proposalSent}</div>
          <div className="text-[11px] text-indigo-600 mt-1">Under fundraiser review</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#89ca2e]/40 shadow-xs">
          <div className="flex items-center justify-between text-[#367c35] text-xs font-medium mb-1">
            <span>Accepted & In Production</span>
            <CheckCircle2 className="w-4 h-4 text-[#367c35]" />
          </div>
          <div className="text-2xl font-black text-[#367c35]">{metrics.accepted}</div>
          <div className="text-[11px] text-[#367c35] mt-1">Production approved</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#e5e9e3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Quotes' },
            { id: 'pending', label: 'Pending Proposal' },
            { id: 'manufacturer_proposal_sent', label: 'Proposal Sent' },
            { id: 'accepted_by_fundraiser', label: 'Accepted by Fundraiser' },
            { id: 'production_started', label: 'In Production' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#89ca2e] text-[#10182b] shadow-xs'
                  : 'bg-[#f5f7fb] text-[#64748b] hover:text-[#10182b] hover:bg-[#e5e9e3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search style, fundraiser, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-xs text-[#10182b] placeholder-[#64748b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
          />
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#e5e9e3] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f7fb] flex items-center justify-center mx-auto text-[#64748b]">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#10182b]">No Quotation Requests Found</h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            When Platform Admin assigns a fundraiser draft quotation to your manufacturing facility, it will appear here for cost breakdown and proposal submission.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuotations.map((quote) => {
            const isAssigned = quote.status === 'assigned_to_manufacturer';
            const isReviewing = quote.status === 'manufacturer_reviewing';
            const isProposalSent = quote.status === 'manufacturer_proposal_sent';
            const isAccepted = quote.status === 'accepted_by_fundraiser';
            const isProd = quote.status === 'production_started';

            const landedUnitUsd =
              quote.manufacturerProposal?.landedUnitUsd ||
              quote.calculation?.totals?.landedUnitUsd ||
              45;
            const totalQuoteUsd = (landedUnitUsd * (quote.quantity || 1)).toFixed(2);

            return (
              <div
                key={quote._id}
                className="p-5 rounded-3xl bg-white border border-[#e5e9e3] hover:border-[#89ca2e] transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isAssigned
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isReviewing
                              ? 'bg-[#0ea5c6]/15 text-[#0ea5c6] border border-[#0ea5c6]/30'
                              : isProposalSent
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : isAccepted || isProd
                              ? 'bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30'
                              : 'bg-[#f5f7fb] text-[#64748b] border border-[#e5e9e3]'
                          }`}
                        >
                          {quote.status?.replace(/_/g, ' ')}
                        </span>

                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#f5f7fb] text-[#10182b] border border-[#e5e9e3]">
                          {quote.orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'} • {quote.quantity || 1} units
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#10182b] tracking-tight">
                        {quote.projectName || quote.designSpec?.garment?.style || 'Apparel Quotation'}
                      </h3>
                      <p className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1.5">
                        <span>Fundraiser:</span>
                        <strong className="text-[#10182b]">{quote.owner?.fullName || quote.owner?.email || 'Fundraiser Client'}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold block">Quotation Value</span>
                      <span className="text-base font-black font-mono text-[#367c35]">
                        ${totalQuoteUsd} USD
                      </span>
                      <span className="text-[10px] text-[#64748b] block font-mono">
                        ${landedUnitUsd}/unit
                      </span>
                    </div>
                  </div>

                  {/* Tech Pack Preview & Summary specs */}
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3]">
                    <div
                      onClick={() => quote.techPackImage && setImageModalUrl(quote.techPackImage)}
                      className="col-span-1 rounded-xl overflow-hidden bg-white border border-[#e5e9e3] relative group cursor-pointer flex items-center justify-center min-h-[90px]"
                    >
                      {quote.techPackImage ? (
                        <>
                          <img
                            src={quote.techPackImage}
                            alt="Tech Pack Preview"
                            className="w-full h-24 object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-[#10182b]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </>
                      ) : (
                        <div className="text-[#64748b] text-center p-2 text-[10px]">
                          <FileText className="w-6 h-6 mx-auto mb-1 text-[#64748b]" />
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 space-y-1 text-xs text-[#10182b]">
                      <p className="truncate">
                        <strong className="text-[#10182b]">Fabric:</strong>{' '}
                        {quote.designSpec?.fabrics?.[0]?.name || '300 GSM Double Knit'}
                      </p>
                      <p className="text-[#64748b]">
                        <strong className="text-[#10182b]">Logos / Embellishments:</strong>{' '}
                        {quote.designSpec?.decorations?.length || 0} placement(s)
                      </p>
                      <p className="truncate text-[#64748b]">
                        <strong className="text-[#10182b]">Destination:</strong>{' '}
                        {quote.shippingAddress?.city || 'Lahore'}, {quote.shippingAddress?.country || 'Pakistan'}
                      </p>
                      {quote.manufacturerProposal?.marginPercent && (
                        <p className="text-[#367c35] font-bold">
                          Configured Margin: {quote.manufacturerProposal.marginPercent}% (PKR {formatCurrency(quote.manufacturerProposal.marginAmountPkr)})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes if provided */}
                  {quote.adminNotes && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                      <div>
                        <strong>Admin Direct Note:</strong> {quote.adminNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#64748b]">
                    Created {new Date(quote.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveChatQuotation(quote)}
                      className="px-3 py-2 rounded-xl bg-[#0ea5c6]/10 hover:bg-[#0ea5c6]/20 text-[#0ea5c6] border border-[#0ea5c6]/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0ea5c6]" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => handleOpenReviewModal(quote)}
                      className="px-4 py-2 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{isProposalSent ? 'Edit / Resend Proposal' : 'Cost Breakdown & Margin'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUFACTURER QUOTATION REVIEW & DYNAMIC MARGIN ENGINE */}
      {/* ========================================================================= */}
      {selectedQuote && calculatedProposal && (
        <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 flex flex-col text-[#10182b]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e5e9e3] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#10182b]">
                      Manufacturer Quotation Review
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f5f7fb] text-[#10182b] border border-[#e5e9e3] font-bold">
                      {selectedQuote.orderType === 'sample' ? 'Sample Proto' : 'Bulk Run'} • {selectedQuote.quantity || 1} units
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Project: <strong className="text-[#10182b]">{selectedQuote.projectName || selectedQuote.designSpec?.garment?.style}</strong> &bull; Fundraiser: {selectedQuote.owner?.fullName || 'Fundraiser'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedQuote(null)}
                className="p-2 rounded-xl text-[#64748b] hover:text-[#10182b] hover:bg-[#f5f7fb] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1">
              {actionSuccess && (
                <div className="p-4 rounded-2xl bg-[#89ca2e]/15 border border-[#89ca2e]/40 text-[#367c35] text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-[#367c35] shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Top Section: Specifications & Tech Pack Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Techpack Image Card */}
                <div className="col-span-1 p-4 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-2">
                      Uploaded Tech Pack / Drawing
                    </span>
                    <div
                      onClick={() => selectedQuote.techPackImage && setImageModalUrl(selectedQuote.techPackImage)}
                      className="h-44 w-full rounded-xl overflow-hidden bg-white border border-[#e5e9e3] flex items-center justify-center relative group cursor-pointer"
                    >
                      {selectedQuote.techPackImage ? (
                        <>
                          <img
                            src={selectedQuote.techPackImage}
                            alt="Tech Pack"
                            className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-[#10182b]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                            <Maximize2 className="w-4 h-4" /> Enlarge Tech Pack
                          </div>
                        </>
                      ) : (
                        <div className="text-[#64748b] text-xs text-center">
                          <FileText className="w-8 h-8 mx-auto mb-1 text-[#64748b]" />
                          <span>No Tech Pack Attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-4 pt-4 border-t border-[#e5e9e3] text-xs space-y-1">
                    <span className="text-[10px] text-[#64748b] font-bold uppercase block flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#0ea5c6]" /> Shipping Destination:
                    </span>
                    <p className="text-[#10182b] font-semibold">
                      {selectedQuote.shippingAddress?.fullName || selectedQuote.owner?.fullName || 'Client'}
                    </p>
                    <p className="text-[#64748b] text-[11px]">
                      {selectedQuote.shippingAddress?.line1 || 'Main Delivery Address'}
                    </p>
                    <p className="text-[#64748b] text-[11px]">
                      {selectedQuote.shippingAddress?.city || 'Lahore'}, {selectedQuote.shippingAddress?.country || 'Pakistan'} {selectedQuote.shippingAddress?.postalCode || ''}
                    </p>
                  </div>
                </div>

                {/* Extracted Specs */}
                <div className="col-span-2 p-5 rounded-2xl bg-[#f5f7fb] border border-[#e5e9e3] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e5e9e3]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10182b] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0ea5c6]" /> Extracted Garment Specifications
                    </h3>
                    <span className="text-xs text-[#64748b]">
                      Units: <strong className="text-[#10182b]">{selectedQuote.quantity || 1}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Garment Type</span>
                      <strong className="text-[#10182b] capitalize">{selectedQuote.designSpec?.garment?.type || 'Polo / Jersey'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Fabric GSM</span>
                      <strong className="text-[#10182b]">{selectedQuote.designSpec?.fabrics?.[0]?.gsm || 300} GSM</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Composition</span>
                      <strong className="text-[#10182b] truncate block">{selectedQuote.designSpec?.fabrics?.[0]?.composition || '80% Cotton / 20% Poly'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Reference Size</span>
                      <strong className="text-[#10182b]">{selectedQuote.designSpec?.garment?.size_reference || 'XL (Chest 26.5", Length 29")'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Order Run Type</span>
                      <strong className="text-[#0ea5c6] font-bold uppercase">{selectedQuote.orderType || 'Bulk'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase block">Admin Instructions</span>
                      <strong className="text-indigo-700">{selectedQuote.adminNotes || 'Standard production'}</strong>
                    </div>
                  </div>

                  {/* Identified Embellishments */}
                  <div>
                    <span className="text-[11px] font-bold text-[#64748b] block mb-2">
                      Decorations & Placements ({selectedQuote.designSpec?.decorations?.length || 0}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedQuote.designSpec?.decorations || []).map((dec, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white border border-[#e5e9e3] text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#10182b] capitalize">{dec.placement || 'Front'} {dec.type || 'Embroidery'}</span>
                            <span className="text-[10px] text-[#64748b] block">
                              {dec.width_in || 10}" W × {dec.height_in || 4}" H ({dec.area_sq_in || 40} sq in)
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0ea5c6]/10 text-[#0ea5c6] border border-[#0ea5c6]/30 font-mono">
                            Auto-detected
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* SECTION: RATE EDITOR & DYNAMIC MARGIN CALCULATOR */}
              {/* ============================================================= */}
              <div className="p-6 rounded-3xl bg-[#f5f7fb] border border-[#e5e9e3] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e9e3]">
                  <div>
                    <h3 className="text-base font-black text-[#10182b] flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-[#0ea5c6]" />
                      Manufacturer Costing & Rate Editor
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Edit unit production rates (PKR). Adjusting the margin percentage automatically recalculates unit landed prices and batch totals in real-time.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#64748b] uppercase">Live Exchange Benchmark</span>
                    <span className="text-xs font-mono font-bold text-[#10182b] block">
                      1 USD = {USD_EXCHANGE_RATE} PKR
                    </span>
                  </div>
                </div>

                {/* 6 Category Rate Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      1. Fabric Cost (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.fabricCost}
                      onChange={(e) => handleRateChange('fabricCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.fabricCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      2. Stitching / CMT (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.stitchingCost}
                      onChange={(e) => handleRateChange('stitchingCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.stitchingCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      3. Embroidery / Print (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.embroideryCost}
                      onChange={(e) => handleRateChange('embroideryCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.embroideryCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      4. Trims & Ribbing (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.trimsCost}
                      onChange={(e) => handleRateChange('trimsCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.trimsCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      5. Courier Shipping (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.shippingCost}
                      onChange={(e) => handleRateChange('shippingCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.shippingCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      6. Pattern Overhead (PKR)
                    </label>
                    <input
                      type="number"
                      value={costRates.overheadCost}
                      onChange={(e) => handleRateChange('overheadCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-sm font-bold font-mono text-[#10182b] focus:outline-hidden focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">
                      ${(costRates.overheadCost / USD_EXCHANGE_RATE).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* MARGIN CONTROLLER (CORE REQUIREMENT) */}
                <div className="p-5 rounded-2xl bg-white border border-[#89ca2e]/40 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#89ca2e]/15 text-[#367c35]">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#10182b]">
                          Manufacturer Profit Margin %
                        </h4>
                        <p className="text-[11px] text-[#64748b]">
                          Adjusting margin recalculates unit landed price and total profit immediately.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {[20, 25, 30, 35, 40, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMarginPercent(preset)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            marginPercent === preset
                              ? 'bg-[#89ca2e] text-[#10182b] font-black shadow-xs scale-105'
                              : 'bg-[#f5f7fb] text-[#64748b] border border-[#e5e9e3] hover:bg-[#e5e9e3]'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider & Number Box */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="flex-1 accent-[#89ca2e] h-2 bg-[#e5e9e3] rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] min-w-[90px] justify-center">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(Math.max(1, Math.min(100, Number(e.target.value) || 0)))}
                        className="w-10 bg-transparent text-sm font-black font-mono text-[#367c35] text-center focus:outline-hidden"
                      />
                      <span className="text-xs font-black text-[#367c35]">%</span>
                    </div>
                  </div>
                </div>

                {/* ============================================================= */}
                {/* REAL-TIME DYNAMIC TOTALS RECALCULATION DISPLAY */}
                {/* ============================================================= */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#e5e9e3] text-center shadow-xs">
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                      Direct Unit Cost (PKR)
                    </span>
                    <span className="text-lg font-black font-mono text-[#10182b]">
                      PKR {formatCurrency(calculatedProposal.subtotalCostPkr)}
                    </span>
                    <span className="text-[10px] text-[#64748b] block">
                      ${(calculatedProposal.subtotalCostPkr / USD_EXCHANGE_RATE).toFixed(2)} USD before margin
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#0ea5c6] uppercase font-bold block">
                      Margin Amount ({calculatedProposal.marginPercent}%)
                    </span>
                    <span className="text-lg font-black font-mono text-[#0ea5c6]">
                      +PKR {formatCurrency(calculatedProposal.marginAmountPkr)}
                    </span>
                    <span className="text-[10px] text-[#0ea5c6] block">
                      +${(calculatedProposal.marginAmountPkr / USD_EXCHANGE_RATE).toFixed(2)} USD / unit
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#367c35] uppercase font-bold block">
                      Landed Unit Price (USD)
                    </span>
                    <span className="text-2xl font-black font-mono text-[#367c35]">
                      ${calculatedProposal.landedUnitUsd} USD
                    </span>
                    <span className="text-[10px] text-[#367c35] block">
                      PKR {formatCurrency(calculatedProposal.finalTotalUnitPkr)} / unit
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                      Batch Total ({selectedQuote.quantity || 1} units)
                    </span>
                    <span className="text-xl font-black font-mono text-[#10182b]">
                      ${calculatedProposal.totalPriceUsd} USD
                    </span>
                    <span className="text-[10px] text-[#64748b] block font-mono">
                      PKR {formatCurrency(calculatedProposal.finalTotalBatchPkr)} total
                    </span>
                  </div>
                </div>

                {/* Delivery Terms & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      Estimated Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(Number(e.target.value) || 14)}
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-xs font-bold font-mono text-[#10182b] focus:border-[#89ca2e] focus:bg-white"
                    />
                    <span className="text-[10px] text-[#64748b] block">Production & dispatch time</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      Sample Approval Protocol
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="sampleToggle"
                        checked={sampleAvailable}
                        onChange={(e) => setSampleAvailable(e.target.checked)}
                        className="w-4 h-4 accent-[#89ca2e] rounded"
                      />
                      <label htmlFor="sampleToggle" className="text-xs text-[#10182b] font-medium">
                        Pre-production sample dispatched prior to bulk run
                      </label>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#e5e9e3] space-y-1">
                    <label className="text-[10px] font-bold text-[#64748b] uppercase block">
                      Factory Production Notes
                    </label>
                    <input
                      type="text"
                      value={manufacturerNotes}
                      onChange={(e) => setManufacturerNotes(e.target.value)}
                      placeholder="e.g., Fabric pre-shrunk, high density embroidery."
                      className="w-full p-2 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] text-xs text-[#10182b] focus:border-[#89ca2e] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-[#e5e9e3] bg-white sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#64748b]">
                Landed Proposal: <strong className="text-[#367c35]">${calculatedProposal.landedUnitUsd} USD / unit</strong> (${calculatedProposal.totalPriceUsd} USD total)
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#f5f7fb] border border-[#e5e9e3] hover:bg-[#e5e9e3] text-[#10182b] font-bold text-xs cursor-pointer transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={savingAction}
                  onClick={() => handleSendProposal('review')}
                  className="px-4 py-2.5 rounded-xl bg-[#0ea5c6]/10 hover:bg-[#0ea5c6]/20 text-[#0ea5c6] border border-[#0ea5c6]/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Save as Reviewing</span>
                </button>

                <button
                  type="button"
                  disabled={savingAction}
                  onClick={() => handleSendProposal('proposal')}
                  className="px-6 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#7ab828] text-[#10182b] font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingAction ? 'Sending Proposal...' : 'Send Finalized Proposal to Fundraiser'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High-Resolution Tech Pack Image Zoom Modal */}
      {imageModalUrl && (
        <div className="fixed inset-0 z-60 bg-[#10182b]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-3xl w-full p-4 shadow-2xl relative">
            <button
              onClick={() => setImageModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f5f7fb] border border-[#e5e9e3] text-[#64748b] hover:text-[#10182b]"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-xs font-bold text-[#64748b] uppercase mb-3">Tech Pack Detailed Drawing</h4>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-[#f5f7fb] rounded-2xl p-2 border border-[#e5e9e3]">
              <img src={imageModalUrl} alt="Tech Pack High Res" className="max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Private Chat Between Fundraiser and Manufacturer */}
      {activeChatQuotation && (
        <QuotationChatModal
          quotation={activeChatQuotation}
          onClose={() => setActiveChatQuotation(null)}
        />
      )}
    </div>
  );
}
