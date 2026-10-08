/**
 * SAYRAB / RETROHOOD INSTANT QUOTATION ENGINE
 * Technical Specification & Pricing Rule System - Version 1.0
 *
 * Deterministic manufacturing rate calculations & dual independent sample/bulk evaluations.
 */

export const REFERENCE_BULK_QUANTITY = 30;
export const USD_EXCHANGE_RATE = 280;

// 1. GARMENT STITCHING BASE RATES (PKR / garment at Q=30 bulk)
export const GARMENT_RATES = {
  tshirt: 650,
  tee: 650,
  polo: 850,
  complex_polo: 1250,
  panel_polo: 1250,
  rugby_polo: 1250,
  hoodie: 850,
  crewneck: 750,
  sweater: 950,
  jacket: 1400,
  reversible_zipup: 1500,
  default: 850,
};

// Stitching Quantity Multipliers
export const STITCHING_QUANTITY_RULES = [
  { minQty: 1, maxQty: 1, multiplier: 2.0, tier: 'SAMPLE' },
  { minQty: 2, maxQty: 9, multiplier: 2.5, tier: 'SMALL_SAMPLE' },
  { minQty: 10, maxQty: 29, multiplier: 1.5, tier: 'SMALL_BULK' },
  { minQty: 30, maxQty: Infinity, multiplier: 1.0, tier: 'BULK' },
];

// 2. FABRIC RATES (PKR / kg) - Quantity-independent
export const FABRIC_RATES = {
  cotton_poly_pique: 1400,
  pique: 1400,
  fleece: 1600,
  single_jersey: 1300,
  jersey: 1300,
  double_knit: 1500,
  cotton: 1350,
  polyester: 1200,
  french_terry: 1650,
  default: 1400,
};

export const DEFAULT_CONSUMPTION_KG = {
  tshirt: 0.28,
  polo: 0.42,
  rugby_polo: 0.50,
  hoodie: 0.85,
  crewneck: 0.70,
  sweater: 1.20,
  jacket: 1.10,
  default: 0.45,
};

// 3. EMBROIDERY RATES (PKR per placement at Q=30 bulk)
export const EMBROIDERY_RATES = {
  small: 400,   // up to 6 sq.in (e.g. left chest logo)
  medium: 700,  // 6 - 20 sq.in (e.g. standard chest / sleeve)
  large: 1100,  // 20+ sq.in (e.g. large back graphic)
  default: 700,
};

export const EMBROIDERY_QUANTITY_RULES = [
  { minQty: 1, maxQty: 3, multiplier: 2.5 },
  { minQty: 4, maxQty: 7, multiplier: 1.6 },
  { minQty: 8, maxQty: 14, multiplier: 1.4 },
  { minQty: 15, maxQty: 29, multiplier: 1.2 },
  { minQty: 30, maxQty: Infinity, multiplier: 1.0 },
];

// 4. CHENILLE EMBROIDERY (1.30x of regular embroidery rate)
export const CHENILLE_FACTOR = 1.30;

// 5. SCREEN PRINTING RULES
export const SCREEN_PRINT_RULES = {
  screenSetupPerColor: 2000, // PKR 2,000 one-time fixed per color screen
  baseRatePerLocation: 250,   // PKR 250 base print per placement
  quantityMultipliers: [
    { minQty: 1, maxQty: 9, multiplier: 1.5 },
    { minQty: 10, maxQty: Infinity, multiplier: 1.0 },
  ],
};

// 6. DTF / DTG DIRECT PRINTING RULES
export const DTF_DTG_RATES = {
  small: 350,
  medium: 500,
  large: 750,
  default: 500,
};

// 7. RHINESTONE RULES
export const RHINESTONE_DIE_COST = 5000; // PKR 5,000 one-time fixed die
export const RHINESTONE_PRODUCTION_BASE = 600; // PKR variable per garment

// 8. DISTRESSING RULES (PKR / unit)
export const DISTRESSING_RULES = [
  { minQty: 1, maxQty: 1, rate: 500 },
  { minQty: 2, maxQty: 9, rate: 200 },
  { minQty: 10, maxQty: 100, rate: 100 },
  { minQty: 101, maxQty: Infinity, rate: 50 },
];

// 9. PATTERN DEVELOPMENT (PKR 1,200 per size, one-time fixed)
export const PATTERN_RATE_PER_SIZE = 1200;

// 10. PATCHES (PKR 200 fixed attachment + unit patch rate)
export const PATCH_FIXED_ATTACHMENT = 200;
export const PATCH_UNIT_RATE = 150;

// 11. SHIPPING LOGISTICS RATES (PKR)
export const SHIPPING_RATES = {
  sample_q1: 2000,        // Single courier sample dispatch
  small_sample_per_unit: 1400, // Q=2-3 small lot courier
  bulk_per_unit: 500,     // Q>=4 export freight per unit
};

/**
 * Helper: Find matching quantity multiplier from table
 */
export function getMultiplier(rules, qty) {
  const match = rules.find((r) => qty >= r.minQty && qty <= r.maxQty);
  return match ? match.multiplier : 1.0;
}

/**
 * Determine pricing tier
 */
export function getPricingMode(qty) {
  if (qty === 1) return 'SAMPLE';
  if (qty >= 2 && qty <= 3) return 'SMALL_SAMPLE';
  return 'QUANTITY';
}

/**
 * Calculate Single Instance Quote for Exact Quantity Q
 * Returns full itemized factory costing, fixed vs variable costs, shipping, landed cost, and customer selling price.
 */
export function calculateSingleQuote(spec = {}, quantity = 1, options = {}) {
  const qty = Math.max(1, Number(quantity) || 1);
  const fxRate = Number(options.fxRate || USD_EXCHANGE_RATE);
  const marginPct = Number(options.marginPct ?? 30);
  const pricingMode = getPricingMode(qty);

  const warnings = [];
  const assumptions = [];
  const debugLines = [];

  const rawType = spec.garment_type || spec.garmentType || spec.garment?.type || 'polo';
  const garmentKey = String(rawType).toLowerCase().replace(/[\s-]/g, '_');
  const normalizedGarment = GARMENT_RATES[garmentKey] ? garmentKey : 'polo';

  // -------------------------------------------------------------
  // 1. FABRIC CALCULATION (Variable, Quantity-Independent Rate)
  // -------------------------------------------------------------
  const fabricData = spec.fabric || spec.fabrics?.[0] || {};
  const rawFabricName = fabricData.name || fabricData.type || 'cotton_poly_pique';
  const fabricKey = String(rawFabricName).toLowerCase().replace(/[\s-]/g, '_');
  const fabricRatePerKg = FABRIC_RATES[fabricKey] || FABRIC_RATES.default;

  let consumptionKg = Number(fabricData.consumption_kg || fabricData.consumptionKg);
  if (!consumptionKg) {
    consumptionKg = DEFAULT_CONSUMPTION_KG[normalizedGarment] || DEFAULT_CONSUMPTION_KG.default;
    assumptions.push(`Fabric consumption estimated at ${consumptionKg} kg/unit.`);
  }

  const fabricUnitCostPkr = Math.round(fabricRatePerKg * consumptionKg);
  const totalFabricPkr = fabricUnitCostPkr * qty;

  debugLines.push({
    component: 'Fabric',
    type: 'variable',
    ratePerKg: fabricRatePerKg,
    consumptionKg,
    multiplier: 1.0,
    unitCostPkr: fabricUnitCostPkr,
    totalPkr: totalFabricPkr,
    description: `${rawFabricName} (${fabricData.gsm || 300} GSM)`,
  });

  // -------------------------------------------------------------
  // 2. STITCHING & CONSTRUCTION (Variable with Quantity Multipliers)
  // -------------------------------------------------------------
  const baseStitchingRate = GARMENT_RATES[normalizedGarment] || GARMENT_RATES.default;
  const stitchingMultiplier = getMultiplier(STITCHING_QUANTITY_RULES, qty);
  const stitchingUnitCostPkr = Math.round(baseStitchingRate * stitchingMultiplier);
  const totalStitchingPkr = stitchingUnitCostPkr * qty;

  debugLines.push({
    component: 'Stitching / Construction',
    type: 'variable',
    baseRate: baseStitchingRate,
    multiplier: stitchingMultiplier,
    unitCostPkr: stitchingUnitCostPkr,
    totalPkr: totalStitchingPkr,
    description: `Sewing & Tailoring (${normalizedGarment.replace(/_/g, ' ')})`,
  });

  // -------------------------------------------------------------
  // 3. PATTERN DEVELOPMENT (Fixed One-Time Charge)
  // -------------------------------------------------------------
  const sizes = spec.sizes || (spec.sizeChart?.rows ? ['S', 'M', 'L', 'XL', 'XXL'] : ['XL']);
  const sizeCount = Array.isArray(sizes) && sizes.length > 0 ? sizes.length : 1;
  const fixedPatternPkr = PATTERN_RATE_PER_SIZE * (qty === 1 ? 1 : sizeCount);
  const patternUnitCostPkr = Math.round(fixedPatternPkr / qty);

  debugLines.push({
    component: 'Pattern Development',
    type: 'fixed',
    sizeCount: qty === 1 ? 1 : sizeCount,
    ratePerSize: PATTERN_RATE_PER_SIZE,
    unitCostPkr: patternUnitCostPkr,
    totalPkr: fixedPatternPkr,
    description: `${qty === 1 ? '1 Reference Size' : `${sizeCount} Master Sizes`} Pattern Grading`,
  });

  // -------------------------------------------------------------
  // 4. EMBELLISHMENTS & EMBROIDERY (Variable with Quantity Multipliers)
  // -------------------------------------------------------------
  const embMultiplier = getMultiplier(EMBROIDERY_QUANTITY_RULES, qty);
  let totalEmbroideryPkr = 0;
  let embroideryPlacements = [];

  const rawDecorations = spec.embroidery || spec.decorations || spec.embellishments || [];

  rawDecorations.forEach((deco, idx) => {
    const decoType = String(deco.type || deco.technique || 'regular').toLowerCase();
    const isChenille = decoType.includes('chenille');
    const isPatch = decoType.includes('patch');
    const isRhinestone = decoType.includes('rhinestone') || decoType.includes('stone');
    const isScreenPrint = decoType.includes('screen') || decoType.includes('print');
    const isDtf = decoType.includes('dtf') || decoType.includes('dtg');

    const width = Number(deco.width_in || deco.dimensions?.width_in || deco.width || 6);
    const height = Number(deco.height_in || deco.dimensions?.height_in || deco.height || 4);
    const area = width * height;

    let sizeCategory = 'medium';
    if (area <= 6) sizeCategory = 'small';
    else if (area > 20) sizeCategory = 'large';

    if (isChenille) {
      const baseRate = (EMBROIDERY_RATES[sizeCategory] || EMBROIDERY_RATES.default) * CHENILLE_FACTOR;
      const unitPkr = Math.round(baseRate * embMultiplier);
      const totalPkr = unitPkr * qty;
      totalEmbroideryPkr += totalPkr;
      embroideryPlacements.push({
        name: deco.name || `Chenille Embroidery #${idx + 1}`,
        placement: deco.placement || deco.location || 'Chest',
        unitCostPkr: unitPkr,
        totalPkr,
        technique: 'Chenille Embroidery',
      });
    } else if (isPatch) {
      // Patches: Rs. 200 fixed attachment + Rs. 150 per patch unit
      const patchTotal = (qty === 1 ? 0 : PATCH_FIXED_ATTACHMENT) + PATCH_UNIT_RATE * qty;
      const unitPkr = Math.round(patchTotal / qty);
      totalEmbroideryPkr += patchTotal;
      embroideryPlacements.push({
        name: deco.name || `Woven Patch #${idx + 1}`,
        placement: deco.placement || deco.location || 'Sleeve',
        unitCostPkr: unitPkr,
        totalPkr: patchTotal,
        technique: 'Woven / Embroidered Patch',
      });
    } else if (isRhinestone) {
      // Rhinestones: Rs. 5000 fixed die + production base
      const fixedDie = qty === 1 ? 0 : RHINESTONE_DIE_COST;
      const totalPkr = fixedDie + RHINESTONE_PRODUCTION_BASE * qty;
      const unitPkr = Math.round(totalPkr / qty);
      totalEmbroideryPkr += totalPkr;
      embroideryPlacements.push({
        name: deco.name || `Rhinestone Graphic #${idx + 1}`,
        placement: deco.placement || deco.location || 'Front',
        unitCostPkr: unitPkr,
        totalPkr,
        technique: 'Hotfix Rhinestones',
      });
    } else if (isScreenPrint) {
      const colors = Number(deco.color_count || deco.numColors || 2);
      const screenSetup = (qty === 1 ? 0 : colors * SCREEN_PRINT_RULES.screenSetupPerColor);
      const printMultiplier = getMultiplier(SCREEN_PRINT_RULES.quantityMultipliers, qty);
      const variablePrint = Math.round(SCREEN_PRINT_RULES.baseRatePerLocation * printMultiplier) * qty;
      const totalPkr = screenSetup + variablePrint;
      const unitPkr = Math.round(totalPkr / qty);
      totalEmbroideryPkr += totalPkr;
      embroideryPlacements.push({
        name: deco.name || `Screen Print (${colors} Color)`,
        placement: deco.placement || deco.location || 'Back',
        unitCostPkr: unitPkr,
        totalPkr,
        technique: 'Silk Screen Printing',
      });
    } else if (isDtf) {
      const baseDtf = DTF_DTG_RATES[sizeCategory] || DTF_DTG_RATES.default;
      const unitPkr = Math.round(baseDtf * (qty <= 3 ? 1.4 : 1.0));
      const totalPkr = unitPkr * qty;
      totalEmbroideryPkr += totalPkr;
      embroideryPlacements.push({
        name: deco.name || `DTF Full Color Print`,
        placement: deco.placement || deco.location || 'Chest',
        unitCostPkr: unitPkr,
        totalPkr,
        technique: 'Direct To Film (DTF)',
      });
    } else {
      // Regular Embroidery
      const baseRate = EMBROIDERY_RATES[sizeCategory] || EMBROIDERY_RATES.default;
      const unitPkr = Math.round(baseRate * embMultiplier);
      const totalPkr = unitPkr * qty;
      totalEmbroideryPkr += totalPkr;
      embroideryPlacements.push({
        name: deco.name || `Embroidery #${idx + 1}`,
        placement: deco.placement || deco.location || 'Front Chest',
        unitCostPkr: unitPkr,
        totalPkr,
        technique: 'Direct Embroidery',
      });
    }
  });

  const embroideryUnitPkr = Math.round(totalEmbroideryPkr / qty);
  debugLines.push({
    component: 'Embellishments & Embroidery',
    type: 'mixed',
    placementsCount: rawDecorations.length,
    multiplier: embMultiplier,
    unitCostPkr: embroideryUnitPkr,
    totalPkr: totalEmbroideryPkr,
    details: embroideryPlacements,
  });

  // -------------------------------------------------------------
  // 5. DISTRESSING / VINTAGE WASH (Variable based on volume tier)
  // -------------------------------------------------------------
  let totalDistressingPkr = 0;
  let distressingUnitPkr = 0;
  if (spec.distressing) {
    const match = DISTRESSING_RULES.find((r) => qty >= r.minQty && qty <= r.maxQty) || DISTRESSING_RULES[0];
    distressingUnitPkr = match.rate;
    totalDistressingPkr = distressingUnitPkr * qty;
    debugLines.push({
      component: 'Distressing & Vintage Wash',
      type: 'variable',
      rate: distressingUnitPkr,
      unitCostPkr: distressingUnitPkr,
      totalPkr: totalDistressingPkr,
    });
  }

  // -------------------------------------------------------------
  // 6. TRIMS & PACKAGING
  // -------------------------------------------------------------
  const trimsUnitPkr = 150; // Buttons, Woven neck label, individual polybag
  const totalTrimsPkr = trimsUnitPkr * qty;
  debugLines.push({
    component: 'Trims, Labels & Packaging',
    type: 'variable',
    unitCostPkr: trimsUnitPkr,
    totalPkr: totalTrimsPkr,
  });

  // -------------------------------------------------------------
  // 7. FACTORY DIRECT COST
  // -------------------------------------------------------------
  const totalFactoryCostPkr =
    totalFabricPkr +
    totalStitchingPkr +
    fixedPatternPkr +
    totalEmbroideryPkr +
    totalDistressingPkr +
    totalTrimsPkr;

  const factoryCostPerUnitPkr = Math.round(totalFactoryCostPkr / qty);

  // -------------------------------------------------------------
  // 8. SHIPPING / LOGISTICS
  // -------------------------------------------------------------
  let totalShippingPkr = 0;
  if (qty === 1) {
    totalShippingPkr = SHIPPING_RATES.sample_q1;
  } else if (qty <= 3) {
    totalShippingPkr = SHIPPING_RATES.small_sample_per_unit * qty;
  } else {
    totalShippingPkr = SHIPPING_RATES.bulk_per_unit * qty;
  }
  const shippingPerUnitPkr = Math.round(totalShippingPkr / qty);

  // -------------------------------------------------------------
  // 9. TOTAL LANDED COST
  // -------------------------------------------------------------
  const totalLandedCostPkr = totalFactoryCostPkr + totalShippingPkr;
  const landedCostPerUnitPkr = Math.round(totalLandedCostPkr / qty);

  // -------------------------------------------------------------
  // 10. MARGIN & CUSTOMER SELLING PRICE
  // -------------------------------------------------------------
  // Gross Margin Formula: Price = Landed / (1 - Margin%)
  const marginDecimal = Math.max(0.1, Math.min(0.8, marginPct / 100));
  const sellingUnitPricePkr = Math.round(landedCostPerUnitPkr / (1 - marginDecimal));
  const totalSellingPricePkr = sellingUnitPricePkr * qty;

  // USD Conversion
  const landedUnitUsd = +(landedCostPerUnitPkr / fxRate).toFixed(2);
  const factoryUnitUsd = +(factoryCostPerUnitPkr / fxRate).toFixed(2);
  const shippingUnitUsd = +(shippingPerUnitPkr / fxRate).toFixed(2);
  const unitPriceUsd = +(sellingUnitPricePkr / fxRate).toFixed(2);
  const totalPriceUsd = +(unitPriceUsd * qty).toFixed(2);

  // Itemized breakdown in USD for customer view
  const breakdownUsd = {
    fabric: +((fabricUnitCostPkr / fxRate) / (1 - marginDecimal)).toFixed(2),
    stitching: +((stitchingUnitCostPkr / fxRate) / (1 - marginDecimal)).toFixed(2),
    pattern: +((patternUnitCostPkr / fxRate) / (1 - marginDecimal)).toFixed(2),
    embroidery: +((embroideryUnitPkr / fxRate) / (1 - marginDecimal)).toFixed(2),
    trims: +((trimsUnitPkr / fxRate) / (1 - marginDecimal)).toFixed(2),
    shipping: +(shippingUnitUsd).toFixed(2),
    landedUnitUsd,
    unitPriceUsd,
    totalPriceUsd,
  };

  return {
    quantity: qty,
    pricingMode,
    currency: 'USD',
    unitPriceUsd,
    totalPriceUsd,
    unitPricePkr: sellingUnitPricePkr,
    totalPricePkr: totalSellingPricePkr,
    costing: {
      factoryCostPkr: totalFactoryCostPkr,
      shippingPkr: totalShippingPkr,
      landedCostPkr: totalLandedCostPkr,
      factoryUnitUsd,
      shippingUnitUsd,
      landedUnitUsd,
      marginPercent: marginPct,
      marginAmountPkr: totalSellingPricePkr - totalLandedCostPkr,
    },
    breakdownUsd,
    debugLines,
    assumptions,
    warnings,
  };
}

/**
 * Main Quotation Generator - Deterministic Dual Calculation
 * Calculates Sample (Q=1) and Requested Order (Q=Requested) independently.
 */
export function generateQuotation(spec = {}, requestedQuantity = 50, options = {}) {
  const reqQty = Math.max(1, Number(requestedQuantity) || 1);

  // 1. Always evaluate Q=1 Sample Quote independently
  const sampleQuote = calculateSingleQuote(spec, 1, options);

  // 2. If customer selected Q=1, return clean sample quotation
  if (reqQty === 1) {
    return {
      quantity: 1,
      isSampleOnly: true,
      sample: {
        quantity: 1,
        unitPriceUsd: sampleQuote.unitPriceUsd,
        totalPriceUsd: sampleQuote.totalPriceUsd,
        breakdownUsd: sampleQuote.breakdownUsd,
        costing: sampleQuote.costing,
      },
      requestedOrder: {
        quantity: 1,
        unitPriceUsd: sampleQuote.unitPriceUsd,
        totalPriceUsd: sampleQuote.totalPriceUsd,
        breakdownUsd: sampleQuote.breakdownUsd,
        costing: sampleQuote.costing,
      },
      comparison: null,
      status: 'AUTO',
      confidence: 0.95,
      debug: {
        sampleDebug: sampleQuote.debugLines,
        requestedDebug: sampleQuote.debugLines,
      },
    };
  }

  // 3. Evaluate Requested Quantity Quote independently
  const requestedQuote = calculateSingleQuote(spec, reqQty, options);

  // 4. Calculate Economics & Savings vs Sample
  const savingsPerUnit = +(sampleQuote.unitPriceUsd - requestedQuote.unitPriceUsd).toFixed(2);
  const savingsPercentage = +(
    ((sampleQuote.unitPriceUsd - requestedQuote.unitPriceUsd) / sampleQuote.unitPriceUsd) *
    100
  ).toFixed(1);
  const totalSavingsUsd = +(
    sampleQuote.unitPriceUsd * reqQty - requestedQuote.totalPriceUsd
  ).toFixed(2);

  return {
    quantity: reqQty,
    isSampleOnly: false,
    sample: {
      quantity: 1,
      unitPriceUsd: sampleQuote.unitPriceUsd,
      totalPriceUsd: sampleQuote.totalPriceUsd,
      breakdownUsd: sampleQuote.breakdownUsd,
      costing: sampleQuote.costing,
    },
    requestedOrder: {
      quantity: reqQty,
      unitPriceUsd: requestedQuote.unitPriceUsd,
      totalPriceUsd: requestedQuote.totalPriceUsd,
      breakdownUsd: requestedQuote.breakdownUsd,
      costing: requestedQuote.costing,
    },
    comparison: {
      savingsPerUnit: Math.max(0, savingsPerUnit),
      savingsPercentage: Math.max(0, savingsPercentage),
      totalSavingsUsd: Math.max(0, totalSavingsUsd),
      explanation: `Bulk pricing reduces your estimated unit cost by $${Math.max(0, savingsPerUnit).toFixed(2)} compared with single-sample economics.`,
    },
    status: 'AUTO',
    confidence: 0.92,
    debug: {
      sampleDebug: sampleQuote.debugLines,
      requestedDebug: requestedQuote.debugLines,
    },
  };
}
