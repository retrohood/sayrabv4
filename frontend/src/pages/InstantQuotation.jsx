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
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

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
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [marginPct, setMarginPct] = useState(30);

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
        projectName: 'Apparel Tech Pack Quotation',
      });

      const extractedInfo = step1Res.data.techPackInfo;
      setTechPackInfo(extractedInfo);
      if (extractedInfo.apiNotice) {
        setApiNotice(extractedInfo.apiNotice);
      }
      setOrderQuantity(extractedInfo.totalUnits || 1);

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
          text: `Extracted ${extractedInfo.styleName} (${extractedInfo.fabric?.name}, ${extractedInfo.fabric?.gsm} GSM). Detected ${detectedDecorations.length} embellishments proportioned against the size ${extractedInfo.selectedSize || 'XL'} chest (${extractedInfo.referenceMeasurements?.chest_in || 26.5}"). Please verify any flagged dimensions below!`,
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
    setProcessingStatus('Running Sayrab Deterministic Rate Engine and Gemini Market AI Benchmark...');

    try {
      const res = await api.post('/quotations/calculate-dual', {
        techPackInfo,
        decorations,
        quantity: orderQuantity,
        pricingOptions: {
          marginPct,
          marginMode: 'gross_margin',
        },
      });

      setQuotationA(res.data.quotationA);
      setQuotationB(res.data.quotationB);
      setComparison(res.data.comparison);
      setIsProcessing(false);
      setPipelineStage('dual_quotation');

      setChatMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'assistant',
          text: `Dual Quotation generated! Quotation A (Deterministic Rate Engine) landed unit price is $${res.data.quotationA.totals.landedUnitUsd} USD. Quotation B (Gemini Market AI benchmark) landed unit price is $${res.data.quotationB.pricing.landedPricePerUnitUsd} USD. Variance is $${res.data.comparison.unitPriceUsd.differenceUsd} USD (${res.data.comparison.unitPriceUsd.variancePct}%).`,
        },
      ]);
    } catch (err) {
      console.error('Calculation error:', err);
      setIsProcessing(false);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to calculate dual quotation');
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
    <div className={`min-h-screen bg-slate-900 text-slate-100 ${inDashboard ? 'p-2 md:p-4' : 'pt-20 pb-16 px-4 md:px-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Garment Manufacturing Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Apparel Instant Quotation Workspace
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Dual AI Engine
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Visual tech-pack digitizer & deterministic Sialkot factory costing engine (30% gross margin + $10/kg shipping).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pipelineStage === 'dual_quotation' && (
              <>
                <button
                  onClick={() => setPipelineStage('print_pdf')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Print / Export PDF
                </button>
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 flex items-center gap-2 transition"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
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
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium border border-slate-700/60 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Tech Pack
              </button>
            )}
          </div>
        </div>

        {/* API / Fallback Notice Banner */}
        {apiNotice && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{apiNotice}</span>
            </div>
            <button onClick={() => setApiNotice('')} className="text-amber-400 hover:text-amber-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pipeline Stepper Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-800">
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
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 1: UPLOAD TECH PACK IMAGE */}
        {/* ==================================================================== */}
        {pipelineStage === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Upload Area */}
            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-emerald-500/80 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl p-8 md:p-12 cursor-pointer transition flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 transition transform group-hover:scale-105">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Upload Garment Tech Pack
                </h3>
                <p className="text-sm text-slate-400 max-w-md mb-4">
                  Drag and drop your apparel tech pack image (mockup front/back, fabric specs, and size chart table).
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span>PNG, JPG, WEBP, PDF up to 25MB</span>
                </div>
              </div>

              {selectedFile && (
                <div className="w-full mt-6 bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">Ready for automated 2-step AI analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => executePipeline({ isSample: false })}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <span>Analyze Tech Pack</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Sample Runner & Overview Card */}
            <div className="space-y-6">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Verification</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Test with NC A&T Rugby Polo
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Test the complete pipeline with the uploaded tech pack: Double Knit 300 GSM, 1 Sample Unit, XL size chart reference, Chenille center banner, Bulldog sleeve, and Aggie Pride back applique.
                </p>

                <button
                  onClick={handleLoadSample}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Load Sample Tech Pack</span>
                </button>
              </div>

              {/* Manufacturing Standards Info */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Sialkot Export Rules
                </h4>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Fixed 30% Gross Profit Margin: <code>FOB = Cost / (1 - 0.30)</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>International Air Courier: Default $10.00 / kg</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Fixed factory overheads: Pattern master grading & fuel/misc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dual Quotations: Rate Card Engine vs. Gemini Market AI</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 2: EXTRACTION IN PROGRESS SPINNER */}
        {/* ==================================================================== */}
        {pipelineStage === 'extracting' && isProcessing && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
              <Cpu className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Vision Processing</h3>
            <p className="text-sm text-slate-400 max-w-md animate-pulse">
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
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                      {techPackInfo.orderType === 'sample' ? 'Sample Order (1 unit)' : 'Bulk Production'}
                    </span>
                    <span className="text-xs text-slate-400">• Reference Size: {techPackInfo.selectedSize || 'XL'}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{techPackInfo.styleName}</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Order Quantity</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono text-center focus:border-emerald-500 outline-none"
                      />
                      <span className="text-xs text-slate-400 font-medium">units</span>
                    </div>
                  </div>

                  <button
                    onClick={calculateDualQuotations}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
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
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">Fabric & Weight</span>
                  <p className="text-white font-semibold mt-1">
                    {techPackInfo.fabric?.name} ({techPackInfo.fabric?.gsm} GSM)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{techPackInfo.fabric?.composition}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">Color Palette</span>
                  <div className="flex items-center gap-2 mt-2">
                    {(techPackInfo.colors || ['#00263d', '#fdb927']).map((c, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: c }} />
                        <span className="text-[10px] font-mono text-slate-400">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">Reference Scale Basis</span>
                  <p className="text-white font-semibold mt-1">
                    Chest: {techPackInfo.referenceMeasurements?.chest_in || 26.5}" (XL)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Length: {techPackInfo.referenceMeasurements?.length_in || 29.0}"</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">Trims Detected</span>
                  <p className="text-white font-semibold mt-1">
                    {(techPackInfo.trims || []).length} Trims & Accessories
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rubberised buttons, rib collar/cuffs</p>
                </div>
              </div>

              {/* Extracted Size Chart Table */}
              {techPackInfo.sizeChart?.rows && (
                <div className="mt-4 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-400" />
                      Extracted Garment Size Chart (Inches)
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      {techPackInfo.sizeChart.notes || 'Full sleeve rugby polo'}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border border-slate-700/60">
                          <th className="py-2 px-3 font-semibold">Measurement</th>
                          <th className="py-2 px-3 font-semibold">S</th>
                          <th className="py-2 px-3 font-semibold">M</th>
                          <th className="py-2 px-3 font-semibold">L</th>
                          <th className="py-2 px-3 font-bold text-emerald-400 bg-emerald-500/10">XL (Ref)</th>
                          <th className="py-2 px-3 font-semibold">XXL</th>
                          <th className="py-2 px-3 font-semibold">3XL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techPackInfo.sizeChart.rows.map((row, idx) => (
                          <tr key={idx} className="border border-slate-700/40 hover:bg-slate-900/40">
                            <td className="py-2 px-3 font-medium text-slate-200">{row.measurement}</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row.s}"</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row.m}"</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row.l}"</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-400 bg-emerald-500/5">{row.xl}"</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row.xxl}"</td>
                            <td className="py-2 px-3 font-mono text-slate-400">{row['3xl']}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Embellishments & Proportioned Dimensions List */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Identified Embellishments & Proportional Dimensions
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                      {decorations.length} logos
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
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
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{deco.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {deco.techniqueLabel || deco.technique}
                          </span>
                          {deco.needs_confirmation && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Confirm dimensions
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Placement: <span className="text-slate-300 font-medium">{deco.placementLabel || deco.placement}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Basis: {deco.scalingBasis}
                        </p>
                      </div>

                      {/* Interactive Dimensions Tweak */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                          <span className="text-slate-400">W:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={deco.width_in}
                            onChange={(e) => handleUpdateDeco(deco.id, 'width_in', e.target.value)}
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-center text-white"
                          />
                          <span className="text-slate-400">in</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                          <span className="text-slate-400">H:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={deco.height_in}
                            onChange={(e) => handleUpdateDeco(deco.id, 'height_in', e.target.value)}
                            className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-center text-white"
                          />
                          <span className="text-slate-400">in</span>
                        </div>

                        <div className="text-right pl-2">
                          <span className="text-[11px] text-slate-400 block">Area</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{deco.area_sq_in} sq.in</span>
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
        {/* STAGE 4: DUAL QUOTATIONS (SIDE-BY-SIDE PRESENTATION) */}
        {/* ==================================================================== */}
        {pipelineStage === 'dual_quotation' && quotationA && quotationB && (
          <div className="space-y-6">
            {/* Top Summary Banner */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                      Dual Quotation Verified
                    </span>
                    <span className="text-xs text-slate-400">• Order: {orderQuantity} unit(s) ({techPackInfo?.orderType})</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {techPackInfo?.styleName || 'Apparel Quotation'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Comparing Sialkot Rate Card Engine against Gemini Market AI benchmark (30% Gross Margin & $10.00/kg Shipping).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-right">
                    <span className="text-[11px] text-slate-400 block">Variance (A vs B)</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      ${comparison?.unitPriceUsd?.differenceUsd} USD ({comparison?.unitPriceUsd?.variancePct}%)
                    </span>
                  </div>
                  <button
                    onClick={() => setPipelineStage('print_pdf')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Official Quotation PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual Quotation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ------------------------------------------------------------- */}
              {/* QUOTATION A: SAYRAB DETERMINISTIC RATE ENGINE */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-slate-800/80 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1 px-4 rounded-bl-xl">
                  Quotation A: Rate Card Engine
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Deterministic Sialkot Engine</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Calculated using factory verified rate sheets, exact size brackets, fuel overhead, and digitizing setup.
                  </p>

                  {/* Big Price Display */}
                  <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/60 mb-6 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Landed Unit Price</span>
                      <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                        ${quotationA.totals.landedUnitUsd}{' '}
                        <span className="text-xs font-normal text-slate-400">USD</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        PKR {formatCurrency(quotationA.totals.finalTotal)} total order
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">FOB Unit Price</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${quotationA.totals.fobUnitUsd} USD
                      </span>
                      <span className="text-[11px] text-emerald-400 block font-medium">30% Gross Margin</span>
                    </div>
                  </div>

                  {/* Line Items Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                      Engine Line Items Breakdown
                    </span>
                    {quotationA.lines.map((line, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`w-2 h-2 rounded-full ${
                            line.category === 'fabric' ? 'bg-blue-400' :
                            line.category === 'embellishment' ? 'bg-amber-400' :
                            line.category === 'construction' ? 'bg-emerald-400' : 'bg-purple-400'
                          }`} />
                          <span className="text-slate-300 truncate">{line.description}</span>
                        </div>
                        <div className="text-right font-mono whitespace-nowrap">
                          <span className="text-white font-semibold">PKR {formatCurrency(line.amount)}</span>
                          <span className="text-[10px] text-slate-400 block">(${(line.amount / 273).toFixed(2)})</span>
                        </div>
                      </div>
                    ))}

                    {/* Fixed Overhead & Shipping */}
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-300">Factory Gross Margin (30%)</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        PKR {formatCurrency(quotationA.totals.margin)} (${quotationA.totals.marginUsd})
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-300">Air Shipping ($10.00/kg @ 0.65kg)</span>
                      <span className="text-blue-400 font-mono font-bold">
                        PKR {formatCurrency(quotationA.totals.shipping)} (${quotationA.totals.shippingUnitUsd})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400">
                  <p>Incoterm: FOB Sialkot, Pakistan. Air freight calculated at standard $10.00 / kg rate.</p>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* QUOTATION B: GEMINI DIRECT MARKET AI BENCHMARK */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-slate-800/80 border-2 border-blue-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-blue-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1 px-4 rounded-bl-xl">
                  Quotation B: Gemini Market AI
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Gemini Market AI Benchmark</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Independent market intelligence simulation calibrated directly for export apparel clusters in Sialkot.
                  </p>

                  {/* Big Price Display */}
                  <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/60 mb-6 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Landed Unit Price</span>
                      <div className="text-3xl font-black text-blue-400 font-mono mt-1">
                        ${quotationB.pricing.landedPricePerUnitUsd}{' '}
                        <span className="text-xs font-normal text-slate-400">USD</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        PKR {formatCurrency(Math.round(quotationB.pricing.landedPricePerUnitUsd * 273))} total order
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">FOB Unit Price</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${quotationB.pricing.fobPriceUsd} USD
                      </span>
                      <span className="text-[11px] text-blue-400 block font-medium">30% Gross Margin</span>
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                      Gemini Factory Costing Estimates
                    </span>

                    {Object.entries(quotationB.costBreakdown || {}).map(([key, val]) => {
                      if (key === 'totalManufacturingCost') return null;
                      return (
                        <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
                          <div>
                            <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            {val.notes && <span className="text-[10px] text-slate-400 block">{val.notes}</span>}
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-white font-semibold">${val.usd} USD</span>
                            <span className="text-[10px] text-slate-400 block">(PKR {formatCurrency(val.pkr)})</span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-300">Factory Gross Margin (30%)</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ${quotationB.pricing.marginUsd} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-300">Air Shipping ($10.00/kg)</span>
                      <span className="text-blue-400 font-mono font-bold">
                        ${quotationB.pricing.shippingUsd} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bulk Scale Projection */}
                {quotationB.bulkComparison && (
                  <div className="mt-6 pt-4 border-t border-slate-700/60 bg-blue-500/5 -mx-6 -mb-6 p-4 rounded-b-2xl border-t border-blue-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-blue-300 font-bold block">
                          Bulk Tier Projection ({quotationB.bulkComparison.bulkQuantityTier})
                        </span>
                        <span className="text-slate-400 text-[11px]">Amortized digitizing & setup fees</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-white font-mono">
                          ${quotationB.bulkComparison.projectedBulkLandedUsd} USD
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold block flex items-center gap-0.5 justify-end">
                          <TrendingDown className="w-3 h-3" />
                          {quotationB.bulkComparison.bulkSavingsPercent}% savings
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Chat Box */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Quotation AI Assistant & Rate Lookup
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Ask any questions regarding Sialkot rates, Chenille vs Applique pricing, volume discounts, or shipping tariffs.
              </p>

              {/* Chat Log */}
              <div className="max-h-56 overflow-y-auto space-y-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 mb-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-400 p-3 rounded-xl text-xs border border-slate-700/80 animate-pulse">
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
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={chatThinking || !chatInput.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STAGE 5: OFFICIAL COMMERCIAL QUOTATION PDF PREVIEW */}
        {/* ==================================================================== */}
        {pipelineStage === 'print_pdf' && quotationA && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 md:p-10 space-y-8">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <button
                onClick={() => setPipelineStage('dual_quotation')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Back to Dual Quotation
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Printable Document Paper Card */}
            <div className="bg-white text-slate-900 rounded-xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto space-y-8 font-sans">
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Proforma Quotation</span>
                  <span className="text-base font-black font-mono text-slate-900">SYR-QT-{Date.now().toString().slice(-6)}</span>
                  <span className="text-xs text-slate-500 block mt-1">Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Client & Style Summary */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Prepared For</span>
                  <p className="font-bold text-slate-800 text-sm">{user?.name || 'Valued Apparel Client'}</p>
                  <p className="text-slate-600 mt-0.5">{user?.email || 'client@apparelbrand.com'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Style & Order Spec</span>
                  <p className="font-bold text-slate-800 text-sm">{techPackInfo?.styleName}</p>
                  <p className="text-slate-600 mt-0.5">
                    Fabric: {techPackInfo?.fabric?.name} ({techPackInfo?.fabric?.gsm} GSM) • Quantity: {orderQuantity} unit(s)
                  </p>
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
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Factory Margin (30%):</span>
                    <span className="font-mono text-emerald-700 font-semibold">+${quotationA.totals.marginUsd} USD</span>
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
                    <span className="font-mono text-emerald-700">${quotationA.totals.landedUnitUsd} USD</span>
                  </div>
                </div>
              </div>

              {/* Incoterm & Terms Footer */}
              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">TERMS & CONDITIONS:</p>
                <p>1. Our prices are FOB Sialkot, Pakistan. Air freight estimate is based on $10.00 / kg standard carrier courier.</p>
                <p>2. Payment Terms: 50% advance upon sample approval, 50% prior to dispatch.</p>
                <p>3. Lead Time: Sample approval 7-10 working days; Bulk production 21-28 working days.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
