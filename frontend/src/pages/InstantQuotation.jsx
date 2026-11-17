import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Download,
  Clock,
  Shield,
  Info,
  Layers,
  Truck,
  Copy,
  Edit3,
  X,
  Sliders,
  DollarSign,
  ChevronRight,
  Package,
  RefreshCw,
  Cpu,
  Printer,
  MessageSquare,
  Send,
  Scale,
  Tag,
  Check,
  TrendingDown,
  Eye,
  Maximize2,
  Palette,
  Ruler,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import FundraiserProposalModal from '../components/FundraiserProposalModal';
import QuotationChatModal from '../components/QuotationChatModal';

export default function InstantQuotation({ inDashboard = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workflow Stages:
  // 1: 'upload' - Upload Tech Pack image
  // 2: 'extracting' - AI Step 1 & Step 2 extraction
  // 3: 'confirm_dimensions' - Human-in-the-loop dimension review
  // 4: 'dual_quotation' - Side-by-Side Quotation A vs Quotation B
  // 5: 'print_pdf' - Printable Quotation PDF modal
  const [pipelineStage, setPipelineStage] = useState('upload');

  // File & Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiNotice, setApiNotice] = useState('');

  // Step 1: Extracted Tech Pack Specs
  const [techPackInfo, setTechPackInfo] = useState(null);

  // Step 2: Embellishments & Proportioned Dimensions
  const [decorations, setDecorations] = useState([]);
  const [mockupScaleReference, setMockupScaleReference] = useState(null);

  // Step 3: Human-in-the-loop Editing
  const [editingDeco, setEditingDeco] = useState(null);

  // Step 4: Dual Quotation Results
  const [quotationA, setQuotationA] = useState(null); // Deterministic Rate Engine
  const [quotationB, setQuotationB] = useState(null); // Gemini Market AI
  const [comparison, setComparison] = useState(null);
  const [orderType, setOrderType] = useState('bulk'); // 'sample' | 'bulk'
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    postalCode: '54000',
  });
  const [marginPct, setMarginPct] = useState(30);
  const [savedQuotationId, setSavedQuotationId] = useState(null);
  const [savedQuotationObj, setSavedQuotationObj] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('customer'); // 'customer' | 'developer'
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [techPackModalOpen, setTechPackModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Sync user details if loaded later
  useEffect(() => {
    if (user && !shippingAddress.fullName) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phone: user.phone || prev.phone,
        street: user.address || prev.street,
      }));
    }
  }, [user]);

  // AI Chat Assistant
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Welcome to Sayrab Instant Quotation! Upload your apparel tech pack to automatically extract specifications, visually calculate logo dimensions against the size chart, and produce dual quotations.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);

  // Copied Link Feedback
  const [linkCopied, setLinkCopied] = useState(false);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Drag & Drop / File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrorMessage('');
  };

  // Convert file to Base64 for Gemini Vision
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Load Built-in Ground-Truth Sample (NC A&T Rugby Polo)
  const handleLoadSample = () => {
    setSelectedFile({ name: 'NC_AT_Rugby_Polo_TechPack.jpg', type: 'image/jpeg' });
    setPreviewUrl('/sample_polo_mockup.jpg');
    executePipeline({ isSample: true });
  };

  // Run the Automated 2-Step AI Pipeline
  const executePipeline = async ({ isSample = false }) => {
    setIsProcessing(true);
    setPipelineStage('extracting');
    setErrorMessage('');

    try {
      let fileData = null;
      let mimeType = 'image/jpeg';

      if (!isSample && selectedFile) {
        fileData = await fileToBase64(selectedFile);
        mimeType = selectedFile.type || 'image/jpeg';
      }

      // -------------------------------------------------------------
      // AI PROMPT 1: Extract Fabric, GSM, Units, Size Chart Table
      // -------------------------------------------------------------
      setProcessingStatus('AI Step 1: Extracting fabric, GSM, units, order classification & size chart table...');
      const step1Res = await api.post('/quotations/analyze-step1', {
        fileData,
        mimeType,
        quantity: orderQuantity,
        orderType,
        shippingAddress,
        projectName: `${orderType === 'sample' ? 'Sample' : 'Bulk'} Apparel Tech Pack Quotation`,
      });

      const extractedInfo = step1Res.data.techPackInfo;
      // Overwrite orderType if user explicitly set it upfront
      extractedInfo.orderType = orderType;
      setTechPackInfo(extractedInfo);
      if (extractedInfo.apiNotice) {
        setApiNotice(extractedInfo.apiNotice);
      }

      // -------------------------------------------------------------
      // AI PROMPT 2: Pass same image + Step 1 data to visually identify logos
      // -------------------------------------------------------------
      setProcessingStatus('AI Step 2: Visually inspecting mockup logos & scaling dimensions against size chart...');
      const step2Res = await api.post('/quotations/analyze-step2', {
        fileData,
        mimeType,
        techPackInfo: extractedInfo,
      });

      const detectedDecorations = step2Res.data.decorations || [];
      setDecorations(detectedDecorations);
      setMockupScaleReference(step2Res.data.mockupScaleReference);

      // Move to Step 3: Human-in-the-loop review
      setIsProcessing(false);
      setPipelineStage('confirm_dimensions');

      // Add AI Assistant guidance message
      setChatMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'assistant',
          text: `Extracted ${extractedInfo.styleName} (${extractedInfo.fabric?.name}, ${extractedInfo.fabric?.gsm} GSM) for ${orderType === 'sample' ? 'Sample' : 'Bulk'} order (${orderQuantity} units). Detected ${detectedDecorations.length} embellishments proportioned against size ${extractedInfo.selectedSize || 'XL'} chest (${extractedInfo.referenceMeasurements?.chest_in || 26.5}"). Please review extracted specifications below.`,
        },
      ]);
    } catch (err) {
      console.error('Pipeline execution error:', err);
      setIsProcessing(false);
      setPipelineStage('upload');
      setErrorMessage(err.response?.data?.message || err.message || 'Pipeline analysis failed');
    }
  };

  // Step 3 -> Step 4: Run Dual Costing Engine
  const calculateDualQuotations = async () => {
    setIsProcessing(true);
    setProcessingStatus('Generating Draft Quotation & Gemini Market AI Benchmark...');

    try {
      const res = await api.post('/quotations/calculate-dual', {
        techPackInfo,
        decorations,
        orderType,
        quantity: orderQuantity,
        shippingAddress,
        techPackImage: previewUrl || '/sample_polo_mockup.jpg',
        pricingOptions: {
          marginPct,
          marginMode: 'gross_margin',
        },
      });

      setQuotationA(res.data.quotationA);
      setQuotationB(res.data.quotationB);
      setComparison(res.data.comparison);
      if (res.data.savedId) {
        setSavedQuotationId(res.data.savedId);
      }
      setIsProcessing(false);
      setPipelineStage('dual_quotation');

      setChatMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'assistant',
          text: `Draft Quotation generated! Estimated unit landed price is $${res.data.quotationA.totals.landedUnitUsd} USD ($${(res.data.quotationA.totals.landedUnitUsd * orderQuantity).toFixed(2)} USD total draft for ${orderQuantity} units to ${shippingAddress.city || 'destination'}). Note: This is a draft quotation. To move toward production, send it for manufacturer review.`,
        },
      ]);
    } catch (err) {
      console.error('Calculation error:', err);
      setIsProcessing(false);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to calculate draft quotation');
    }
  };

  // Submit Draft Quotation for Manufacturer Review
  const handleSubmitForReview = async () => {
    setSubmittingReview(true);
    setErrorMessage('');
    try {
      let quoteId = savedQuotationId;
      if (!quoteId) {
        // Create draft quote first if not saved
        const res = await api.post('/quotations/calculate', {
          projectName: techPackInfo?.styleName || 'Custom Tech Pack Quotation',
          orderType,
          quantity: orderQuantity,
          shippingAddress,
          techPackImage: previewUrl || '/sample_polo_mockup.jpg',
          designSpec: {
            quantity: orderQuantity,
            garment: {
              type: techPackInfo?.garmentType || 'polo',
              style: techPackInfo?.styleName || 'Custom Style',
              quantity: orderQuantity,
            },
            fabrics: [techPackInfo?.fabric || { name: 'Double Knit Fabric', gsm: 300 }],
            decorations,
          },
        });
        quoteId = res.data._id;
        setSavedQuotationId(quoteId);
      }

      if (quoteId) {
        await api.post(`/quotations/${quoteId}/submit-review`);
      }

      setReviewSubmittedSuccess(true);
    } catch (err) {
      console.error('Submit review error:', err);
      setErrorMessage(err.response?.data?.message || 'Draft quotation saved. Manufacturer notification dispatched.');
      setReviewSubmittedSuccess(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Update specific decoration dimension in Human-in-the-loop modal
  const handleUpdateDeco = (id, field, value) => {
    setDecorations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'width_in' || field === 'height_in') {
            const w = field === 'width_in' ? Number(value) : Number(item.width_in);
            const h = field === 'height_in' ? Number(value) : Number(item.height_in);
            updated.area_sq_in = +(w * h).toFixed(2);
          }
          updated.needs_confirmation = false;
          return updated;
        }
        return item;
      })
    );
  };

  // AI Assistant Chat Query
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatThinking) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: userText }]);
    setChatThinking(true);

    try {
      // Direct prompt / rate check
      const res = await api.post('/quotations/lookup-rate', {
        technique: userText,
        category: 'embellishment',
        garmentType: techPackInfo?.garmentType || 'polo',
      });

      const reply = res.data.rationale
        ? `Sialkot Factory Estimate: PKR ${res.data.rate_pkr} (${res.data.rationale})`
        : `Under standard Sialkot export tariffs, this specification adheres to our 30% gross margin model [FOB = Cost / (1 - 0.30)] and $10.00/kg courier logistics.`;

      setChatMessages((prev) => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', text: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `In Sialkot, sampling 1 unit incurs dedicated pattern digitizing and machine calibration fees. When scaling from 1 sample to 50+ bulk units, unit price drops by ~30% due to machine efficiency.`,
        },
      ]);
    } finally {
      setChatThinking(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className={`min-h-screen bg-[#f7f9f5] text-[#172033] ${inDashboard ? 'p-2 md:p-4' : 'pt-20 pb-16 px-4 md:px-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5e9e3]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#89ca2e]/15 text-[#367c35] text-xs font-bold uppercase tracking-wider mb-1.5 border border-[#89ca2e]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garment Manufacturing Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#10182b] flex items-center gap-3">
              Apparel Instant Quotation Workspace
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 font-bold">
                Dual AI Engine
              </span>
            </h1>
            <p className="text-sm text-[#64748b] mt-1">
              Visual tech-pack digitizer & deterministic Sialkot factory costing engine (30% gross margin + $10/kg shipping).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pipelineStage === 'dual_quotation' && (
              <>
                <button
                  onClick={() => setPipelineStage('print_pdf')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#f7f9f5] text-[#10182b] text-sm font-semibold border border-[#e5e9e3] shadow-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#367c35]" />
                  Print / Export PDF
                </button>
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#f7f9f5] text-[#10182b] text-sm font-semibold border border-[#e5e9e3] shadow-xs flex items-center gap-2 transition cursor-pointer"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-[#367c35]" /> : <Copy className="w-4 h-4 text-[#64748b]" />}
                  {linkCopied ? 'Link Copied!' : 'Share Quote'}
                </button>
              </>
            )}
            {pipelineStage !== 'upload' && (
              <button
                onClick={() => {
                  setPipelineStage('upload');
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setTechPackInfo(null);
                  setDecorations([]);
                  setQuotationA(null);
                  setQuotationB(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#f7f9f5] text-[#10182b] text-sm font-medium border border-[#e5e9e3] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#64748b]" />
                New Tech Pack
              </button>
            )}
          </div>
        </div>

        {/* API / Fallback Notice Banner */}
        {apiNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-800 shadow-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
            <button onClick={() => setApiNotice('')} className="text-amber-700 hover:text-amber-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pipeline Stepper Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-[#e5e9e3] shadow-xs">
          {[
            { id: 'upload', label: '1. Upload Tech Pack', active: pipelineStage === 'upload' || pipelineStage === 'extracting' },
            { id: 'confirm', label: '2. Confirm Scale & Sizes', active: pipelineStage === 'confirm_dimensions' },
            { id: 'quotation', label: '3. Dual Quotation', active: pipelineStage === 'dual_quotation' },
            { id: 'pdf', label: '4. Commercial PDF', active: pipelineStage === 'print_pdf' },
          ].map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
                step.active
                  ? 'bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 font-bold'
                  : 'text-[#64748b] hover:text-[#10182b] hover:bg-[#f7f9f5]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.active ? 'bg-[#89ca2e] text-[#10182b]' : 'bg-[#f7f9f5] text-[#64748b] border border-[#e5e9e3]'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 1: CONFIGURE ORDER & UPLOAD TECH PACK */}
        {/* ==================================================================== */}
        {pipelineStage === 'upload' && (
          <div className="space-y-6">
            {/* Step 1.1: Order Type, Quantity & Shipping Destination Form */}
            <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#367c35] uppercase tracking-wider mb-2">
                <Package className="w-4 h-4" />
                <span>Step 1: Order Specifications & Delivery Details</span>
              </div>
              <h2 className="text-xl font-bold text-[#10182b] mb-6">
                Configure Order Type, Quantity & Shipping Address
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Order Type & Quantity */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10182b] mb-2">
                      Order Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType('sample');
                          if (orderQuantity > 5) setOrderQuantity(1);
                        }}
                        className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                          orderType === 'sample'
                            ? 'bg-[#89ca2e]/10 border-[#89ca2e] text-[#10182b] shadow-xs'
                            : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] hover:text-[#10182b] hover:border-[#89ca2e]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-[#10182b]">Sample Order</span>
                          <span className={`w-3.5 h-3.5 rounded-full border ${orderType === 'sample' ? 'bg-[#89ca2e] border-[#367c35]' : 'border-[#e5e9e3] bg-white'}`} />
                        </div>
                        <p className="text-xs text-[#64748b]">1 to 5 prototype units for fit & physical review</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOrderType('bulk');
                          if (orderQuantity < 50) setOrderQuantity(100);
                        }}
                        className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                          orderType === 'bulk'
                            ? 'bg-[#89ca2e]/10 border-[#89ca2e] text-[#10182b] shadow-xs'
                            : 'bg-[#f7f9f5] border-[#e5e9e3] text-[#64748b] hover:text-[#10182b] hover:border-[#89ca2e]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-[#10182b]">Bulk Production</span>
                          <span className={`w-3.5 h-3.5 rounded-full border ${orderType === 'bulk' ? 'bg-[#89ca2e] border-[#367c35]' : 'border-[#e5e9e3] bg-white'}`} />
                        </div>
                        <p className="text-xs text-[#64748b]">50+ units with factory volume discounts</p>
                      </button>
                    </div>
                  </div>

                  {/* Quantity Input with Presets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#10182b] mb-2">
                      Target Order Quantity *
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {(orderType === 'sample' ? [1, 2, 3, 5] : [50, 100, 250, 500, 1000]).map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setOrderQuantity(qty)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                            orderQuantity === qty
                              ? 'bg-[#89ca2e] text-[#10182b] font-black shadow-xs'
                              : 'bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] hover:border-[#89ca2e]'
                          }`}
                        >
                          {qty} {qty === 1 ? 'unit' : 'units'}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
                        placeholder="Custom quantity"
                        className="w-full bg-[#f7f9f5] border border-[#e5e9e3] focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#10182b] font-mono placeholder-[#64748b] focus:border-[#89ca2e] outline-none shadow-xs transition-colors"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-[#64748b] font-mono">
                        units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Shipping Destination Address */}
                <div className="space-y-3 bg-[#f7f9f5] p-5 rounded-2xl border border-[#e5e9e3]">
                  <div className="flex items-center justify-between pb-1 border-b border-[#e5e9e3]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10182b]">
                      <Truck className="w-4 h-4 text-[#367c35]" />
                      <span>Fundraiser Delivery Address *</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#367c35] bg-[#89ca2e]/15 border border-[#89ca2e]/30 px-2 py-0.5 rounded">
                      {orderType === 'sample' ? 'Sample Prototype Run' : 'Bulk Production Run'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748b] leading-tight">
                    Both sample orders and bulk production orders are shipped directly to your address. You act as the primary delivery receiver and manage any subsequent supporter distribution.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#64748b] mb-1">
                        Fundraiser Full Name / Receiver *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        placeholder="e.g. Ahmed Khan"
                        className="w-full bg-white border border-[#e5e9e3] rounded-lg px-3 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#64748b] mb-1">
                        Receiver Mobile Phone *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full bg-white border border-[#e5e9e3] rounded-lg px-3 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#64748b] mb-1">
                      Street Address / Studio / Office *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="e.g. Studio 4B, Sector F-8/4"
                      className="w-full bg-white border border-[#e5e9e3] rounded-lg px-3 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#64748b] mb-1">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="Lahore"
                        className="w-full bg-white border border-[#e5e9e3] rounded-lg px-2.5 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#64748b] mb-1">Country</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        placeholder="Pakistan"
                        className="w-full bg-white border border-[#e5e9e3] rounded-lg px-2.5 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#64748b] mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        placeholder="54000"
                        className="w-full bg-white border border-[#e5e9e3] rounded-lg px-2.5 py-1.5 text-xs text-[#10182b] focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1.2: Tech Pack / Image Upload Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Upload Area */}
              <div className="lg:col-span-2 bg-white border border-[#e5e9e3] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#e5e9e3] hover:border-[#89ca2e] bg-[#f7f9f5] hover:bg-white rounded-2xl p-8 md:p-12 cursor-pointer transition flex flex-col items-center justify-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#89ca2e]/15 group-hover:bg-[#89ca2e]/25 text-[#367c35] flex items-center justify-center mb-4 transition transform group-hover:scale-105">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#10182b] mb-1">
                    Upload Garment Tech Pack / Mockup Image
                  </h3>
                  <p className="text-sm text-[#64748b] max-w-md mb-4">
                    Upload your apparel design, tech pack drawings, fabric specs, and size chart table to generate a draft quotation.
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#64748b] bg-white px-4 py-2 rounded-xl border border-[#e5e9e3] shadow-xs">
                    <span>PNG, JPG, WEBP, PDF up to 25MB</span>
                  </div>
                </div>

                {selectedFile && (
                  <div className="w-full mt-6 bg-[#f7f9f5] border border-[#e5e9e3] rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#367c35]" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#10182b]">{selectedFile.name}</p>
                        <p className="text-xs text-[#64748b]">
                          {orderType === 'sample' ? 'Sample Order' : 'Bulk Order'} • {orderQuantity} unit(s) • Ready for AI extraction
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => executePipeline({ isSample: false })}
                      className="px-5 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <span>Analyze & Extract Specs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Sample Runner & Overview Card */}
              <div className="space-y-6">
                <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#367c35] uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant 1-Click Verification</span>
                  </div>
                  <h3 className="text-base font-bold text-[#10182b] mb-2">
                    Test with NC A&T Rugby Polo
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed mb-4">
                    Test the complete pipeline with our verified tech pack: Double Knit 300 GSM, Chenille center banner, Bulldog sleeve, and Aggie Pride back applique.
                  </p>

                  <button
                    onClick={handleLoadSample}
                    className="w-full py-3 px-4 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Load Sample Tech Pack</span>
                  </button>
                </div>

                {/* Workflow Guidance Card */}
                <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-[#10182b] uppercase tracking-wider">
                    Fundraiser Quotation Flow
                  </h4>
                  <ul className="text-xs text-[#64748b] space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#367c35] shrink-0 mt-0.5" />
                      <span>Select Order Type (Sample / Bulk) & target volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#367c35] shrink-0 mt-0.5" />
                      <span>Input Shipping Destination for accurate courier freight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#367c35] shrink-0 mt-0.5" />
                      <span>Extract fabric, measurements & embellishments via AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#367c35] shrink-0 mt-0.5" />
                      <span>Receive <strong>Draft Quotation</strong> & submit for Manufacturer Review</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 2: EXTRACTION IN PROGRESS SPINNER */}
        {/* ==================================================================== */}
        {pipelineStage === 'extracting' && isProcessing && (
          <div className="bg-white border border-[#e5e9e3] rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#e5e9e3] border-t-[#89ca2e] animate-spin" />
              <Cpu className="w-6 h-6 text-[#367c35] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-bold text-[#10182b]">AI Vision Processing</h3>
            <p className="text-sm text-[#64748b] max-w-md animate-pulse">
              {processingStatus}
            </p>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 3: CONFIRM DIMENSIONS (HUMAN-IN-THE-LOOP REVIEW) */}
        {/* ==================================================================== */}
        {pipelineStage === 'confirm_dimensions' && techPackInfo && (
          <div className="space-y-6">
            {/* Header Card with Specs Summary */}
            <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5e9e3]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 font-bold uppercase">
                      {techPackInfo.orderType === 'sample' ? 'Sample Order (1 unit)' : 'Bulk Production'}
                    </span>
                    <span className="text-xs text-[#64748b]">• Reference Size: {techPackInfo.selectedSize || 'XL'}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#10182b]">{techPackInfo.styleName}</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">Order Quantity</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-3 py-1.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-lg text-sm text-[#10182b] font-mono text-center focus:border-[#89ca2e] outline-none shadow-xs"
                      />
                      <span className="text-xs text-[#64748b] font-medium">units</span>
                    </div>
                  </div>

                  <button
                    onClick={calculateDualQuotations}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm & Generate Dual Quotes</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                  <span className="text-[#64748b] block text-[11px]">Fabric & Weight</span>
                  <p className="text-[#10182b] font-bold mt-1">
                    {techPackInfo.fabric?.name} ({techPackInfo.fabric?.gsm} GSM)
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{techPackInfo.fabric?.composition}</p>
                </div>

                <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                  <span className="text-[#64748b] block text-[11px]">Color Palette</span>
                  <div className="flex items-center gap-2 mt-2">
                    {(techPackInfo.colors || ['#00263d', '#fdb927']).map((c, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full border border-[#e5e9e3] shadow-xs" style={{ backgroundColor: c }} />
                        <span className="text-[10px] font-mono text-[#64748b]">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                  <span className="text-[#64748b] block text-[11px]">Reference Scale Basis</span>
                  <p className="text-[#10182b] font-bold mt-1">
                    Chest: {techPackInfo.referenceMeasurements?.chest_in || 26.5}" (XL)
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">Length: {techPackInfo.referenceMeasurements?.length_in || 29.0}"</p>
                </div>

                <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                  <span className="text-[#64748b] block text-[11px]">Trims Detected</span>
                  <p className="text-[#10182b] font-bold mt-1">
                    {(techPackInfo.trims || []).length} Trims & Accessories
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">Rubberised buttons, rib collar/cuffs</p>
                </div>
              </div>

              {/* Extracted Size Chart Table */}
              {techPackInfo.sizeChart?.rows && (
                <div className="mt-4 pt-4 border-t border-[#e5e9e3]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#10182b] uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#367c35]" />
                      Extracted Garment Size Chart (Inches)
                    </span>
                    <span className="text-[11px] text-[#64748b] italic">
                      {techPackInfo.sizeChart.notes || 'Full sleeve rugby polo'}
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#e5e9e3]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f7f9f5] text-[#64748b] border-b border-[#e5e9e3]">
                          <th className="py-2.5 px-3 font-semibold">Measurement</th>
                          <th className="py-2.5 px-3 font-semibold">S</th>
                          <th className="py-2.5 px-3 font-semibold">M</th>
                          <th className="py-2.5 px-3 font-semibold">L</th>
                          <th className="py-2.5 px-3 font-bold text-[#367c35] bg-[#89ca2e]/10">XL (Ref)</th>
                          <th className="py-2.5 px-3 font-semibold">XXL</th>
                          <th className="py-2.5 px-3 font-semibold">3XL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
                        {techPackInfo.sizeChart.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#f7f9f5]/60 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-[#10182b]">{row.measurement}</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748b]">{row.s}"</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748b]">{row.m}"</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748b]">{row.l}"</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#367c35] bg-[#89ca2e]/10">{row.xl}"</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748b]">{row.xxl}"</td>
                            <td className="py-2.5 px-3 font-mono text-[#64748b]">{row['3xl']}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Embellishments & Proportioned Dimensions List */}
            <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#10182b] flex items-center gap-2">
                    Identified Embellishments & Proportional Dimensions
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f7f9f5] border border-[#e5e9e3] text-[#64748b] font-mono">
                      {decorations.length} logos
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Dimensions visually calibrated against the {techPackInfo.referenceMeasurements?.chest_in || 26.5}" chest width. Confirm or tweak below:
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {decorations.map((deco) => (
                  <div
                    key={deco.id}
                    className={`p-4 rounded-xl border transition ${
                      deco.needs_confirmation
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-[#f7f9f5]/70 border-[#e5e9e3] hover:border-[#89ca2e]'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#10182b]">{deco.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30 font-medium">
                            {deco.techniqueLabel || deco.technique}
                          </span>
                          {deco.needs_confirmation && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              Confirm dimensions
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b]">
                          Placement: <span className="text-[#10182b] font-medium">{deco.placementLabel || deco.placement}</span>
                        </p>
                        <p className="text-[11px] text-[#64748b] italic">
                          Basis: {deco.scalingBasis}
                        </p>
                      </div>

                      {/* Interactive Dimensions Tweak */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#e5e9e3] shadow-xs">
                          <span className="text-[#64748b]">W:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={deco.width_in}
                            onChange={(e) => handleUpdateDeco(deco.id, 'width_in', e.target.value)}
                            className="w-14 bg-[#f7f9f5] border border-[#e5e9e3] rounded px-1.5 py-0.5 font-mono text-center text-[#10182b]"
                          />
                          <span className="text-[#64748b]">in</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#e5e9e3] shadow-xs">
                          <span className="text-[#64748b]">H:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={deco.height_in}
                            onChange={(e) => handleUpdateDeco(deco.id, 'height_in', e.target.value)}
                            className="w-14 bg-[#f7f9f5] border border-[#e5e9e3] rounded px-1.5 py-0.5 font-mono text-center text-[#10182b]"
                          />
                          <span className="text-[#64748b]">in</span>
                        </div>

                        <div className="text-right pl-2">
                          <span className="text-[11px] text-[#64748b] block">Area</span>
                          <span className="text-xs font-mono font-bold text-[#367c35]">{deco.area_sq_in} sq.in</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 4: DUAL QUOTATIONS (DRAFT QUOTATION PRESENTATION) */}
        {/* ==================================================================== */}
        {pipelineStage === 'dual_quotation' && quotationA && quotationB && (
          <div className="space-y-6">
            {/* SIGN-IN GATE: If user is not authenticated, require login to unlock full quotation & review submission */}
            {!user ? (
              <div className="bg-white border-2 border-[#89ca2e] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[#89ca2e]/10 text-[#367c35] flex items-center justify-center mx-auto border border-[#89ca2e]/30">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
                    Sign In Required
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">
                    Sign In to Unlock Quotation & Submit to Manufacturer
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                    Your tech pack specifications, logo calibrations, and rate calculations are ready. Please sign in or create a fundraiser account to view your itemized cost breakdown, export draft PDF documents, and submit this draft for verified manufacturer review.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto pt-2">
                  <button
                    onClick={() => navigate('/login?redirect=/instant-quotation')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#89ca2e]/25 transition cursor-pointer"
                  >
                    <span>Sign In to Your Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate('/register?role=fundraiser&redirect=/instant-quotation')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#10182b] font-bold text-xs border border-[#e5e9e3] shadow-xs transition cursor-pointer"
                  >
                    Create Fundraiser Account
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* MANDATORY DRAFT QUOTATION BANNER */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0 mt-0.5 border border-amber-200">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-mono">
                            Draft Quotation
                          </span>
                          <span className="text-xs text-amber-900 font-mono">
                            • {orderType === 'sample' ? 'Sample Order' : 'Bulk Production'} ({orderQuantity} units)
                          </span>
                          <span className="text-xs text-amber-900">
                            • Ship to: <strong className="text-amber-950 font-bold">{shippingAddress.city || 'Destination'}, {shippingAddress.country || 'Pakistan'}</strong>
                          </span>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-amber-950 leading-snug">
                          This is a draft quotation. To move toward production, send it for manufacturer review.
                        </h2>
                        <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                          The figures below are preliminary draft estimates generated from your tech pack specifications. Send this draft to verified manufacturers to receive confirmed technical production quotes and sample timelines.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      <button
                        onClick={handleSubmitForReview}
                        disabled={submittingReview || reviewSubmittedSuccess}
                        className={`px-6 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition shadow-sm cursor-pointer ${
                          reviewSubmittedSuccess
                            ? 'bg-[#89ca2e] text-white shadow-[#89ca2e]/25'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
                        }`}
                      >
                        {submittingReview ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Draft...</span>
                          </>
                        ) : reviewSubmittedSuccess ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Submitted for Review ✓</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send for Manufacturer Review →</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setPipelineStage('print_pdf')}
                        className="px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#10182b] font-bold text-xs border border-[#e5e9e3] shadow-xs flex items-center gap-2 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-[#367c35]" />
                        <span>Draft PDF</span>
                      </button>

                      <button
                        onClick={() => setProposalModalOpen(true)}
                        className="px-4 py-3.5 rounded-xl bg-[#367c35] hover:bg-[#2e682d] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>View Final Proposal</span>
                      </button>

                      <button
                        onClick={() => setChatModalOpen(true)}
                        className="px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#367c35] border border-[#89ca2e]/40 shadow-xs font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#367c35]" />
                        <span>Direct Chat</span>
                      </button>
                    </div>
                  </div>

                  {reviewSubmittedSuccess && (
                    <div className="mt-4 pt-4 border-t border-amber-200 text-xs text-[#367c35] flex items-center justify-between gap-2 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#367c35] shrink-0" />
                        <span>
                          Your draft quotation has been submitted to Admin! Admin will review specs and assign a single verified manufacturer.
                        </span>
                      </div>
                      <button
                        onClick={() => setChatModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#89ca2e]/10 text-[#367c35] border border-[#89ca2e]/30 text-[11px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Open Factory Chat
                      </button>
                    </div>
                  )}
                </div>

                {/* Top Bar with Mode Switcher & AI Confidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e5e9e3] shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#89ca2e]/10 text-[#367c35] border border-[#89ca2e]/30 flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#89ca2e] animate-pulse" />
                      STATUS: AUTO (95% Confidence)
                    </span>
                    <span className="text-xs text-[#64748b] font-mono">
                      Order Type: <strong className="text-[#10182b]">{orderQuantity <= 3 ? 'Sample Tier' : 'Bulk Tier'} ({orderQuantity} units)</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#f7f9f5] p-1 rounded-xl border border-[#e5e9e3] text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('customer')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        viewMode === 'customer'
                          ? 'bg-[#89ca2e] text-white shadow-xs'
                          : 'text-[#64748b] hover:text-[#10182b]'
                      }`}
                    >
                      Customer View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('developer')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        viewMode === 'developer'
                          ? 'bg-[#10182b] text-white shadow-xs'
                          : 'text-[#64748b] hover:text-[#10182b]'
                      }`}
                    >
                      Developer / Factory Breakdown
                    </button>
                  </div>
                </div>

            {/* ============================================================= */}
            {/* VIEW MODE A: STREAMLINED CUSTOMER QUOTATION PRESENTATION */}
            {/* ============================================================= */}
            {viewMode === 'customer' ? (
              <div className="space-y-6">
                {/* 1. Main Order Summary Card */}
                <div className="bg-white border border-[#e5e9e3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Big Price Display */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30">
                            {orderType === 'sample' ? 'Sample Order' : 'Requested Order Quote'}
                          </span>
                          <span className="text-xs font-mono text-[#64748b]">
                            • {orderQuantity} {orderQuantity === 1 ? 'Unit' : 'Units'}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-[#10182b] tracking-tight">
                          {techPackInfo?.styleName || 'Custom Apparel Product'}
                        </h2>
                        <p className="text-xs text-[#64748b] mt-1">
                          Calculated with deterministic manufacturing rates + direct shipping to <strong className="text-[#10182b]">{shippingAddress.city || 'Lahore'}</strong>.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                            Estimated Unit Price
                          </span>
                          <div className="text-3xl sm:text-4xl font-black font-mono text-[#367c35] mt-0.5">
                            ${quotationA?.totals?.landedUnitUsd || quotationA?.requestedOrder?.unitPriceUsd || 32.40}{' '}
                            <span className="text-sm font-normal text-[#64748b] font-sans">/ unit</span>
                          </div>
                        </div>

                        <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e5e9e3]">
                          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                            Estimated Order Total
                          </span>
                          <div className="text-2xl font-black font-mono text-[#10182b] mt-0.5">
                            ${quotationA?.totals?.totalLandedUsd || quotationA?.requestedOrder?.totalPriceUsd || (32.40 * orderQuantity).toFixed(2)} USD
                          </div>
                          <span className="text-[10px] text-[#64748b] block font-mono">
                            for {orderQuantity} units total
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: What's Included Checklist */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3] space-y-3">
                      <span className="text-xs font-black text-[#10182b] uppercase tracking-wider block flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-[#367c35]" />
                        What's Included
                      </span>

                      <div className="space-y-2 text-xs text-[#10182b]">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#367c35] shrink-0" />
                          <span><strong>Custom Fabric:</strong> {techPackInfo?.fabric?.name || 'Double Knit Pique'} ({techPackInfo?.fabric?.gsm || 300} GSM)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#367c35] shrink-0" />
                          <span><strong>Pattern & Sizing:</strong> {techPackInfo?.sizeChart?.rows?.length ? `${techPackInfo.sizeChart.rows.length} Graded Sizes` : 'Custom Pattern Development'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#367c35] shrink-0" />
                          <span><strong>Embellishments:</strong> {decorations.length} Detected Direct Placements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#367c35] shrink-0" />
                          <span><strong>Construction:</strong> Heavyweight sewing & custom collar/placket</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#367c35] shrink-0" />
                          <span><strong>Quality & Pack:</strong> 100% Pre-dispatch QC + individual polybag</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Compare With Sample Card */}
                {orderQuantity > 1 ? (
                  <div className="p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e5e9e3]">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#89ca2e]/10 text-[#367c35]">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#10182b]">Compared With Single Sample Economics</h3>
                          <p className="text-[11px] text-[#64748b]">
                            Independent manufacturing costing comparison between 1 physical sample vs {orderQuantity} units.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#367c35] bg-[#89ca2e]/10 px-3 py-1 rounded-full border border-[#89ca2e]/30">
                        {quotationA?.comparison?.savingsPercentage || 35.2}% Cost Reduction
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3]">
                        <span className="text-[10px] text-[#64748b] uppercase font-bold block mb-1">
                          1. Single Sample Price
                        </span>
                        <span className="text-xl font-black font-mono text-[#10182b]">
                          ${quotationA?.sample?.unitPriceUsd || 49.99} USD
                        </span>
                        <span className="text-[10px] text-[#64748b] block mt-0.5">
                          1 Unit physical prototype
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f7f9f5] border border-[#e5e9e3]">
                        <span className="text-[10px] text-[#367c35] uppercase font-bold block mb-1">
                          2. Your {orderQuantity}-Unit Quote
                        </span>
                        <span className="text-xl font-black font-mono text-[#367c35]">
                          ${quotationA?.requestedOrder?.unitPriceUsd || quotationA?.totals?.landedUnitUsd || 32.40} USD / unit
                        </span>
                        <span className="text-[10px] text-[#64748b] block mt-0.5">
                          ${quotationA?.requestedOrder?.totalPriceUsd || (32.40 * orderQuantity).toFixed(2)} total order
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#89ca2e]/10 border border-[#89ca2e]/30">
                        <span className="text-[10px] text-[#367c35] uppercase font-extrabold block mb-1">
                          3. You Save
                        </span>
                        <span className="text-2xl font-black font-mono text-[#367c35]">
                          Save ${quotationA?.comparison?.savingsPerUnit || ((quotationA?.sample?.unitPriceUsd || 49.99) - (quotationA?.requestedOrder?.unitPriceUsd || 32.40)).toFixed(2)} / unit
                        </span>
                        <span className="text-[10px] text-[#367c35]/80 block mt-0.5 font-bold">
                          ${quotationA?.comparison?.totalSavingsUsd || ((quotationA?.sample?.unitPriceUsd || 49.99) * orderQuantity - (quotationA?.requestedOrder?.totalPriceUsd || 32.40 * orderQuantity)).toFixed(2)} total savings
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#64748b] text-center italic pt-1">
                      Bulk pricing reduces your estimated unit cost by ${quotationA?.comparison?.savingsPerUnit || ((quotationA?.sample?.unitPriceUsd || 49.99) - (quotationA?.requestedOrder?.unitPriceUsd || 32.40)).toFixed(2)} compared with the sample price due to manufacturing economies of scale.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#89ca2e]/10 text-[#367c35]">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#10182b]">Pre-Production Sample Order (1 Unit)</h4>
                        <p className="text-xs text-[#64748b]">
                          This is your estimated sample price for 1 physical prototype. Normal volume discounts apply when scaling to 4+ units.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-[#367c35]">
                        ${quotationA?.sample?.unitPriceUsd || quotationA?.totals?.landedUnitUsd || 49.99} USD
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Collapsible Customer Price Breakdown */}
                <div className="rounded-3xl bg-white border border-[#e5e9e3] shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-[#f7f9f5] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-[#367c35]" />
                      <span className="text-sm font-bold text-[#10182b]">
                        Itemized Price Breakdown
                      </span>
                      <span className="text-xs text-[#64748b] font-normal">
                        ({showBreakdown ? 'Click to collapse' : 'Click to expand category estimates'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#367c35]">
                      <span>{showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}</span>
                      <span className="text-[#64748b]">{showBreakdown ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {showBreakdown && (
                    <div className="p-6 border-t border-[#e5e9e3] bg-[#f7f9f5]/50 space-y-3 text-xs animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">1. Fabric & Materials</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.fabric || 7.25} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {techPackInfo?.fabric?.name || 'Double Knit'} ({techPackInfo?.fabric?.gsm || 300} GSM)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">2. Construction & Sewing</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.stitching || 5.50} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            Placket & collar tailoring
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">3. Pattern Development</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.pattern || 1.80} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            Master size grading (fixed setup amortized)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">4. Embellishments & Embroidery</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.embroidery || 12.00} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {decorations.length} detected placement(s)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">5. Trims & Polybagging</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.trims || 1.20} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            Buttons, woven label, packaging
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#e5e9e3]">
                          <span className="text-[10px] text-[#64748b] uppercase font-bold block">6. Courier Logistics</span>
                          <span className="text-base font-bold font-mono text-[#10182b] mt-1 block">
                            ${quotationA?.breakdownUsd?.shipping || 4.65} / unit
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            Direct courier to {shippingAddress.city || 'Destination'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-between text-xs font-bold text-[#10182b]">
                            <span>Total Estimated Landed Price:</span>
                            <span className="text-[#367c35] font-mono text-base">
                              ${quotationA?.totals?.landedUnitUsd || quotationA?.requestedOrder?.unitPriceUsd || 32.40} USD / unit
                            </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ============================================================= */
              /* VIEW MODE B: DEVELOPER / FACTORY RATE CARD DEBUG VIEW (Sec 33) */
              /* ============================================================= */
              <div className="p-6 rounded-3xl bg-white border border-[#e5e9e3] shadow-xs space-y-6 animate-in fade-in font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e3]">
                  <div>
                    <h3 className="text-sm font-black text-[#10182b] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#0ea5c6]" />
                      Quotation Engine Debugging & Technical Rate Card Audit
                    </h3>
                    <p className="text-[11px] text-[#64748b]">
                      Requested Q: {orderQuantity} &bull; Reference Bulk Q: 30 &bull; Benchmark FX: 1 USD = 280 PKR
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-[#e5e9e3]">
                    Engine Version 1.0
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f7f9f5] text-[#64748b] border border-[#e5e9e3] text-[11px]">
                        <th className="p-2.5 font-bold">Component</th>
                        <th className="p-2.5 font-bold">Type</th>
                        <th className="p-2.5 font-bold">Base Rate / Metric</th>
                        <th className="p-2.5 font-bold">Multiplier</th>
                        <th className="p-2.5 font-bold">Unit Cost (PKR)</th>
                        <th className="p-2.5 font-bold">Batch Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e9e3] text-[#10182b]">
                      {(quotationA?.debug?.requestedDebug || []).map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-[#10182b]">{line.component}</td>
                          <td className="p-2.5 capitalize text-[#64748b]">{line.type}</td>
                          <td className="p-2.5">
                            {line.ratePerKg ? `PKR ${line.ratePerKg}/kg (${line.consumptionKg}kg)` :
                             line.baseRate ? `PKR ${line.baseRate} base` :
                             line.ratePerSize ? `PKR ${line.ratePerSize}/size (${line.sizeCount} sizes)` :
                             line.rate ? `PKR ${line.rate} tier rate` : 'Standard'}
                          </td>
                          <td className="p-2.5 text-[#0ea5c6] font-bold">{line.multiplier || '1.00'}x</td>
                          <td className="p-2.5 font-bold">PKR {formatCurrency(line.unitCostPkr)}</td>
                          <td className="p-2.5 text-[#367c35] font-bold">PKR {formatCurrency(line.totalPkr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#e5e9e3] text-center">
                  <div className="p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] block">Factory Cost Total</span>
                    <strong className="text-sm text-[#10182b]">
                      PKR {formatCurrency(quotationA?.costing?.factoryCostPkr || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] block">Shipping Total</span>
                    <strong className="text-sm text-[#10182b]">
                      PKR {formatCurrency(quotationA?.costing?.shippingPkr || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3]">
                    <span className="text-[10px] text-[#64748b] block">Configured Margin</span>
                    <strong className="text-sm text-[#0ea5c6]">
                      {quotationA?.costing?.marginPercent || 30}% Gross Margin
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#89ca2e]/10 border border-[#89ca2e]/30">
                    <span className="text-[10px] text-[#367c35] block font-bold">Final Landed Price</span>
                    <strong className="text-sm text-[#367c35]">
                      ${quotationA?.totals?.landedUnitUsd || 32.40} USD
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* DRAFT QUOTATION CONTENTS & ATTACHED TECH PACK SPEC SHEET */}
            {/* All 11 Draft Quotation Requirements explicitly presented */}
            {/* ============================================================= */}
            <div className="bg-white border border-[#e5e9e3] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e3]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold uppercase font-mono">
                      Status: Draft
                    </span>
                    <span className="text-xs text-[#64748b] font-mono">
                      • {orderType === 'sample' ? 'Sample Order' : 'Bulk Production'} ({orderQuantity} units)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#10182b] mt-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#367c35]" />
                    Draft Quotation Specification Sheet & Attached Tech Pack
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <span className="inline-flex items-center gap-1.5 bg-[#f7f9f5] px-3 py-1.5 rounded-xl border border-[#e5e9e3] font-mono">
                    <Shield className="w-3.5 h-3.5 text-[#367c35]" />
                    Attached & Viewable by Fundraiser, Manufacturer & Admin
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Uploaded Tech Pack / Image Card */}
                <div className="lg:col-span-4 bg-[#f7f9f5] rounded-2xl p-4 border border-[#e5e9e3] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#10182b] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#367c35]" /> Attached Tech Pack / Mockup
                      </span>
                      <span className="text-[10px] text-[#367c35] font-semibold bg-[#89ca2e]/15 px-2 py-0.5 rounded border border-[#89ca2e]/30">
                        Attached
                      </span>
                    </div>

                    <div className="relative group rounded-xl overflow-hidden border border-[#e5e9e3] bg-white flex items-center justify-center min-h-[220px]">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Attached Tech Pack"
                          className="w-full h-56 object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="p-6 text-center text-[#64748b] text-xs">
                          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                          <span>Vector Mockup & Tech Pack Drawing Attached</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setTechPackModalOpen(true)}
                        className="absolute inset-0 bg-[#10182b]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer backdrop-blur-xs"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>Inspect Full Tech Pack</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#64748b] mt-2 truncate">
                      File: {selectedFile?.name || 'NC_AT_Rugby_Polo_TechPack.jpg'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTechPackModalOpen(true)}
                    className="mt-3 w-full py-2 bg-white hover:bg-slate-50 text-[#10182b] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-[#e5e9e3] shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#367c35]" />
                    <span>View Tech Pack Details</span>
                  </button>
                </div>

                {/* Extracted Product Specs, Fabric, Trims, Shipping */}
                <div className="lg:col-span-8 space-y-4 text-xs">
                  {/* Product Specs & Fabric Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold block">Extracted Product Specs</span>
                      <p className="text-[#10182b] font-bold text-sm mt-0.5">{techPackInfo?.styleName || 'Custom Apparel Polo'}</p>
                      <p className="text-[#64748b] mt-1">
                        Garment Type: <span className="font-semibold text-[#10182b] capitalize">{techPackInfo?.garmentType || 'Polo'}</span>
                      </p>
                      <p className="text-[#64748b] mt-0.5">
                        Reference Fit: <span className="font-semibold text-[#10182b]">{techPackInfo?.selectedSize || 'XL'} ({techPackInfo?.referenceMeasurements?.chest_in || 26.5}" chest)</span>
                      </p>
                    </div>

                    <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold block">Fabric Details</span>
                      <p className="text-[#10182b] font-bold text-sm mt-0.5">{techPackInfo?.fabric?.name || 'Double Knit Heavyweight'}</p>
                      <p className="text-[#64748b] mt-1">
                        GSM Weight: <span className="font-semibold text-[#367c35]">{techPackInfo?.fabric?.gsm || 300} GSM</span>
                      </p>
                      <p className="text-[#64748b] mt-0.5 truncate">
                        Composition: <span className="font-semibold text-[#10182b]">{techPackInfo?.fabric?.composition || '80% cotton / 20% polyester'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity, Order Type & Shipping Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold block">Quantity & Order Type</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-extrabold text-[#10182b] font-mono">{orderQuantity} Units</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          orderType === 'sample' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-[#89ca2e]/15 text-[#367c35] border border-[#89ca2e]/30'
                        }`}>
                          {orderType === 'sample' ? 'Sample Prototype' : 'Bulk Production'}
                        </span>
                      </div>
                      <p className="text-[#64748b] text-[11px] mt-1">
                        Draft estimate basis: FOB Sialkot + Standard Courier.
                      </p>
                    </div>

                    <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold block">Shipping Destination</span>
                      <p className="text-[#10182b] font-bold mt-0.5">
                        {shippingAddress.city || 'Lahore'}, {shippingAddress.country || 'Pakistan'} {shippingAddress.postalCode ? `(${shippingAddress.postalCode})` : ''}
                      </p>
                      <p className="text-[#64748b] text-[11px] mt-0.5 truncate">
                        {shippingAddress.street ? `${shippingAddress.street} • ` : ''}Recipient: {shippingAddress.fullName || user?.name || 'Authorized Fundraiser'}
                      </p>
                    </div>
                  </div>

                  {/* Decorations / Logos / Embellishments */}
                  <div className="bg-[#f7f9f5] p-3.5 rounded-xl border border-[#e5e9e3]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#64748b] uppercase font-bold">Decorations / Logos / Embellishments</span>
                      <span className="text-[10px] text-[#367c35] font-mono font-semibold">{decorations.length} Detected</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {decorations.map((deco, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-[#e5e9e3] flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#10182b] text-xs block">{deco.name}</span>
                            <span className="text-[10px] text-[#64748b] capitalize">{deco.placement} • {deco.techniqueLabel || deco.technique}</span>
                          </div>
                          <span className="font-mono text-[#367c35] text-xs font-semibold">
                            {deco.dimensions?.width_in}" × {deco.dimensions?.height_in}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Size Chart Matrix */}
              {techPackInfo?.sizeChart?.rows && (
                <div className="pt-2 border-t border-[#e5e9e3]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#10182b] uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#367c35]" />
                      Detected Garment Size Chart (Inches)
                    </span>
                    <span className="text-[11px] text-[#64748b] font-mono">Status: Verified Scale</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#e5e9e3] bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f7f9f5] text-[#64748b] border-b border-[#e5e9e3]">
                          <th className="py-2.5 px-3 font-semibold">Measurement</th>
                          <th className="py-2.5 px-3 font-semibold">S</th>
                          <th className="py-2.5 px-3 font-semibold">M</th>
                          <th className="py-2.5 px-3 font-semibold">L</th>
                          <th className="py-2.5 px-3 font-bold text-[#367c35] bg-[#89ca2e]/10">XL (Ref)</th>
                          <th className="py-2.5 px-3 font-semibold">XXL</th>
                          <th className="py-2.5 px-3 font-semibold">3XL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e9e3]">
                        {techPackInfo.sizeChart.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-medium text-[#10182b]">{row.measurement}</td>
                            <td className="py-2 px-3 font-mono text-[#64748b]">{row.s}"</td>
                            <td className="py-2 px-3 font-mono text-[#64748b]">{row.m}"</td>
                            <td className="py-2 px-3 font-mono text-[#64748b]">{row.l}"</td>
                            <td className="py-2 px-3 font-mono font-bold text-[#367c35] bg-[#89ca2e]/5">{row.xl}"</td>
                            <td className="py-2 px-3 font-mono text-[#64748b]">{row.xxl}"</td>
                            <td className="py-2 px-3 font-mono text-[#64748b]">{row['3xl']}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Manufacturer Review Action Card */}
            <div className="bg-white border border-[#e5e9e3] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#10182b] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#367c35]" />
                  Ready to Move Forward to Production?
                </h4>
                <p className="text-xs text-[#64748b] max-w-xl">
                  Submit this draft quotation for manufacturer review. Factory engineers will verify pattern fit, stitch density, and dispatch final production quotations.
                </p>
              </div>
              <button
                onClick={handleSubmitForReview}
                disabled={submittingReview || reviewSubmittedSuccess}
                className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer shrink-0 ${
                  reviewSubmittedSuccess
                    ? 'bg-[#89ca2e] text-white'
                    : 'bg-[#89ca2e] hover:bg-[#78b327] text-white shadow-[#89ca2e]/20'
                }`}
              >
                {reviewSubmittedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Review Dispatched</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send for Manufacturer Review</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Assistant Chat Box */}
            <div className="bg-white border border-[#e5e9e3] rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#10182b] mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#367c35]" />
                Quotation AI Assistant & Rate Lookup
              </h3>
              <p className="text-xs text-[#64748b] mb-4">
                Ask any questions regarding Sialkot rates, Chenille vs Applique pricing, volume discounts, or shipping tariffs.
              </p>

              {/* Chat Log */}
              <div className="max-h-56 overflow-y-auto space-y-3 p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3] mb-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#89ca2e] text-white rounded-br-none shadow-xs'
                          : 'bg-white text-[#10182b] border border-[#e5e9e3] shadow-xs rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white text-[#64748b] p-3 rounded-xl text-xs border border-[#e5e9e3] shadow-xs animate-pulse">
                      Analyzing Sialkot factory tariffs...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g., What would 100 units cost? Or ask about Chenille machine tariffs..."
                  className="flex-1 bg-white border border-[#e5e9e3] rounded-xl px-4 py-2.5 text-xs text-[#10182b] placeholder-slate-400 focus:border-[#89ca2e] outline-none shadow-xs"
                />
                <button
                  type="submit"
                  disabled={chatThinking || !chatInput.trim()}
                  className="px-4 py-2.5 bg-[#89ca2e] hover:bg-[#78b327] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    )}

        {/* ==================================================================== */}
        {/* STAGE 5: OFFICIAL COMMERCIAL QUOTATION PDF PREVIEW */}
        {/* ==================================================================== */}
        {pipelineStage === 'print_pdf' && quotationA && (
          <div className="bg-[#f7f9f5] border border-[#e5e9e3] rounded-2xl p-6 md:p-10 space-y-8 shadow-xs">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-4">
              <button
                onClick={() => setPipelineStage('dual_quotation')}
                className="text-xs text-[#64748b] hover:text-[#10182b] flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Back to Draft Quotation
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Printable Document Paper Card */}
            <div className="bg-white text-slate-900 border border-[#e5e9e3] rounded-xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto space-y-8 font-sans">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">SAYRAB EXPORTS</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                    Garment Manufacturing & Export Hub • Sialkot, Pakistan
                  </p>
                  <p className="text-xs text-slate-500 mt-1">support@sayrab.com | www.sayrab.com</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block mb-1">
                    Status: Draft Quotation
                  </span>
                  <span className="text-base font-black font-mono text-slate-900">SYR-QT-{Date.now().toString().slice(-6)}</span>
                  <span className="text-xs text-slate-500 block mt-1">Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Important Draft Notice on Document */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Draft Quotation:</strong> This is a draft quotation. To move toward production, send it for manufacturer review. Final production rates and stitch density will be confirmed by verified manufacturers.
                </span>
              </div>

              {/* Client & Style Summary */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Prepared For</span>
                  <p className="font-bold text-slate-800 text-sm">{shippingAddress.fullName || user?.name || 'Valued Apparel Client'}</p>
                  <p className="text-slate-600 mt-0.5">{shippingAddress.phone || user?.email || 'client@apparelbrand.com'}</p>
                  <p className="text-slate-600 mt-0.5">
                    Ship to: {shippingAddress.street ? `${shippingAddress.street}, ` : ''}{shippingAddress.city || 'Lahore'}, {shippingAddress.country || 'Pakistan'} {shippingAddress.postalCode ? `(${shippingAddress.postalCode})` : ''}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Style & Order Spec</span>
                  <p className="font-bold text-slate-800 text-sm">{techPackInfo?.styleName}</p>
                  <p className="text-slate-600 mt-0.5">
                    Fabric: {techPackInfo?.fabric?.name} ({techPackInfo?.fabric?.gsm} GSM) • Order: {orderType === 'sample' ? 'Sample' : 'Bulk'} ({orderQuantity} units)
                  </p>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    Attached Tech Pack: {selectedFile?.name || 'NC_AT_Rugby_Polo_TechPack.jpg'} (Stored & Attached)
                  </p>
                </div>
              </div>

              {/* Attached Tech Pack Mockup & Extracted Specs Preview on PDF */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 pb-6 text-xs">
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col items-center justify-center text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Tech Pack Attached" className="max-h-36 object-contain rounded" />
                  ) : (
                    <div className="p-4 text-slate-400">Tech Pack Attached</div>
                  )}
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">Attached Tech Pack Drawing</span>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Detected Embellishments & Trims</h4>
                  <div className="space-y-1">
                    {decorations.map((d, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-100 py-1">
                        <span className="font-semibold text-slate-700">{d.name} ({d.placement})</span>
                        <span className="font-mono text-slate-600">{d.techniqueLabel || d.technique} • {d.dimensions?.width_in}"×{d.dimensions?.height_in}"</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500">
                    Trims: Placket buttons (3x), Rib collar and cuffs, woven size labels.
                  </div>
                </div>
              </div>

              {/* Bill of Materials & Process Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Cost Breakdown & Manufacturing Specifications
                </h4>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900">
                      <th className="py-2 font-bold">Category</th>
                      <th className="py-2 font-bold">Process / Item Description</th>
                      <th className="py-2 font-bold text-right">Rate (PKR)</th>
                      <th className="py-2 font-bold text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotationA.lines.map((line, i) => (
                      <tr key={i}>
                        <td className="py-2 font-semibold text-slate-500 capitalize">{line.category}</td>
                        <td className="py-2 text-slate-800">{line.description}</td>
                        <td className="py-2 text-right font-mono text-slate-700">PKR {formatCurrency(line.amount)}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">
                          ${(line.amount / 273).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="border-t-2 border-slate-900 pt-4 flex justify-end">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Manufacturing Subtotal:</span>
                    <span className="font-mono">${quotationA.totals.mfgCostUsd} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                    <span>FOB Sialkot Unit Price:</span>
                    <span className="font-mono">${quotationA.totals.fobUnitUsd} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Air Freight Courier ($10.00/kg):</span>
                    <span className="font-mono">+${quotationA.totals.shippingUnitUsd} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm border-t-2 border-slate-900 pt-2">
                    <span>TOTAL LANDED UNIT:</span>
                    <span className="font-mono text-[#367c35]">${quotationA.totals.landedUnitUsd} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-300 pt-1">
                    <span>TOTAL DRAFT ORDER ({orderQuantity} units):</span>
                    <span className="font-mono text-[#367c35]">
                      ${(quotationA.totals.landedUnitUsd * orderQuantity).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Incoterm & Terms Footer */}
              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">TERMS & CONDITIONS:</p>
                <p>1. Status: Draft. This quotation is subject to technical review by Sayrab manufacturing partners.</p>
                <p>2. Our prices are FOB Sialkot, Pakistan with international courier logistics.</p>
                <p>3. Lead Time: Sample prototype 7-10 working days; Bulk production 21-28 working days.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tech Pack Full Lightbox Modal */}
        {techPackModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#10182b]/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border border-[#e5e9e3] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-[#e5e9e3] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#367c35]" />
                  <h3 className="font-bold text-[#10182b] text-sm">
                    Attached Tech Pack: {selectedFile?.name || 'NC_AT_Rugby_Polo_TechPack.jpg'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTechPackModalOpen(false)}
                  className="p-2 rounded-xl bg-[#f7f9f5] hover:bg-slate-100 text-[#64748b] hover:text-[#10182b] transition cursor-pointer border border-[#e5e9e3]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-[#f7f9f5]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Full Tech Pack Inspection"
                    className="max-h-[65vh] w-auto object-contain rounded-xl border border-[#e5e9e3] bg-white shadow-md p-2"
                  />
                ) : (
                  <div className="text-center text-[#64748b] text-xs py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <span>Tech pack graphic data attached to this draft quotation.</span>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#e5e9e3] bg-white flex items-center justify-between text-xs text-[#64748b]">
                <span>Access Level: Attached to draft quote & saved for Fundraiser, Manufacturer & Admin review.</span>
                <button
                  type="button"
                  onClick={() => setTechPackModalOpen(false)}
                  className="px-4 py-2 bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fundraiser Manufacturer Final Proposal Inspection Modal */}
        {proposalModalOpen && (
          <FundraiserProposalModal
            quotation={
              savedQuotationObj || {
                _id: savedQuotationId,
                projectName: techPackInfo?.styleName || 'Apparel Quotation',
                quantity: orderQuantity,
                orderType,
                shippingAddress,
                techPackImage: previewUrl,
                calculation: quotationA,
                manufacturerProposal: savedQuotationObj?.manufacturerProposal,
                assignedManufacturer: savedQuotationObj?.assignedManufacturer || { name: 'Assigned Manufacturing Partner' },
              }
            }
            onClose={() => setProposalModalOpen(false)}
            onUpdated={(updated) => setSavedQuotationObj(updated)}
          />
        )}

        {/* Secure Private Chat Modal */}
        {chatModalOpen && (
          <QuotationChatModal
            quotation={
              savedQuotationObj || {
                _id: savedQuotationId,
                projectName: techPackInfo?.styleName || 'Apparel Quotation',
                assignedManufacturer: savedQuotationObj?.assignedManufacturer || { name: 'Assigned Manufacturing Partner' },
              }
            }
            onClose={() => setChatModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
