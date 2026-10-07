import fs from 'fs';
const OUT='/mnt/user-data/outputs/sayrab-quotation-data/';
const w=(f,o)=>fs.writeFileSync(OUT+f,JSON.stringify(o,(k,v)=>v===Infinity?null:v,2));
const r2=n=>Math.round(n*100)/100, FX=273;

// ============ 1. REAL SHEETS (normalised from Quotations_July.xlsx) ============
const L=(o)=>Object.entries(o).map(([technique,pkr])=>({technique,pkr}));
const sheets=[
{id:'S1',sheet:'Sheet1',client:'Andy and Jordan',project:'Reversible Zipup',garment_type:'reversible_zipup',reliability:'MEDIUM',
 lines:L({zipper:1500,flannel:1800,french_terry_400gsm_80_20:2600,distressing:500,stitching:3000,pattern:2250,fuel_misc:100,rhinestone:2500,sizetag_woven:1500,double_sided_zip:350,printing:10000,fur:1500}),
 sheet_total_pkr:27600,margin:null,fob_usd:null,ship_usd:{duty_paid_2kg:49.72,dhl_direct:54.49},sheet_total_usd:{duty_paid:153,direct:155.99},
 notes:['No margin/FOB computed on sheet (price typed as 101.1 = cost only)','Sizetag 1500 matches the "Woven 1500 (per size)" note in S4 => per-order label cost','Sheet total 153 != 101.1+49.72 (150.82): unexplained']},
{id:'S2',sheet:'Sheet2',client:'Robert polos Bulk',project:'Howard University Polo',garment_type:'polo',reliability:'HIGH',
 lines:L({fabric_polo:1400,embroidery:1100,stitching:1000,pattern:300,fuel_misc:100,button:50}),sheet_total_pkr:3950,margin:0.3,fob_usd:20.67,ship:{usd_per_kg:10,weight_kg:0.65,usd:6.5},sheet_total_usd:27.17,notes:['Bulk order']},
{id:'S3',sheet:'Sheet3',client:'Robert polos',project:'Reversible Zipup',garment_type:'reversible_zipup',reliability:'LOW',
 lines:L({fabric_premium:5000,embroidery:10000,stitching:4000,pattern:3000,fuel_misc:2000,button:1000}),sheet_total_pkr:25000,margin:null,fob_usd:null,ship:{usd:51,weight_kg:1.5},sheet_total_usd:142.58,notes:['Likely very small quantity (pattern 3000, fuel 2000 not amortised)','No margin applied']},
{id:'S4',sheet:'Sheet4',client:'Robert polos',project:'Reversible Zipup (v2)',garment_type:'reversible_zipup',reliability:'HIGH',
 lines:L({zipper:400,fabric_light:1100,embroidery:2000,stitching:2000,pattern:600,fuel_misc:200,sizetag:300,quilt:800,custom_rib:700,zip_puller_woven:200}),sheet_total_pkr:8300,margin:0.3,fob_usd:43.42,ship:{usd_per_kg:10.44,weight_kg:1,usd:10.44},sheet_total_usd:53.86,
 reference_notes_from_sheet:['Fabric 1100','Quilt 800','Embroidery 1000-1200','Rib 700','Woven label 1500 (per size)','Pattern 1200 (per size)']},
{id:'S5',sheet:'Sheet5',client:'Ivan Thomas',project:'Reversible Zipup',garment_type:'reversible_zipup',reliability:'HIGH',
 lines:L({zipper:200,fabric_premium:4200,embroidery:1100,stitching:2000,pattern:450,fuel_misc:200,sizetag:250,quilt:800,custom_rib:700}),sheet_total_pkr:9900,margin:0.3,fob_usd:51.8,ship:{usd_per_kg:10.44,weight_kg:1.5,usd:15.66},sheet_total_usd:67.46},
{id:'S6',sheet:'Sheet6',client:'Ivan Thomas',project:'Sweater',garment_type:'sweater',reliability:'MEDIUM',
 lines:L({blank_sweater:5000,embroidery:600,fuel_misc:200,sizetag:250}),sheet_total_pkr:6050,margin:0.4,fob_usd:36.9,ship:{usd_per_kg:10.44,weight_kg:1.5,usd:15.66},sheet_total_usd:52.56,notes:['Garment bought blank, so no stitching/pattern']},
{id:'S7',sheet:'Sheet7',client:'Ivan Thomas',project:'(label says Reversible Zipup; costs look like a simple tee/crewneck)',garment_type:'unknown_simple',reliability:'LOW',
 lines:L({embroidery:850,stitching:900,pattern:100,fuel_misc:100}),sheet_total_pkr:4400,expected_units:175,
 margin_options:{'0.4':26.86,'0.3':23.02,'0.5':32.24,'0.45':29.3},ship:{usd_per_kg:9.62,weight_kg:0.8,usd:7.696},
 totals_usd_by_margin:{'0.4':34.556,'0.3':32.64,'0.5':39.936,'0.45':36.996},order_shipping_usd:1346.8,notes:['Second shipping rate seen: 9.62 USD/kg','0.3 total (32.64) used shipping 0.8 not 7.696 (sheet formula inconsistency)']},
{id:'S8',sheet:'Sheet8',client:'Andy and Jordan',project:'Reversible Zipup (scratch/test)',garment_type:'reversible_zipup',reliability:'SCRATCH',
 lines:L({zipper:50,flannel:1000,french_terry_400gsm_80_20:2000,distressing:100,stitching:1200,pattern:250,fuel_misc:200,rhinestone:150,double_sided_zip:350,printing:800,fur:500}),sheet_total_pkr:6600,notes:['Looks like a what-if copy of S1 with much lower numbers; excluded from rate statistics']},
{id:'S9a',sheet:'Sheet9 (block 1)',client:'Eta Mu Chapter',project:'Crewneck/sweatshirt',garment_type:'crewneck',reliability:'HIGH',
 lines:L({fabric_standard:1300,embroidery:400,stitching:900,pattern:50,fuel_misc:250,chenille_embroidery:850,rhinestone:150,sizetag:20}),sheet_total_pkr:3920,
 margin_options:{'0.5':28.72,'0.4(sheet label 0.42)':23.93,'0.45':26.106},ship:{usd_per_kg:10.44,weight_kg:0.7,usd:7.308},totals_usd_by_margin:{'0.5':36.08,'0.4':31.29,'0.45':33.414},
 volume_margin_tiers:[{units:'50-100',margin:0.5},{units:'100-150',margin:0.45},{units:'150-200',margin:0.4}],profit_calc:{profit_usd_per_unit:11.747,units:[150,175]}},
{id:'S9b',sheet:'Sheet9 (block 2 "updated")',client:'Eta Mu Chapter',project:'Crewneck/sweatshirt updated (chenille removed, print added)',garment_type:'crewneck',reliability:'HIGH',
 lines:L({fabric_standard:1300,embroidery:400,stitching:900,pattern:50,fuel_misc:250,rhinestone:150,sizetag:20,printing:400}),sheet_total_pkr:3470,
 margin_options:{'0.5':25.42,'0.4':21.18,'0.45':23.1},ship:{usd_per_kg:10.44,weight_kg:0.7,usd:7.308},totals_usd_by_margin:{'0.5':32.73,'0.4':28.488,'0.45':30.408},
 volume_margin_tiers:[{units:'50-100',margin:0.5},{units:'100-150',margin:0.45},{units:'150-200',margin:0.4}],notes:['Sheet B89/B91 mismatch: tier totals listed 30.408/28.488/36.08 (36.08 stale from block 1)']},
{id:'S10a',sheet:'Sheet10 (embroidery version)',client:'Eta Mu Chapter',project:'Crewneck embroidery version (with applique)',garment_type:'crewneck',complexity:'complex',reliability:'MEDIUM',
 lines:L({fabric_premium_crew:1750,applique_fabric:1500,embroidery:8000,stitching:2500,pattern:1200,rhinestone_pearls:1000}),sheet_total_pkr:15950,margin:null,notes:['Margin/FOB blank (not yet priced)']},
{id:'S10b',sheet:'Sheet10 (printing version)',client:'Eta Mu Chapter',project:'Crewneck printing version (with applique)',garment_type:'crewneck',complexity:'complex',reliability:'MEDIUM',
 lines:L({fabric_premium_crew:1750,applique_fabric:1500,embroidery:2000,stitching:2500,pattern:1200,rhinestone:1000,printing:4000}),sheet_total_pkr:13950,margin:null,shipping_estimate:{non_duty_paid_pkr:15420,duty_usd:30}},
{id:'S11',sheet:'Sheet11',duplicate_of:'S9a',reliability:'DUPLICATE'},
{id:'S12',sheet:'Sheet12',client:'Eta Mu Chapter',project:'Crewneck/sweatshirt (economy fabric + print/sublimation)',garment_type:'crewneck',reliability:'MEDIUM',
 lines:L({fabric_economy:500,embroidery:400,stitching:700,pattern:100,fuel_misc:250,rhinestone:150,sizetag:20,printing_sublimation:750}),sheet_total_pkr:2870,
 notes:['FOB cells (28.72/23.93/26.106) are STALE copies from S9a; cost is 10.51 USD so they do not follow the formula','Extra margin option 70 -> 33.7 (unexplained)']}
];
// validation of sheet arithmetic
const issues=[];
for(const s of sheets){ if(!s.lines) continue; const t=s.lines.reduce((a,l)=>a+l.pkr,0);
  s.recomputed_total_pkr=t; s.cost_usd=r2(t/FX); if(t!==s.sheet_total_pkr){ issues.push(`${s.id}: sum ${t} != sheet ${s.sheet_total_pkr}`); s.data_quality_flag=`Line items sum to ${t} PKR but sheet total is typed as ${s.sheet_total_pkr} (difference ${s.sheet_total_pkr-t} PKR unexplained - probably deleted rows). Totals/FOB follow the typed total.`;}}
w('real_quotation_sheets.json',sheets);

// ============ 2. CONFIG ============
const config={fx_pkr_per_usd:FX,currency_note:'USD = PKR / 273 (every sheet)',
 margin_mode:'gross_margin',margin_formula:'fob_usd = cost_usd / (1 - margin)   (verified on S2,S4,S5,S6,S7,S9)',
 margin_rules:{
  by_garment_default:{polo:0.30,reversible_zipup:0.30,sweater:0.40},
  by_quantity_tiers:[{min_qty:50,max_qty_exclusive:100,margin:0.50},{min_qty:100,max_qty_exclusive:150,margin:0.45},{min_qty:150,max_qty_exclusive:200,margin:0.40}],
  tier_edge_rule:'[min, max) - 150 units falls in the 150-200 tier',
  outside_tiers:{margin:0.30,flag:true,reason:'No sheet evidence below 50 or above 200 units'},
  precedence:'by_garment_default if garment type present, else by_quantity_tiers, else outside_tiers (flagged)'},
 shipping:{rate_usd_per_kg:10.44,alt_rate_usd_per_kg:9.62,
  estimated_weight_kg_per_garment:{polo:0.65,crewneck:0.7,sweater:1.5,reversible_zipup:1.5,hoodie:1.0,default:1.0},
  options:[{id:'duty_paid_2kg',label:'Duty paid, ~12 days',usd:49.72,pkr:13575,example_weight_kg:2},{id:'dhl_direct',label:'DHL direct, 4-5 days, duty NOT included (~USD 30 expected)',usd:54.49,pkr:14876,expected_duty_usd:30}],
  final_price_formula:'total_per_garment_usd = fob_usd + weight_kg * rate_usd_per_kg'},
 incoterm_footer:'Our prices are FOB [Sialkot, Pakistan]. You can arrange your own shipper to pick up the cargo. If you do not have one, we can arrange shipping for you at an extra cost.',
 rounding:'2 decimals on USD'};
w('pricing_config.json',config);

// ============ 3. RATES derived from sheets ============
const med=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return Math.round(s.length%2?s[m]:(s[m-1]+s[m])/2)};
const R=(code,category,technique,name,appliesTo,observed,src,extra={})=>({code,category,technique,name,appliesTo,method:'fixed',scope:'per_unit',currency:'PKR',
  rate:extra.rate??med(observed),observed_pkr:observed,n_observations:observed.length,source_sheets:src,
  confidence:observed.length>=3?'MEDIUM':observed.length===2?'LOW-MEDIUM':'LOW',active:true,...extra.rest});
const B=(code,category,technique,name,appliesTo,axis,bands,src,note)=>({code,category,technique,name,appliesTo,method:'bracket',scope:'per_unit',currency:'PKR',
  pricing_axis:axis,brackets:bands,source_sheets:src,confidence:'LOW',assumed_band_edges:true,notes:note,active:true});
const rates=[
 R('SEW_POLO','construction','stitching','Stitching - Polo',['polo'],[1000],['S2']),
 R('SEW_CREW','construction','stitching','Stitching - Crewneck (standard)',['crewneck'],[900,900,700],['S9a','S9b','S12']),
 R('SEW_CREW_CX','construction','stitching','Stitching - Crewneck (complex: applique etc.)',['crewneck'],[2500,2500],['S10a','S10b'],{rest:{tier:'complex'}}),
 R('SEW_ZIPUP','construction','stitching','Stitching - Reversible Zip-up',['reversible_zipup'],[3000,4000,2000,2000],['S1','S3','S4','S5'],{rest:{notes:'High variance 2000-4000; probably quantity/complexity dependent'}}),
 R('PAT_POLO','construction','pattern','Pattern - Polo (per garment, amortised)',['polo'],[300],['S2']),
 R('PAT_CREW','construction','pattern','Pattern - Crewneck (per garment, amortised)',['crewneck'],[50,100,50],['S9a','S12','S9b']),
 R('PAT_CREW_CX','construction','pattern','Pattern - Crewneck complex',['crewneck'],[1200,1200],['S10a','S10b'],{rest:{tier:'complex'}}),
 R('PAT_ZIPUP','construction','pattern','Pattern - Reversible Zip-up',['reversible_zipup'],[2250,3000,600,450],['S1','S3','S4','S5'],{rest:{notes:'Sheet S4 notes "Pattern 1200 (per size)": confirm if per-garment or per-order amortised'}}),
 R('FUEL_POLO','fixed','fuel_misc','Fuel/misc - Polo',['polo'],[100],['S2']),
 R('FUEL_CREW','fixed','fuel_misc','Fuel/misc - Crewneck',['crewneck'],[250,250,250],['S9a','S9b','S12']),
 R('FUEL_ZIPUP','fixed','fuel_misc','Fuel/misc - Zip-up',['reversible_zipup'],[100,200,200,2000],['S1','S4','S5','S3'],{rest:{notes:'S3 value 2000 is an outlier (median used)'}}),
 R('FUEL_SWEATER','fixed','fuel_misc','Fuel/misc - Sweater',['sweater'],[200],['S6']),
 R('FAB_POLO','fabric','polo_fabric','Polo fabric',['polo'],[1400],['S2']),
 R('FAB_CREW_ECON','fabric','crewneck_economy','Crewneck fabric - economy',['crewneck'],[500],['S12']),
 R('FAB_CREW_STD','fabric','crewneck_standard','Crewneck fabric - standard',['crewneck'],[1300],['S9a']),
 R('FAB_CREW_PREM','fabric','crewneck_premium','Crewneck fabric - premium',['crewneck'],[1750],['S10a']),
 R('FAB_FT400','fabric','french_terry_400gsm_80_20','French Terry 400GSM 80/20',['*'],[2600],['S1']),
 R('FAB_FLANNEL','fabric','flannel','Flannel fabric',['*'],[1800],['S1']),
 R('FAB_ZIPUP_LIGHT','fabric','zipup_light','Zip-up fabric - light (e.g. black)',['reversible_zipup'],[1100],['S4']),
 R('FAB_ZIPUP_PREM','fabric','zipup_premium','Zip-up fabric - premium',['reversible_zipup'],[4200,5000],['S5','S3']),
 R('FAB_APPLIQUE','fabric','applique_fabric','Appliqué fabric',['*'],[1500],['S10a']),
 R('BLANK_SWEATER','fabric','blank_sweater','Blank sweater (purchased)',['sweater'],[5000],['S6']),
 B('EMB','embellishment','embroidery','Embroidery (by size band)',['*'],'area_sq_in',[{max:6,price:400,observed:[400,400,400,600],sheets:['S9a','S9b','S12','S6']},{max:25,price:1100,observed:[1100,1100,850,1100],sheets:['S2','S5','S7','S4 note 1000-1200']},{max:80,price:2000,observed:[2000,2000],sheets:['S4','S10b']},{max:null,price:9000,observed:[8000,10000],sheets:['S10a','S3']}],['S2-S10'],'Sheets give embroidery cost but NOT dimensions. Bands are ASSUMED to match observed price clusters; calibrate with real sizes/stitch counts.'),
 R('CHENILLE','embellishment','chenille_embroidery','Chenille embroidery',['*'],[850],['S9a'],{rest:{notes:'size unknown'}}),
 B('PRINT','embellishment','printing','Printing / Sublimation (by size band)',['*'],'area_sq_in',[{max:12,price:400,observed:[400],sheets:['S9b']},{max:40,price:775,observed:[750,800],sheets:['S12','S8(scratch)']},{max:150,price:4000,observed:[4000],sheets:['S10b']},{max:null,price:10000,observed:[10000],sheets:['S1']}],['S1,S9b,S10b,S12'],'Bands assumed; sheet has no print dimensions.'),
 B('RHINE','embellishment','rhinestones','Rhinestones / pearls (by piece-count band)',['*'],'piece_count',[{max:30,price:150,observed:[150,150,150],sheets:['S9a','S9b','S12']},{max:300,price:1000,observed:[1000,1000],sheets:['S10a','S10b']},{max:null,price:2500,observed:[2500],sheets:['S1']}],['S1,S9,S10,S12'],'Piece counts assumed; sheet has none.'),
 R('FUR','embellishment','fur','Fur',['*'],[1500],['S1'],{rest:{notes:'S8 scratch shows 500'}}),
 R('DISTRESS','embellishment','distressing','Distressing',['*'],[500],['S1'],{rest:{notes:'S8 scratch shows 100'}}),
 R('ZIP','trim','zipper','Zipper',['*'],[200,400,1500],['S5','S4','S1'],{rest:{notes:'Wide spread: confirm zipper types'}}),
 R('ZIP_DOUBLE','trim','double_sided_zip','Double-sided zip',['*'],[350],['S1']),
 R('ZIP_PULLER','trim','zip_puller_woven','Custom woven zip puller',['*'],[200],['S4']),
 R('RIB_CUSTOM','trim','custom_rib','Custom rib',['*'],[700,700],['S4','S5']),
 R('QUILT','trim','quilt','Quilt lining',['*'],[800,800],['S4','S5']),
 R('BTN_POLO','trim','button','Buttons - Polo',['polo'],[50],['S2']),
 R('BTN_ZIPUP','trim','button','Buttons - Zip-up',['reversible_zipup'],[1000],['S3']),
 R('TAG_PRINT','trim','sizetag','Size tag - crewneck',['crewneck'],[20,20,20],['S9a','S9b','S12']),
 R('TAG_WOVEN','trim','sizetag','Size tag - zip-up/sweater',['reversible_zipup','sweater'],[300,250,250],['S4','S5','S6']),
 {...R('LABEL_WOVEN_SIZE','trim','sizetag_woven','Woven label (per size, per order)',['*'],[1500],['S1','S4 note']),scope:'per_order',notes:'Charged once per size, not per garment'}
];
w('rate_cards.json',rates);
const missing=['laser_cutting','hoodie construction (stitching/pattern/fuel)','tshirt construction','embroidery by stitch count'];

// ============ 4. REFERENCE CALCULATOR ============
function pick(cat,tech,gt,tier='standard'){return rates.filter(x=>x.category===cat&&x.technique===tech&&(x.appliesTo.includes('*')||x.appliesTo.includes(gt))&&(x.tier||'standard')===tier).sort((a,b)=>b.appliesTo.includes(gt)-a.appliesTo.includes(gt))[0]||
  rates.filter(x=>x.category===cat&&x.technique===tech&&(x.appliesTo.includes('*')||x.appliesTo.includes(gt))).sort((a,b)=>b.appliesTo.includes(gt)-a.appliesTo.includes(gt))[0];}
const unitPrice=(r,v)=>{if(r.method==='fixed')return{p:r.rate,w:[]};if(v==null)return{p:0,w:[`Missing ${r.pricing_axis}`]};
  const b=r.brackets.find(x=>x.max==null||v<=x.max);return{p:b.price,w:r.assumed_band_edges?['Band edges assumed - verify']:[]};};
const marginFor=(gt,qty)=>{const m=config.margin_rules;if(m.by_garment_default[gt]!=null)return{m:m.by_garment_default[gt],flag:false};
  const t=m.by_quantity_tiers.find(x=>qty>=x.min_qty&&qty<x.max_qty_exclusive);return t?{m:t.margin,flag:false}:{m:m.outside_tiers.margin,flag:true};};
export const money=(cost_pkr,gt,qty)=>{const cost=cost_pkr/FX,{m,flag}=marginFor(gt,qty);const fob=cost/(1-m);const wkg=config.shipping.estimated_weight_kg_per_garment[gt]??config.shipping.estimated_weight_kg_per_garment.default;
  const ship=wkg*config.shipping.rate_usd_per_kg;return{cost_usd:r2(cost),margin:m,margin_flagged:flag,fob_usd:r2(fob),weight_kg:wkg,shipping_usd:r2(ship),total_per_garment_usd:r2(fob+ship)};};
function quote(ex){const gt=ex.garment.type,qty=ex.garment.quantity||1,tier=ex.garment.complexity||'standard',lines=[],warn=[];
 const add=(cat,tech,desc,rate,{basis=1,val=null,conf='HIGH'}={})=>{let p=0,w=[];if(!rate)w.push(`No approved rate for ${cat}/${tech} - NOT priced`);else{const u=unitPrice(rate,val);p=u.p;w=u.w;}
  const perg=rate?.scope==='per_order'?p*basis/qty:p*basis;lines.push({category:cat,description:desc,rate_code:rate?.code||null,unit_price_pkr:p,basis_qty:basis,per_garment_pkr:r2(perg),confidence:conf,needs_review:w.length>0||conf==='LOW'||!rate,warnings:w});};
 for(const t of['stitching','pattern','fuel_misc'])add(t==='fuel_misc'?'fixed':'construction',t,t,pick(t==='fuel_misc'?'fixed':'construction',t,gt,tier));
 for(const f of ex.fabrics)add('fabric',f.slug,`Fabric - ${f.slug}`,pick('fabric',f.slug,gt),{conf:f.confidence});
 for(const e of ex.embellishments){const area=e.width_in&&e.height_in?r2(e.width_in*e.height_in):null;const rate=pick('embellishment',e.type,gt);
  const val=rate?.pricing_axis==='piece_count'?e.piece_count:area;add('embellishment',e.type,`${e.type} - ${e.placement}`,rate,{val,basis:e.quantity||1,conf:e.confidence});}
 for(const t of ex.trims)add('trim',t.type,`Trim - ${t.type}`,pick('trim',t.type,gt),{basis:t.quantity_per_garment,conf:t.confidence});
 const cost_pkr=r2(lines.reduce((s,l)=>s+l.per_garment_pkr,0)),mm=money(cost_pkr,gt,qty);
 if(mm.margin_flagged)warn.push(`Quantity ${qty} outside observed margin tiers - ${mm.margin*100}% margin is an assumption`);
 lines.filter(l=>l.needs_review).forEach(l=>warn.push(`REVIEW ${l.description}: ${l.warnings.join('; ')||'low confidence'}`));
 return{extraction_id:ex.id,status:'DRAFT',quantity:qty,lines,cost_per_garment_pkr:cost_pkr,...mm,order_total_usd:r2(mm.total_per_garment_usd*qty),warnings:warn};}

// ============ 5. GOLDEN TESTS (formula check vs sheets) ============
const golden=[];const gcheck=(id,sheetId,marginKey,m,expFob,expTotal,wkg,rate)=>{const s=sheets.find(x=>x.id===sheetId);const cost=s.sheet_total_pkr/FX;const fob=cost/(1-m);const ship=wkg*rate;
 const g={test_id:id,sheet:sheetId,input:{lines_pkr:s.lines,margin:m,weight_kg:wkg,ship_rate_usd_per_kg:rate,fx:FX},expected:{cost_usd:r2(cost),fob_usd:r2(fob),shipping_usd:r2(ship),total_usd:r2(fob+ship)},sheet_values:{fob_usd:expFob,total_usd:expTotal}};
 g.matches_sheet_within_0_05=Math.abs(g.expected.fob_usd-expFob)<=0.05&&(expTotal==null||Math.abs(g.expected.total_usd-expTotal)<=0.05);golden.push(g);};
gcheck('G1','S2','0.3',0.3,20.67,27.17,0.65,10);gcheck('G2','S4','0.3',0.3,43.42,53.86,1,10.44);gcheck('G3','S5','0.3',0.3,51.8,67.46,1.5,10.44);
gcheck('G4','S6','0.4',0.4,36.9,52.56,1.5,10.44);gcheck('G5','S7','0.4',0.4,26.86,34.556,0.8,9.62);gcheck('G6','S7','0.5',0.5,32.24,39.936,0.8,9.62);
gcheck('G7','S9a','0.5',0.5,28.72,36.08,0.7,10.44);gcheck('G8','S9a','0.45',0.45,26.106,33.414,0.7,10.44);gcheck('G9','S9b','0.4',0.4,21.18,28.488,0.7,10.44);gcheck('G10','S9b','0.45',0.45,23.1,30.408,0.7,10.44);
w('golden_tests.json',golden);

// ============ 6. SAMPLE EXTRACTIONS + EXPECTED ============
const ex={
 howard_polo_100:{id:'EXT-101',garment:{type:'polo',style:'Howard University Polo',quantity:100},fabrics:[{slug:'polo_fabric',confidence:'HIGH'}],
  embellishments:[{type:'embroidery',placement:'left_chest',width_in:3.2,height_in:3.1,quantity:1,confidence:'HIGH'}],trims:[{type:'button',quantity_per_garment:1,confidence:'MEDIUM'}],
  reproduces_sheet:'S2 (cost 3950 PKR)'},
 eta_mu_crewneck_150:{id:'EXT-102',garment:{type:'crewneck',style:'Eta Mu Chapter Crewneck',quantity:150},fabrics:[{slug:'crewneck_standard',confidence:'HIGH'}],
  embellishments:[{type:'embroidery',placement:'left_chest',width_in:2.5,height_in:2,quantity:1,confidence:'HIGH'},{type:'chenille_embroidery',placement:'front',quantity:1,confidence:'MEDIUM'},{type:'rhinestones',placement:'front',piece_count:20,quantity:1,confidence:'MEDIUM'}],
  trims:[{type:'sizetag',quantity_per_garment:1,confidence:'HIGH'}],reproduces_sheet:'S9a (cost 3920 PKR, 150-200 tier => 40% margin)'},
 reversible_zipup_50_gaps:{id:'EXT-103',garment:{type:'reversible_zipup',style:'Reversible Zip-up',quantity:50},fabrics:[{slug:'zipup_light',confidence:'HIGH'},{slug:'sherpa_fleece',confidence:'LOW'}],
  embellishments:[{type:'embroidery',placement:'left_chest',width_in:4,height_in:4,quantity:1,confidence:'HIGH'},{type:'laser_cutting',placement:'sleeve',quantity:1,confidence:'MEDIUM'}],
  trims:[{type:'zipper',quantity_per_garment:1,confidence:'HIGH'},{type:'quilt',quantity_per_garment:1,confidence:'HIGH'},{type:'custom_rib',quantity_per_garment:1,confidence:'HIGH'},{type:'sizetag',quantity_per_garment:1,confidence:'HIGH'}],
  tests:'sherpa_fleece + laser_cutting have no rate -> must be flagged, never invented; qty 50 hits the 50-100 tier edge but garment default 30% wins'}};
w('sample_extractions.json',ex);
const expected={};for(const[k,v]of Object.entries(ex))expected[k]=quote(v);w('expected_quotations.json',expected);

// ============ report ============
console.log('SHEET ARITHMETIC ISSUES:',issues.length?issues:'none');
console.log('GOLDEN:',golden.map(g=>`${g.test_id}:${g.matches_sheet_within_0_05?'OK':'MISMATCH '+JSON.stringify(g.expected)+' vs '+JSON.stringify(g.sheet_values)}`).join(' | '));
for(const[k,v]of Object.entries(expected))console.log(k,'cost',v.cost_per_garment_pkr,'PKR',JSON.stringify({m:v.margin,fob:v.fob_usd,ship:v.shipping_usd,total:v.total_per_garment_usd,order:v.order_total_usd}),'warn',v.warnings.length);
fs.copyFileSync('gen2.mjs',OUT+'reference_calculator.mjs');
