import { historicalQuotations, pricingConfig, rateCards } from './quotationData.js';
import { findRate, normalizeRateKey, priceRate, roundMoney } from './rateEngine.js';

const confidenceNeedsReview = (confidence) =>
  String(confidence || '').toUpperCase() === 'LOW' || Number(confidence) < 0.65;

const getQuantity = (designSpec, warnings) => {
  const quantity = Number(designSpec.quantity ?? designSpec.garment?.quantity ?? designSpec.totalUnits);
  if (quantity > 0) return quantity;
  warnings.push('Quantity missing; calculated for 1 unit (sample order)');
  return 1;
};

export const calculateQuotation = (designSpec = {}, options = {}) => {
  const warnings = [];
  const assumptions = [];
  const lines = [];
  const garment = designSpec.garment || {};
  const rawGarmentType = garment.type || designSpec.garmentType || 'polo';
  const garmentType = normalizeRateKey(rawGarmentType);
  const normalizedGarment = garmentType === 'rugby_polo' ? 'polo' : garmentType;
  const quantity = getQuantity(designSpec, warnings);
  const fxRate = Number(options.fxRate ?? pricingConfig.fx_pkr_per_usd ?? 273);

  // 30% Gross margin default as requested
  const marginPct = Number(options.marginPct ?? designSpec.marginPct ?? 30);
  const marginMode = options.marginMode || designSpec.marginMode || 'gross_margin';

  const addLine = ({
    category,
    technique,
    description,
    rate,
    basis = 1,
    area = null,
    confidence = 'HIGH',
    source = 'rate_table',
    lineWarnings = [],
  }) => {
    const warningsForLine = [...lineWarnings];
    let unitPrice = 0;

    if (!rate) {
      warningsForLine.push(`No approved rate for ${category}/${technique}`);
    } else {
      const priced = priceRate({ rate, area });
      unitPrice = priced.unitPrice;
      warningsForLine.push(...priced.warnings);
    }

    const multiplier = rate?.scope === 'per_order' ? 1 : quantity;
    const amount = roundMoney(unitPrice * basis * multiplier);
    const needsReview = !rate || warningsForLine.length > 0 || confidenceNeedsReview(confidence);

    lines.push({
      category,
      description,
      rateCode: rate?.code || null,
      method: rate?.method || null,
      scope: rate?.scope || 'per_unit',
      basisQty: basis,
      unitPrice,
      amount,
      confidence,
      source,
      needsReview,
      warnings: warningsForLine,
    });
  };

  // 1. Construction: Cutting, Sewing, Pattern
  addLine({
    category: 'construction',
    technique: 'cutting',
    description: 'Fabric Cutting & Precision Trim',
    rate: findRate({ category: 'construction', technique: 'cutting', garmentType: normalizedGarment }),
  });
  addLine({
    category: 'construction',
    technique: 'stitching',
    description: `Sewing & Placket Construction - ${rawGarmentType}`,
    rate: findRate({ category: 'construction', technique: 'stitching', garmentType: normalizedGarment }),
  });
  addLine({
    category: 'construction',
    technique: 'pattern',
    description: 'Pattern Development & Master Grading',
    rate: findRate({ category: 'construction', technique: 'pattern', garmentType: normalizedGarment }),
  });

  // 2. Fabrics
  const fabrics = designSpec.fabrics || (designSpec.fabric ? [designSpec.fabric] : []);
  if (fabrics.length === 0) {
    // Default polo fabric
    fabrics.push({ name: 'Double Knit Fabric', role: 'main', gsm: 300 });
  }

  fabrics.forEach((fabric) => {
    const fabricName = fabric.name || fabric.type || fabric.technique || 'Polo fabric';
    const technique = normalizeRateKey(fabricName);
    let consumption = Number(fabric.consumption_kg ?? fabric.consumptionKg);
    let confidence = fabric.confidence || 'HIGH';

    if (!consumption) {
      consumption = pricingConfig.defaultConsumptionKg?.[normalizedGarment] || 0.65;
      assumptions.push(`${fabricName} consumption: ${consumption} kg/garment`);
    }

    addLine({
      category: 'fabric',
      technique,
      description: `${fabric.role || 'main'} fabric - ${fabricName} (${fabric.gsm || 300} GSM)`,
      rate: findRate({ category: 'fabric', technique, garmentType: normalizedGarment }),
      basis: consumption,
      confidence,
    });
  });

  // 3. Embellishments / Decorations
  const decorations = designSpec.decorations || designSpec.embellishments || [];
  decorations.forEach((decoration) => {
    const technique = normalizeRateKey(decoration.technique || decoration.type);
    const rate = findRate({ category: 'embellishment', technique, garmentType: normalizedGarment });
    const width = Number(decoration.width_in ?? decoration.widthIn ?? decoration.width);
    const height = Number(decoration.height_in ?? decoration.heightIn ?? decoration.height);
    const area = width && height ? roundMoney(width * height) : null;
    const lineWarnings = [];
    let basis = Number(decoration.quantity || decoration.count) || 1;

    if (rate?.method === 'per_piece') {
      basis *= Number(decoration.piece_count ?? decoration.pieceCount) || 1;
    }

    addLine({
      category: 'embellishment',
      technique,
      description: `${decoration.name || decoration.techniqueLabel || technique} - ${decoration.placementLabel || decoration.placement || 'Mockup Placement'} (${width || '?'}x${height || '?'}")`,
      rate,
      basis,
      area,
      confidence: decoration.confidence || 'HIGH',
      source: decoration.source || 'vision_mockup_scale',
      lineWarnings,
    });
  });

  // 4. Trims
  const trims = designSpec.trims || [
    { type: 'button', name: 'Placket Buttons', quantity_per_garment: 3 },
    { type: 'rib', name: 'Rib Collar & Cuffs', quantity_per_garment: 1 },
    { type: 'sizetag', name: 'Woven Size Tag', quantity_per_garment: 1 },
  ];

  trims.forEach((trim) => {
    const technique = normalizeRateKey(trim.type);
    addLine({
      category: 'trim',
      technique,
      description: `Trim - ${trim.name || trim.type}`,
      rate: findRate({ category: 'trim', technique, garmentType: normalizedGarment }),
      basis: Number(trim.quantity_per_garment ?? trim.quantityPerGarment ?? trim.quantity) || 1,
      confidence: trim.confidence || 'HIGH',
    });
  });

  // 5. Fixed costs (Fuel/misc overhead)
  const hasFuel = lines.some((l) => l.category === 'fixed' && l.description.toLowerCase().includes('fuel'));
  if (!hasFuel) {
    const fuelRate = findRate({ category: 'fixed', technique: 'fuel_misc', garmentType: normalizedGarment });
    if (fuelRate) {
      addLine({
        category: 'fixed',
        technique: 'fuel_misc',
        description: fuelRate.name || 'Factory Fuel & Generator Misc',
        rate: fuelRate,
      });
    }
  }

  // Cost Aggregations
  const manufacturingCost = roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));
  const costPerGarment = roundMoney(manufacturingCost / quantity);

  // 30% Gross Margin formula: FOB = Cost / (1 - Margin)
  const margin = roundMoney(
    marginMode === 'markup'
      ? (manufacturingCost * marginPct) / 100
      : manufacturingCost / (1 - marginPct / 100) - manufacturingCost
  );
  const fob = roundMoney(manufacturingCost + margin);

  // International Shipping Calculation: default $10.00 / kg
  const garmentWeightKg = pricingConfig.shipping?.estimated_weight_kg_per_garment?.[normalizedGarment] || 0.65;
  const shippingUsdPerKg = 10.0; // default $10 per kg as requested
  const shippingPerUnitUsd = roundMoney(garmentWeightKg * shippingUsdPerKg);
  const shippingUnitPkr = roundMoney(shippingPerUnitUsd * fxRate);
  const totalShippingPkr = roundMoney(shippingUnitPkr * quantity);
  const totalShippingUsd = roundMoney(shippingPerUnitUsd * quantity);

  const finalTotalPkr = roundMoney(fob + totalShippingPkr);

  // USD Conversions
  const mfgCostUsd = roundMoney(manufacturingCost / fxRate);
  const costPerGarmentUsd = roundMoney(costPerGarment / fxRate);
  const marginUsd = roundMoney(margin / fxRate);
  const fobUsd = roundMoney(fob / fxRate);
  const fobUnitUsd = roundMoney(fobUsd / quantity);
  const landedUnitUsd = roundMoney(fobUnitUsd + shippingPerUnitUsd);
  const landedTotalUsd = roundMoney(finalTotalPkr / fxRate);

  // Sanity check vs historical
  const historical = historicalQuotations.filter((quote) => quote.garment_type === normalizedGarment);
  if (historical.length) {
    const average = historical.reduce((sum, quote) => sum + quote.mfg_cost_per_garment, 0) / historical.length;
    const deviation = ((costPerGarment - average) / average) * 100;
    if (Math.abs(deviation) > (pricingConfig.sanityTolerancePct || 35)) {
      assumptions.push(`Sampling unit cost (PKR ${costPerGarment}) includes single-unit setup amortisation (historical avg: PKR ${roundMoney(average)})`);
    }
  }

  return {
    status: warnings.length ? 'needs_review' : 'draft',
    quantity,
    garmentType: rawGarmentType,
    lines,
    assumptions,
    warnings,
    totals: {
      manufacturingCost,
      mfgCostPerGarment: costPerGarment,
      margin,
      fob,
      shipping: totalShippingPkr,
      finalTotal: finalTotalPkr,
      // USD Equivalents
      mfgCostUsd,
      costPerGarmentUsd,
      marginUsd,
      fobUsd,
      fobUnitUsd,
      shippingUsd: totalShippingUsd,
      shippingUnitUsd: shippingPerUnitUsd,
      landedUnitUsd,
      landedTotalUsd,
    },
    pricing: {
      marginPct,
      marginMode,
      fxRate,
      garmentWeightKg,
      shippingRateUsdPerKg: shippingUsdPerKg,
      currency: 'PKR',
    },
  };
};
