import { rateCards } from './quotationData.js';

export const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const normalizeRateKey = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const TECHNIQUE_ALIASES = {
  sewing: 'stitching',
  stitching: 'stitching',
  cutting: 'cutting',
  pattern: 'pattern',
  chenille: 'chenille_embroidery',
  chenille_embroidery: 'chenille_embroidery',
  chenille_and_applique: 'chenille_embroidery',
  flat_embroidery: 'embroidery',
  precision_flat_embroidery: 'embroidery',
  embroidery: 'embroidery',
  printing: 'printing',
  screen_printing: 'printing',
  sublimation: 'printing',
  rhinestones: 'rhinestones',
  fur: 'fur',
  distressing: 'distressing',
  zipper: 'zipper',
  button: 'button',
  rib: 'custom_rib',
  sizetag: 'sizetag',
  label: 'sizetag_woven',
  fuel: 'fuel_misc',
  fuel_misc: 'fuel_misc',
};

export const findRate = ({ category, technique, garmentType }) => {
  const normTech = normalizeRateKey(technique);
  const aliasTech = TECHNIQUE_ALIASES[normTech] || normTech;
  const normGarment = garmentType === 'rugby_polo' ? 'polo' : normalizeRateKey(garmentType);

  // 1. Direct match with alias and specific garment
  let matched = rateCards
    .filter((rate) =>
      rate.active &&
      rate.category === category &&
      (rate.technique === normTech || rate.technique === aliasTech) &&
      (rate.appliesTo.includes(normGarment) || rate.appliesTo.includes('*'))
    )
    .sort((a, b) => Number(b.appliesTo.includes(normGarment)) - Number(a.appliesTo.includes(normGarment)))[0];

  if (matched) return matched;

  // 2. Category specific fallbacks:
  if (category === 'fabric') {
    if (normGarment === 'polo' || normTech.includes('polo') || normTech.includes('double_knit')) {
      return rateCards.find((r) => r.code === 'FAB_POLO') || null;
    }
    if (normGarment === 'crewneck') {
      return rateCards.find((r) => r.code === 'FAB_CREW_STD') || null;
    }
    // Generic fallback fabric
    return rateCards.find((r) => r.category === 'fabric' && r.active) || null;
  }

  if (category === 'embellishment') {
    if (normTech.includes('chenille')) {
      return rateCards.find((r) => r.code === 'CHENILLE') || null;
    }
    if (normTech.includes('applique')) {
      return rateCards.find((r) => r.code === 'FAB_APPLIQUE') || rateCards.find((r) => r.code === 'EMB') || null;
    }
    if (normTech.includes('embroid') || normTech.includes('patch')) {
      return rateCards.find((r) => r.code === 'EMB') || null;
    }
    if (normTech.includes('print')) {
      return rateCards.find((r) => r.code === 'PRINT') || null;
    }
  }

  if (category === 'construction') {
    if (normTech.includes('sew') || normTech.includes('stitch')) {
      const sew = rateCards.find((r) => r.category === 'construction' && r.technique === 'stitching' && r.appliesTo.includes(normGarment));
      if (sew) return sew;
      return rateCards.find((r) => r.code === 'SEW_POLO') || null;
    }
    if (normTech.includes('pattern')) {
      const pat = rateCards.find((r) => r.category === 'construction' && r.technique === 'pattern' && r.appliesTo.includes(normGarment));
      if (pat) return pat;
      return rateCards.find((r) => r.code === 'PAT_POLO') || null;
    }
    if (normTech.includes('cut')) {
      return {
        code: 'CUT_GARMENT',
        category: 'construction',
        technique: 'cutting',
        name: 'Fabric Cutting & Precision Trimming',
        method: 'fixed',
        scope: 'per_unit',
        currency: 'PKR',
        rate: 200,
        active: true,
      };
    }
  }

  if (category === 'fixed') {
    if (normTech.includes('fuel')) {
      const fuel = rateCards.find((r) => r.category === 'fixed' && r.technique === 'fuel_misc' && r.appliesTo.includes(normGarment));
      if (fuel) return fuel;
      return rateCards.find((r) => r.code === 'FUEL_POLO') || null;
    }
  }

  if (category === 'trim') {
    if (normTech.includes('button')) {
      return rateCards.find((r) => r.code === 'BTN_POLO') || null;
    }
    if (normTech.includes('rib')) {
      return rateCards.find((r) => r.code === 'RIB_CUSTOM') || null;
    }
    if (normTech.includes('tag') || normTech.includes('label')) {
      return rateCards.find((r) => r.code === 'TAG_WOVEN') || rateCards.find((r) => r.code === 'TAG_PRINT') || null;
    }
  }

  return null;
};

export const priceRate = ({ rate, area }) => {
  const warnings = [];
  let unitPrice = 0;

  if (!rate) {
    return { unitPrice, warnings: ['No approved rate found'] };
  }

  if (['interpolate', 'bracket', 'area_rate'].includes(rate.method) && area == null) {
    return { unitPrice, warnings: ['Dimensions missing'] };
  }

  switch (rate.method) {
    case 'fixed':
    case 'per_piece':
    case 'per_kg':
    case 'per_meter':
      unitPrice = rate.rate;
      break;
    case 'area_rate':
      unitPrice = Math.max(area * rate.rate, rate.minCharge || 0);
      break;
    case 'bracket': {
      const brackets = [...rate.brackets].sort((a, b) => (a.max_area_sq_in || a.max || 999999) - (b.max_area_sq_in || b.max || 999999));
      const bracket = brackets.find((item) => area <= (item.max_area_sq_in ?? item.max ?? 999999));
      if (bracket) {
        unitPrice = bracket.price;
      } else {
        unitPrice = brackets.at(-1).price;
        warnings.push('Exceeds largest bracket; last bracket used');
      }
      break;
    }
    case 'interpolate': {
      const points = [...rate.points].sort((a, b) => a.area_sq_in - b.area_sq_in);
      if (area <= points[0].area_sq_in) {
        unitPrice = points[0].price;
      } else if (area >= points.at(-1).area_sq_in) {
        unitPrice = points.at(-1).price;
        if (area > points.at(-1).area_sq_in) warnings.push('Above largest point; clamped');
      } else {
        for (let index = 0; index < points.length - 1; index += 1) {
          const start = points[index];
          const end = points[index + 1];
          if (area >= start.area_sq_in && area <= end.area_sq_in) {
            unitPrice = start.price + ((area - start.area_sq_in) / (end.area_sq_in - start.area_sq_in)) * (end.price - start.price);
            break;
          }
        }
      }
      break;
    }
    default:
      warnings.push(`Unsupported rate method: ${rate.method}`);
  }

  return { unitPrice: roundMoney(unitPrice), warnings };
};
