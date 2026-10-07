import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const docsDir = path.join(rootDir, 'docs');

const readJson = (fileName) => {
  const filePath = path.join(docsDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

export const rateCards = readJson('rate_cards.json');
export const pricingConfig = readJson('pricing_config.json');
export const historicalQuotations = readJson('historical_quotations.json');
export const sampleExtractions = readJson('sample_extractions.json');
