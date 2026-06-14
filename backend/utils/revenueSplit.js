import { REVENUE_SPLIT } from '../constants/index.js';

export const calculateRevenueSplit = (amount) => ({
  organization: Number((amount * REVENUE_SPLIT.ORGANIZATION).toFixed(2)),
  sayrab: Number((amount * REVENUE_SPLIT.SAYRAB).toFixed(2)),
  manufacturer: Number((amount * REVENUE_SPLIT.MANUFACTURER).toFixed(2)),
});
