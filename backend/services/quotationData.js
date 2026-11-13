import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');
const rootDocsDir = path.resolve(backendDir, '..', 'docs');
const bundledDataDir = path.join(backendDir, 'data');

const readJson = (fileName) => {
  // In the repository layout the canonical files live in ../docs. Some hosts
  // deploy only backend/, so backend/data contains the same runtime datasets.
  const rootFile = path.join(rootDocsDir, fileName);
  const filePath = fs.existsSync(rootFile)
    ? rootFile
    : path.join(bundledDataDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

export const rateCards = readJson('rate_cards.json');
export const pricingConfig = readJson('pricing_config.json');
export const historicalQuotations = readJson('historical_quotations.json');
export const sampleExtractions = readJson('sample_extractions.json');
