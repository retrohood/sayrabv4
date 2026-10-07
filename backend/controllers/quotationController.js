import mongoose from 'mongoose';
import Quotation from '../models/Quotation.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';
import { sampleExtractions } from '../services/quotationData.js';
import { calculateQuotation } from '../services/quotationEngine.js';
import {
  extractTechPackInfo,
  identifyLogosAndEmbellishments,
  generateGeminiMarketQuotation,
  lookupMarketRateWithGemini,
  analyzeTechPackWithGemini,
} from '../services/geminiTechPackService.js';

const normalizeDesignSpec = (body) => {
  if (body.designSpec) return body.designSpec;
  if (body.quoteContext && body.quoteContext.requirements) {
    const req = body.quoteContext.requirements;
    const qty = Number(req.quantity?.value) || 1;
    const [w, h] = String(req.dimensions?.value || '').split(/x|×/).map(p => Number(p.replace(/[^\d.]/g, '')) || null);
    return {
      quantity: qty,
      garment: {
        type: req.garmentType?.value || 'polo',
        style: req.product?.value || 'Custom Polo',
        quantity: qty,
      },
      fabrics: [{
        role: 'main',
        name: req.material?.value || 'Double Knit Fabric',
        consumption_kg: 0.65,
      }],
      decorations: [{
        type: String(req.finish?.value || '').toLowerCase().includes('embroid') ? 'embroidery' : 'chenille_embroidery',
        placement: 'front',
        width_in: w || 12,
        height_in: h || 4.5,
        quantity: 1,
      }],
      trims: [{
        type: 'button',
        quantity_per_garment: 3,
      }]
    };
  }
  if (body.sampleKey && sampleExtractions[body.sampleKey]) return sampleExtractions[body.sampleKey];
  return body;
};

const serializeQuotation = (quotation) => {
  if (!quotation) return null;
  if (quotation.toObject) return quotation.toObject();
  return quotation;
};

export const getQuotationSamples = async (req, res) => {
  res.json(sampleExtractions);
};

// ============================================================================
// STEP 1: Extract Fabric, GSM, Units, Size Chart Table from Tech Pack
// ============================================================================
export const analyzeStep1 = async (req, res) => {
  try {
    const result = await extractTechPackInfo({
      fileData: req.body.fileData,
      mimeType: req.body.mimeType,
      text: req.body.text,
      quantity: req.body.quantity,
      projectName: req.body.projectName,
      notes: req.body.notes,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// STEP 2: Visually Detect Embellishments & Calibrate to Size Chart Scale
// ============================================================================
export const analyzeStep2 = async (req, res) => {
  try {
    const result = await identifyLogosAndEmbellishments({
      fileData: req.body.fileData,
      mimeType: req.body.mimeType,
      techPackInfo: req.body.techPackInfo,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// STEP 5: Gemini Direct Market AI Quotation (Quotation B)
// ============================================================================
export const getGeminiMarketQuote = async (req, res) => {
  try {
    const result = await generateGeminiMarketQuotation({
      techPackInfo: req.body.techPackInfo,
      decorations: req.body.decorations,
      quantity: req.body.quantity || 1,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Rate Lookup Fallback
export const lookupRate = async (req, res) => {
  try {
    const result = await lookupMarketRateWithGemini({
      technique: req.body.technique,
      category: req.body.category,
      garmentType: req.body.garmentType,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================================
// DUAL QUOTATION: Quotation A (Deterministic Engine) vs Quotation B (Gemini Market AI)
// ============================================================================
export const calculateDualQuotation = async (req, res) => {
  try {
    const { techPackInfo, decorations, quantity = 1, pricingOptions = {} } = req.body;

    // Build complete DesignSpec for Sayrab Rate Engine
    const designSpec = {
      id: `TECHPACK-${Date.now()}`,
      quantity: Number(quantity || techPackInfo?.totalUnits || 1),
      garment: {
        type: techPackInfo?.garmentType || 'polo',
        style: techPackInfo?.styleName || 'Custom Rugby Polo',
        quantity: Number(quantity || techPackInfo?.totalUnits || 1),
        size_reference: techPackInfo?.selectedSize || 'XL',
      },
      measurements: techPackInfo?.referenceMeasurements || { chest_in: 26.5, length_in: 29.0 },
      sizeChart: techPackInfo?.sizeChart || null,
      fabrics: [
        techPackInfo?.fabric || {
          name: 'Double Knit Fabric',
          composition: '80% cotton / 20% polyester',
          gsm: 300,
          role: 'main',
        },
      ],
      decorations: decorations || [],
      trims: techPackInfo?.trims || [
        { type: 'button', name: 'Placket Buttons', quantity_per_garment: 3 },
        { type: 'rib', name: 'Rib Collar & Cuffs', quantity_per_garment: 1 },
        { type: 'sizetag', name: 'Woven Size Tag', quantity_per_garment: 1 },
      ],
    };

    // 1. Calculate Quotation A: Deterministic Sialkot Rate Card Engine
    const quotationA = calculateQuotation(designSpec, pricingOptions);

    // 2. Calculate Quotation B: Gemini Direct Market AI Benchmark
    const geminiQuoteResult = await generateGeminiMarketQuotation({
      techPackInfo,
      decorations,
      quantity: designSpec.quantity,
    });
    const quotationB = geminiQuoteResult.quotation;

    const qbLanded = Number(quotationB?.pricing?.landedPricePerUnitUsd ?? quotationB?.pricing?.landedUnitTotalUsd ?? 45.23);
    const qbFob = Number(quotationB?.pricing?.fobPriceUsd ?? 38.73);
    const qbShipping = Number(quotationB?.pricing?.shippingUsd ?? 6.50);

    // Ensure quotationB has both aliases for frontend ease
    if (quotationB?.pricing) {
      quotationB.pricing.landedPricePerUnitUsd = qbLanded;
      quotationB.pricing.landedUnitTotalUsd = qbLanded;
      quotationB.pricing.fobPriceUsd = qbFob;
      quotationB.pricing.shippingUsd = qbShipping;
    }

    // 3. Compute Side-by-Side Comparison
    const comparison = {
      unitPriceUsd: {
        quotationA_engine: quotationA.totals.landedUnitUsd,
        quotationB_gemini: qbLanded,
        differenceUsd: +(quotationA.totals.landedUnitUsd - qbLanded).toFixed(2),
        variancePct: +(
          ((quotationA.totals.landedUnitUsd - qbLanded) / qbLanded) *
          100
        ).toFixed(1),
      },
      fobUsd: {
        quotationA_engine: quotationA.totals.fobUnitUsd,
        quotationB_gemini: qbFob,
        differenceUsd: +(quotationA.totals.fobUnitUsd - qbFob).toFixed(2),
      },
      shippingUsd: {
        quotationA_engine: quotationA.totals.shippingUnitUsd,
        quotationB_gemini: qbShipping,
        ratePerKg: '$10.00 / kg standard',
      },
      marginPct: {
        quotationA_engine: '30% Gross Margin',
        quotationB_gemini: '30% Gross Margin',
      },
      breakdownComparison: [
        {
          component: 'Fabric & Raw Materials',
          enginePkr: quotationA.lines.filter((l) => l.category === 'fabric').reduce((s, l) => s + l.amount, 0),
          geminiPkr: quotationB.costBreakdown?.fabricCost?.pkr || 1400,
        },
        {
          component: 'Cutting & Sewing',
          enginePkr: quotationA.lines.filter((l) => l.category === 'construction').reduce((s, l) => s + l.amount, 0),
          geminiPkr: quotationB.costBreakdown?.construction?.pkr || 1300,
        },
        {
          component: 'Embellishments & Logos',
          enginePkr: quotationA.lines.filter((l) => l.category === 'embellishment').reduce((s, l) => s + l.amount, 0),
          geminiPkr: quotationB.costBreakdown?.embellishments?.pkr || 3400,
        },
        {
          component: 'Trims & Ribbing',
          enginePkr: quotationA.lines.filter((l) => l.category === 'trim').reduce((s, l) => s + l.amount, 0),
          geminiPkr: quotationB.costBreakdown?.trims?.pkr || 350,
        },
        {
          component: 'Pattern Setup & Fuel Overhead',
          enginePkr: quotationA.lines.filter((l) => l.category === 'fixed').reduce((s, l) => s + l.amount, 0),
          geminiPkr: quotationB.costBreakdown?.fixedSetup?.pkr || 950,
        },
      ],
    };

    // Save quotation if authenticated user
    let savedQuotation = null;
    const userId = req.user?._id;
    if (userId) {
      const quotationPayload = {
        owner: userId,
        projectName: req.body.projectName || techPackInfo?.styleName || 'Custom Tech Pack Quotation',
        clientName: req.body.clientName || 'Apparel Client',
        notes: req.body.notes || '',
        designSpec,
        calculation: quotationA,
        status: 'draft',
      };

      if (!isDatabaseConnected(mongoose)) {
        savedQuotation = inMemoryDB.quotations.create(quotationPayload);
      } else {
        savedQuotation = await Quotation.create(quotationPayload);
      }
    }

    res.json({
      quotationA,
      quotationB,
      comparison,
      designSpec,
      savedId: savedQuotation?._id || null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Legacy analyze endpoint
export const analyzeTechPack = async (req, res) => {
  try {
    const analysis = await analyzeTechPackWithGemini({
      text: req.body.text,
      fileData: req.body.fileData,
      mimeType: req.body.mimeType,
      quantity: req.body.quantity,
      projectName: req.body.projectName,
      notes: req.body.notes,
    });
    res.json(analysis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateAndSaveQuotation = async (req, res) => {
  try {
    const designSpec = normalizeDesignSpec(req.body);
    const calculation = calculateQuotation(designSpec, req.body.pricing || {});
    const quotationPayload = {
      owner: req.user?._id || new mongoose.Types.ObjectId(),
      campaign: req.body.campaignId || undefined,
      projectName: req.body.projectName || designSpec.garment?.style || 'Untitled quotation',
      clientName: req.body.clientName || '',
      notes: req.body.notes || '',
      quoteContext: req.body.quoteContext || null,
      designSpec,
      calculation,
      versions: req.body.versions || [],
      status: calculation.status,
    };

    if (!isDatabaseConnected(mongoose)) {
      const quotation = inMemoryDB.quotations.create(quotationPayload);
      return res.status(201).json(quotation);
    }

    const quotation = await Quotation.create(quotationPayload);
    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyQuotations = async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.find({ owner: req.user._id }));
    }

    const quotations = await Quotation.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    const serialized = serializeQuotation(quotation);
    if (!serialized) return res.status(404).json({ message: 'Quotation not found' });
    if (req.user && serialized.owner && serialized.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(serialized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    let current;
    if (!isDatabaseConnected(mongoose)) {
      current = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      current = await Quotation.findById(req.params.id);
    }

    const serialized = serializeQuotation(current);
    if (!serialized) return res.status(404).json({ message: 'Quotation not found' });
    if (req.user && serialized.owner && serialized.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const designSpec = req.body.designSpec || serialized.designSpec;
    const calculation = req.body.recalculate === false
      ? serialized.calculation
      : calculateQuotation(designSpec, req.body.pricing || {});
    const updates = {
      projectName: req.body.projectName ?? serialized.projectName,
      clientName: req.body.clientName ?? serialized.clientName,
      notes: req.body.notes ?? serialized.notes,
      quoteContext: req.body.quoteContext ?? serialized.quoteContext,
      designSpec,
      calculation,
      versions: req.body.versions ?? serialized.versions ?? [],
      status: req.body.status || calculation.status,
    };

    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const quotation = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approveQuotation = async (req, res) => {
  req.body.status = 'approved';
  req.body.recalculate = false;
  return updateQuotation(req, res);
};
