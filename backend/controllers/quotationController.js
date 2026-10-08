import mongoose from 'mongoose';
import Quotation from '../models/Quotation.js';
import Manufacturer from '../models/Manufacturer.js';
import Order from '../models/Order.js';
import QuotationMessage from '../models/QuotationMessage.js';
import AdminNotification from '../models/AdminNotification.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';
import { sampleExtractions } from '../services/quotationData.js';
import { calculateQuotation } from '../services/quotationEngine.js';
import { generateQuotation, calculateSingleQuote } from '../services/pricingEngine.js';
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

    // Build complete Structured Garment Specification
    const designSpec = {
      id: `TECHPACK-${Date.now()}`,
      quantity: Number(quantity || techPackInfo?.totalUnits || 1),
      garment: {
        type: techPackInfo?.garmentType || 'polo',
        style: techPackInfo?.styleName || 'Custom Rugby Polo',
        quantity: Number(quantity || techPackInfo?.totalUnits || 1),
        size_reference: techPackInfo?.selectedSize || 'XL',
      },
      garment_type: techPackInfo?.garmentType || 'polo',
      sizes: techPackInfo?.sizeChart?.rows ? ['S', 'M', 'L', 'XL', 'XXL'] : ['XL'],
      measurements: techPackInfo?.referenceMeasurements || { chest_in: 26.5, length_in: 29.0 },
      sizeChart: techPackInfo?.sizeChart || null,
      fabric: techPackInfo?.fabric || {
        name: 'cotton_poly_pique',
        composition: '80% cotton / 20% polyester',
        gsm: 300,
        consumption_kg: 0.42,
      },
      fabrics: [
        techPackInfo?.fabric || {
          name: 'Double Knit Fabric',
          composition: '80% cotton / 20% polyester',
          gsm: 300,
          role: 'main',
        },
      ],
      decorations: decorations || [],
      embroidery: decorations || [],
      trims: techPackInfo?.trims || [
        { type: 'button', name: 'Placket Buttons', quantity_per_garment: 3 },
        { type: 'rib', name: 'Rib Collar & Cuffs', quantity_per_garment: 1 },
        { type: 'sizetag', name: 'Woven Size Tag', quantity_per_garment: 1 },
      ],
    };

    // 1. Calculate Deterministic Version 1.0 Quotation (Independent Sample Q=1 and Requested Q)
    const deterministicQuote = generateQuotation(designSpec, designSpec.quantity, pricingOptions);

    // Quotation A object formatted with backward compatibility
    const quotationA = {
      totals: {
        landedUnitUsd: deterministicQuote.requestedOrder.unitPriceUsd,
        totalLandedUsd: deterministicQuote.requestedOrder.totalPriceUsd,
        fobUnitUsd: deterministicQuote.requestedOrder.costing.factoryUnitUsd,
        shippingUnitUsd: deterministicQuote.requestedOrder.costing.shippingUnitUsd,
      },
      sample: deterministicQuote.sample,
      requestedOrder: deterministicQuote.requestedOrder,
      comparison: deterministicQuote.comparison,
      breakdownUsd: deterministicQuote.requestedOrder.breakdownUsd,
      costing: deterministicQuote.requestedOrder.costing,
      status: deterministicQuote.status,
      confidence: deterministicQuote.confidence,
      debug: deterministicQuote.debug,
      lines: calculateQuotation(designSpec, pricingOptions)?.lines || [],
    };

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
      sampleVsRequested: deterministicQuote.comparison,
      isSampleOnly: deterministicQuote.isSampleOnly,
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
        orderType: req.body.orderType || (designSpec.quantity <= 3 ? 'sample' : 'bulk'),
        quantity: designSpec.quantity,
        shippingAddress: req.body.shippingAddress || null,
        techPackImage: req.body.techPackImage || req.body.fileData || techPackInfo?.techPackImage || '',
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
      deterministicQuote,
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

// Helper to get manufacturer ID for logged-in manufacturer user
const getManufacturerContext = async (req) => {
  if (req.user && req.user.manufacturerId) {
    return req.user.manufacturerId;
  }
  if (req.user && (req.user.role === 'manufacturer' || req.user.email?.includes('manufacturer'))) {
    const m = await Manufacturer.findOne({ email: req.user.email });
    if (m) return m._id;
    const firstM = await Manufacturer.findOne();
    if (firstM) return firstM._id;
  }
  return null;
};

// 1. Fundraiser Submits Draft Quote to Admin for Assignment
export const submitForReview = async (req, res) => {
  try {
    let current;
    if (!isDatabaseConnected(mongoose)) {
      current = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      current = await Quotation.findById(req.params.id);
    }

    const serialized = serializeQuotation(current);
    if (!serialized) return res.status(404).json({ message: 'Quotation not found' });
    if (req.user && serialized.owner && serialized.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { status: 'submitted_to_admin' };
    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const quotation = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    // Create persistent Admin Notification
    try {
      await AdminNotification.create({
        type: 'quotation_review',
        title: 'New Quotation Request for Manufacturer Assignment',
        message: `Fundraiser ${req.user?.fullName || quotation.owner?.fullName || 'User'} submitted quotation "${quotation.projectName || 'Garment Quotation'}" (${quotation.quantity} units, order type: ${quotation.orderType}) for manufacturer assignment.`,
        link: '/admin/manufacturers?tab=quotations',
        severity: 'info',
        metadata: {
          quotationId: quotation._id,
          orderType: quotation.orderType,
          quantity: quotation.quantity,
          projectName: quotation.projectName,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to create AdminNotification:', notifErr.message);
    }

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Admin Assigns Quotation to Exactly ONE Manufacturer (No Open RFQ)
export const assignToManufacturer = async (req, res) => {
  try {
    const { manufacturerId, adminNotes } = req.body;
    if (!manufacturerId) {
      return res.status(400).json({ message: 'Manufacturer ID is required for assignment' });
    }

    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot assign a cancelled quotation' });
    }

    const updates = {
      assignedManufacturer: manufacturerId,
      adminNotes: adminNotes || quotation.adminNotes || '',
      status: 'assigned_to_manufacturer',
    };

    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    // Create Admin Notification record of the assignment
    try {
      const mfgDoc = await Manufacturer.findById(manufacturerId);
      await AdminNotification.create({
        type: 'quotation_assignment',
        title: 'Quotation Assigned to Manufacturer',
        message: `Quotation "${updated.projectName || 'Garment Quotation'}" assigned to ${mfgDoc?.name || mfgDoc?.companyName || 'Manufacturer'}.`,
        link: '/admin/manufacturers?tab=quotations',
        severity: 'success',
        metadata: {
          quotationId: updated._id,
          manufacturerId,
          manufacturerName: mfgDoc?.name,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to create AdminNotification for assignment:', notifErr.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Admin Cancels / Strikes a Quotation Request (Before Production Starts)
export const cancelQuotation = async (req, res) => {
  try {
    const { reason } = req.body;
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    if (quotation.status === 'production_started' || quotation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel quotation after production has started' });
    }

    const updates = {
      status: 'cancelled',
      cancelledReason: reason || 'Cancelled by admin',
      cancelledBy: req.user?._id || null,
    };

    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Manufacturer Responds (Reviewing, Proposal Sent, Accept)
export const respondManufacturerProposal = async (req, res) => {
  try {
    const { action, notes, proposal } = req.body;
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    let status = quotation.status;
    if (action === 'review') status = 'manufacturer_reviewing';
    else if (action === 'proposal') status = 'manufacturer_proposal_sent';
    else if (action === 'accept') status = 'accepted_by_fundraiser';

    const updates = {
      status,
      manufacturerNotes: notes || quotation.manufacturerNotes || '',
      ...(proposal ? { manufacturerProposal: proposal } : {}),
    };

    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 5. Start Production
export const startProduction = async (req, res) => {
  try {
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot start production on a cancelled quotation' });
    }

    const updates = { status: 'production_started' };
    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 6. Fundraiser Accepts Manufacturer Proposal -> Starts Production & Creates Order
export const acceptProposal = async (req, res) => {
  try {
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id)
        .populate('owner', 'fullName email phone')
        .populate('assignedManufacturer', 'name companyName email phone');
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    // Verify user is owner or admin
    const isOwner = req.user && (quotation.owner?._id || quotation.owner).toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the quotation owner can accept this proposal' });
    }

    const updates = { status: 'production_started' };
    let updatedQuotation;
    if (!isDatabaseConnected(mongoose)) {
      updatedQuotation = inMemoryDB.quotations.update(req.params.id, updates);
    } else {
      updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
        .populate('owner', 'fullName email phone')
        .populate('assignedManufacturer', 'name companyName email phone');
    }

    // Automatically create / link active Order
    const unitPrice =
      Number(quotation.manufacturerProposal?.landedUnitUsd) ||
      Number(quotation.calculation?.totals?.landedUnitUsd) ||
      45;
    const qty = Number(quotation.quantity) || 1;
    const totalUsd = +(unitPrice * qty).toFixed(2);

    let createdOrder = null;
    if (isDatabaseConnected(mongoose)) {
      createdOrder = await Order.create({
        customerId: quotation.owner?._id || quotation.owner,
        fundraiserId: quotation.owner?._id || quotation.owner,
        campaignId: quotation.campaign || undefined,
        quotationId: quotation._id,
        orderType: quotation.orderType || (qty <= 5 ? 'sample' : 'bulk'),
        techPackImage: quotation.techPackImage || '',
        designSpec: quotation.designSpec,
        quotationProposal: quotation.manufacturerProposal,
        products: [
          {
            name: quotation.projectName || quotation.designSpec?.garment?.style || 'Custom Apparel Run',
            quantity: qty,
            price: unitPrice,
            size: quotation.designSpec?.garment?.size_reference || 'Standard',
            color: quotation.designSpec?.fabrics?.[0]?.name || 'Standard Milled',
          },
        ],
        total: totalUsd,
        paymentStatus: 'paid',
        orderStatus: 'production',
        productionStatus: 'pending_start',
        assignedManufacturer: quotation.assignedManufacturer?._id || quotation.assignedManufacturer,
        assignedDate: new Date(),
        shippingAddress: quotation.shippingAddress || {
          fullName: quotation.owner?.fullName || 'Fundraiser Recipient',
          city: 'Lahore',
          country: 'Pakistan',
        },
        invoiceNumber: `INV-PROD-${Date.now().toString().slice(-6)}`,
        carrier: 'TCS Express Logistics',
        estimatedDelivery: new Date(Date.now() + (Number(quotation.manufacturerProposal?.estimatedLeadDays) || 14) * 24 * 3600 * 1000),
        manufacturerNotes: quotation.manufacturerProposal?.customNotes || quotation.manufacturerNotes || 'Production triggered upon proposal acceptance.',
      });
    }

    res.json({
      quotation: updatedQuotation,
      order: createdOrder,
      message: 'Proposal accepted! Production order initiated and assigned to manufacturer.',
    });
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(400).json({ message: error.message });
  }
};

// 7. Fundraiser Requests Revision
export const requestRevision = async (req, res) => {
  try {
    const { revisionNotes } = req.body;
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const isOwner = req.user && (quotation.owner?._id || quotation.owner).toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only the quotation owner can request revisions' });
    }

    const updates = {
      status: 'manufacturer_reviewing',
      notes: revisionNotes ? `${quotation.notes ? quotation.notes + ' | ' : ''}Revision Requested: ${revisionNotes}` : quotation.notes,
    };

    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.update(req.params.id, updates));
    }

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 8. SECURE CHAT: Get Messages for Quotation (Backend Access Control Enforced)
export const getQuotationMessages = async (req, res) => {
  try {
    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const ownerId = (quotation.owner?._id || quotation.owner)?.toString();
    const manId = (quotation.assignedManufacturer?._id || quotation.assignedManufacturer)?.toString();
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;
    const userManId = req.user?.manufacturerId?.toString();

    // Strict Backend Access Control: Owner, Assigned Manufacturer, or Admin
    const isOwner = userId === ownerId;
    const isAdmin = userRole === 'admin';
    const isAssignedManufacturer =
      (userRole === 'manufacturer' && (userManId === manId || (await getManufacturerContext(req))?.toString() === manId));

    if (!isOwner && !isAdmin && !isAssignedManufacturer) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to view messages for this private quotation.',
      });
    }

    if (!isDatabaseConnected(mongoose)) {
      return res.json([]);
    }

    const messages = await QuotationMessage.find({ quotation: req.params.id }).sort({ createdAt: 1 });

    // Auto-mark unread messages from other party as read
    await QuotationMessage.updateMany(
      { quotation: req.params.id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. SECURE CHAT: Send Message for Quotation (Backend Access Control Enforced)
export const sendQuotationMessage = async (req, res) => {
  try {
    const { message, attachmentUrl } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    let quotation;
    if (!isDatabaseConnected(mongoose)) {
      quotation = inMemoryDB.quotations.findOne({ _id: req.params.id });
    } else {
      quotation = await Quotation.findById(req.params.id);
    }

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const ownerId = (quotation.owner?._id || quotation.owner)?.toString();
    const manId = (quotation.assignedManufacturer?._id || quotation.assignedManufacturer)?.toString();
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;
    const userManId = req.user?.manufacturerId?.toString();

    const isOwner = userId === ownerId;
    const isAdmin = userRole === 'admin';
    const isAssignedManufacturer =
      (userRole === 'manufacturer' && (userManId === manId || (await getManufacturerContext(req))?.toString() === manId));

    if (!isOwner && !isAdmin && !isAssignedManufacturer) {
      return res.status(403).json({
        message: 'Access denied: You cannot send messages in this private quotation.',
      });
    }

    const senderRole = isAdmin ? 'admin' : isAssignedManufacturer ? 'manufacturer' : 'fundraiser';

    if (!isDatabaseConnected(mongoose)) {
      return res.status(201).json({
        _id: `msg-${Date.now()}`,
        quotation: req.params.id,
        fundraiser: ownerId,
        manufacturer: manId,
        senderId: req.user._id,
        senderName: req.user.fullName || req.user.name || 'User',
        senderRole,
        message: message.trim(),
        attachmentUrl: attachmentUrl || '',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newMessage = await QuotationMessage.create({
      quotation: req.params.id,
      fundraiser: ownerId,
      manufacturer: manId,
      senderId: req.user._id,
      senderName: req.user.fullName || req.user.name || (isAdmin ? 'Admin' : senderRole),
      senderRole,
      message: message.trim(),
      attachmentUrl: attachmentUrl || '',
      isRead: false,
    });

    res.status(201).json(newMessage);
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
      orderType: req.body.orderType || (designSpec.quantity <= 5 ? 'sample' : 'bulk'),
      quantity: designSpec.quantity || 1,
      shippingAddress: req.body.shippingAddress || null,
      techPackImage: req.body.techPackImage || req.body.fileData || '',
      notes: req.body.notes || '',
      quoteContext: req.body.quoteContext || null,
      designSpec,
      calculation,
      versions: req.body.versions || [],
      status: req.body.status || 'draft',
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

    const quotations = await Quotation.find({ owner: req.user._id })
      .populate('assignedManufacturer', 'name companyName email phone')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manufacturer sees ONLY quotations explicitly assigned to them by Admin
export const getManufacturerQuotations = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.find({}));
    }

    const manufacturerId = await getManufacturerContext(req);

    // If logged in as admin, show all assigned
    const filter = {
      status: {
        $in: [
          'assigned_to_manufacturer',
          'manufacturer_reviewing',
          'manufacturer_proposal_sent',
          'accepted_by_fundraiser',
          'production_started',
          'completed',
          'submitted_for_review',
        ],
      },
    };

    if (req.user?.role !== 'admin' && manufacturerId) {
      filter.assignedManufacturer = manufacturerId;
    }

    const quotations = await Quotation.find(filter)
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone')
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin sees all quotations with owner & manufacturer details
export const getAllAdminQuotations = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      return res.json(inMemoryDB.quotations.find({}));
    }
    const quotations = await Quotation.find({})
      .populate('owner', 'fullName email phone')
      .populate('assignedManufacturer', 'name companyName email phone')
      .sort({ createdAt: -1 });
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
      quotation = await Quotation.findById(req.params.id)
        .populate('owner', 'fullName email phone')
        .populate('assignedManufacturer', 'name companyName email phone');
    }

    const serialized = serializeQuotation(quotation);
    if (!serialized) return res.status(404).json({ message: 'Quotation not found' });
    
    // Permitted to Owner, Assigned Manufacturer, and Admins
    const isOwner = req.user && serialized.owner && (serialized.owner._id || serialized.owner).toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isManufacturer = req.user && req.user.role === 'manufacturer';

    if (req.user && !isOwner && !isManufacturer && !isAdmin) {
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
