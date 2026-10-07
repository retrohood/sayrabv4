# Sayrab Quotation Data Pack v2 - derived from Quotations_July.xlsx
Source of truth = your 12 real quotation sheets (11 unique; Sheet11 duplicates Sheet9). Web benchmarks were checked
but are US-market ($0.05-0.25/stitch) and do NOT apply to Sialkot costs, so no web numbers are used.

## Rules discovered in your sheets (v1 of this pack got #1 wrong)
1. **Margin is GROSS MARGIN, not markup**: FOB = cost / (1 - margin). Verified to the cent on S2,S4,S5,S6,S7,S9.
2. FX is fixed: **USD = PKR / 273**.
3. Sheet costs are **per garment**. Final per-garment price = FOB + (weight_kg x USD 10.44/kg) [9.62 once].
4. Margin used: polos 30%, reversible zip-ups 30%, sweater 40%, crewneck volume tiers 50% (50-100) / 45% (100-150) / 40% (150-200 units).
5. Shipping options quoted to clients: duty-paid ~USD 49.72 (12 days) vs DHL direct USD 54.49 (4-5 days, ~USD 30 duty extra). Footer: FOB Sialkot.

## Files
| File | Use |
|---|---|
| real_quotation_sheets.json | Every sheet, normalised (lines, margins, FOB, shipping, data-quality flags) = historical reference |
| rate_cards.json | 41 rates derived from sheet medians; each lists observed values, sheets used, confidence |
| pricing_config.json | FX, margin rules, shipping, footer text |
| golden_tests.json | 10 tests that reproduce your sheet FOB/totals - implementation MUST pass these first |
| sample_extractions.json / expected_quotations.json | 3 tech-pack extractions + correct draft output (EXT-101 reproduces S2, EXT-102 reproduces S9a exactly; EXT-103 tests missing rates) |
| reference_calculator.mjs | Generator/reference logic |

## Data-quality problems found in the sheets (please fix/confirm)
- **S7**: line items sum to 1,950 PKR but total is typed 4,400 (2,450 PKR unexplained). Project label says "Reversible Zipup" but costs look like a simple tee.
- **S12**: FOB cells are stale copies of S9 (28.72 etc.) - cost is only 10.51 USD.
- **S9**: margin label 0.42 but FOB uses 0.40 (23.93 = cost/0.6).
- **S1**: total 153 != 101.1 + 49.72. S1 has no margin applied. **S3**: no margin; fuel 2,000 and pattern 3,000 look un-amortised (tiny order?).
- **S8** is a scratch/what-if copy of S1 (all values far lower) - excluded from rate statistics.
- S9b tier total 36.08 is stale from the previous block.

## What the sheets can NOT tell us (rates are lower confidence until you confirm)
- **Embroidery/printing/rhinestone sizes or stitch counts are not recorded**, so size/piece-count bands are ASSUMED to match price clusters
  (embroidery <=6 sq in 400 | <=25 sq in 1,100 | <=80 sq in 2,000 | larger ~9,000). Marked `assumed_band_edges:true`. Add dimensions to future sheets to calibrate.
- Fabric is a lump sum per garment, not per kg/metre (no consumption recorded). Rates are by named fabric/tier, not GSM x kg.
- Pattern: sheets show 50-3,000 PKR per garment but a note says "Pattern 1200 (per size)" - confirm if per-order or amortised.
- No observations for: laser cutting, hoodie/tee construction, rib per metre, stitch-count embroidery. Engine must flag these, never invent.
- Single observations (n=1) are LOW confidence; n>=3 MEDIUM. Nothing here reaches HIGH until more quotations are logged.
