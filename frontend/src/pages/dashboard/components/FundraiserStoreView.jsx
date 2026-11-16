import { useState, useRef } from 'react';
import {
  ShoppingBag,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  Layers,
  Sliders,
  Plus,
  Eye,
  Trash2,
  ShieldCheck,
  Tag,
  Info,
} from 'lucide-react';
import api from '../../../api/client';
import { formatCurrency } from '../../../utils/format';

const PRODUCTS = [
  {
    id: 'shirt_front',
    name: 'Classic Cotton T-Shirt (Front)',
    category: 'Apparel',
    baseCost: 1200,
    defaultPrice: 2200,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    shape: 'tshirt',
    view: 'front',
  },
  {
    id: 'shirt_back',
    name: 'Classic Cotton T-Shirt (Back)',
    category: 'Apparel',
    baseCost: 1200,
    defaultPrice: 2200,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    shape: 'tshirt',
    view: 'back',
  },
  {
    id: 'hoodie',
    name: 'Heavyweight Fleece Hoodie',
    category: 'Apparel',
    baseCost: 2600,
    defaultPrice: 4200,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    shape: 'hoodie',
    view: 'front',
  },
  {
    id: 'mug',
    name: 'Ceramic Coffee Mug (11oz)',
    category: 'Drinkware',
    baseCost: 650,
    defaultPrice: 1200,
    sizes: ['Standard 11oz'],
    shape: 'mug',
    view: 'front',
  },
  {
    id: 'notebook',
    name: 'Hardcover Spiral Notebook',
    category: 'Stationery',
    baseCost: 550,
    defaultPrice: 1050,
    sizes: ['A5 / 160 Pages'],
    shape: 'notebook',
    view: 'front',
  },
  {
    id: 'tote_bag',
    name: 'Organic Cotton Canvas Tote',
    category: 'Accessories',
    baseCost: 750,
    defaultPrice: 1500,
    sizes: ['15" x 16"'],
    shape: 'tote',
    view: 'front',
  },
];

const COLORS = [
  { name: 'Pure White', hex: '#ffffff', border: 'border-slate-300' },
  { name: 'Heather Gray', hex: '#d1d5db', border: 'border-slate-400' },
  { name: 'Pitch Black', hex: '#18181b', border: 'border-black' },
  { name: 'Navy Blue', hex: '#1e293b', border: 'border-slate-800' },
  { name: 'Brand Green', hex: '#367c35', border: 'border-[#367c35]' },
  { name: 'Soft Sage', hex: '#b4df76', border: 'border-[#89ca2e]' },
];

export default function FundraiserStoreView({ campaigns = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [artworkUrl, setArtworkUrl] = useState('/sayrab.png');
  const [scale, setScale] = useState(60);
  const [posY, setPosY] = useState(38);
  const [posX, setPosX] = useState(50);
  const [retailPrice, setRetailPrice] = useState(PRODUCTS[0].defaultPrice);
  const [productTitle, setProductTitle] = useState('Official Cause Merchandise');
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?._id || '');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  // Revenue split calculations based on 50% Organization, 45% Manufacturer, 5% Sayrab
  const margin = Math.max(0, retailPrice - selectedProduct.baseCost);
  const fundraiserProfit = Math.round(margin * 0.50);
  const manufacturerShare = Math.round(selectedProduct.baseCost + margin * 0.45);
  const platformFee = Math.round(margin * 0.05);

  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
    setRetailPrice(prod.defaultPrice);
    setProductTitle(`${prod.name} - Cause Edition`);
  };

  const handleArtworkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setArtworkUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishProduct = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishMessage({ text: '', type: '' });

    try {
      const payload = {
        name: productTitle,
        category: selectedProduct.category,
        price: Number(retailPrice),
        description: `High-quality ${selectedProduct.name}. 50% of net proceeds directly benefit verified community causes.`,
        image: artworkUrl,
        sizes: selectedProduct.sizes,
        colors: [selectedColor.name],
        stock: 100,
        campaignId: selectedCampaignId || undefined,
        branding: 'campaign',
      };

      await api.post('/products', payload);
      setPublishMessage({
        text: 'Merchandise successfully published to the Sayrab Store!',
        type: 'success',
      });
    } catch (err) {
      setPublishMessage({
        text: err.response?.data?.message || 'Failed to publish product. Please verify fields.',
        type: 'error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#10182b]">
            Fundraiser Online Store & Merch Customizer
          </h2>
          <p className="text-xs text-[#64748b]">
            Design apparel, drinkware, and stationery with live realistic previews and certified 50/45/5 profit share
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#89ca2e]/15 border border-[#89ca2e]/30 text-xs font-bold text-[#367c35]">
          <ShieldCheck size={16} />
          <span>50% Fundraiser Royalty Split</span>
        </div>
      </div>

      {publishMessage.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold ${
            publishMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {publishMessage.text}
        </div>
      )}

      {/* Product Template Selector Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PRODUCTS.map((prod) => (
          <button
            key={prod.id}
            type="button"
            onClick={() => handleProductChange(prod)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedProduct.id === prod.id
                ? 'bg-white border-[#89ca2e] ring-2 ring-[#89ca2e]/20 shadow-sm'
                : 'bg-white border-[#e5e9e3] hover:border-[#89ca2e]/40'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#f7f9f5] border border-[#e5e9e3] flex items-center justify-center text-[#367c35] mb-2 font-black text-xs">
              {prod.shape === 'tshirt' ? 'TS' : prod.shape === 'hoodie' ? 'HD' : prod.shape === 'mug' ? 'MG' : prod.shape === 'notebook' ? 'NB' : 'TB'}
            </div>
            <p className="text-xs font-bold text-[#10182b] line-clamp-1">{prod.name}</p>
            <p className="text-[10px] text-[#64748b]">Base: {formatCurrency(prod.baseCost)}</p>
          </button>
        ))}
      </div>

      {/* Main Studio Area: Left Mockup Canvas, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Realistic Visual Mockup Canvas (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e5e9e3] p-6 shadow-xs flex flex-col items-center justify-center relative overflow-hidden min-h-[480px]">
          {/* Studio Header controls */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-[#e5e9e3] mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#10182b]">{selectedProduct.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7f9f5] border border-[#e5e9e3] text-[#64748b]">
                {selectedColor.name}
              </span>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    col.border
                  } ${selectedColor.hex === col.hex ? 'scale-125 shadow-xs' : 'hover:scale-110'}`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Interactive Mockup Visual Renderer */}
          <div className="relative w-full max-w-[360px] h-[360px] flex items-center justify-center">
            {/* SVG Base Silhouettes */}
            {selectedProduct.shape === 'tshirt' && (
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md transition-colors duration-300">
                <path
                  d="M60 20 L80 35 C90 40 110 40 120 35 L140 20 L180 50 L155 80 L140 68 L140 180 L60 180 L60 68 L45 80 L20 50 Z"
                  fill={selectedColor.hex}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Collar and stitching accents */}
                <path
                  d="M80 35 C90 45 110 45 120 35"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {selectedProduct.view === 'back' && (
                  <path d="M80 35 C90 28 110 28 120 35" fill="none" stroke="#94a3b8" strokeWidth="2" />
                )}
              </svg>
            )}

            {selectedProduct.shape === 'hoodie' && (
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md transition-colors duration-300">
                <path
                  d="M65 15 C85 5 115 5 135 15 L145 28 L185 55 L160 88 L145 78 L145 185 L55 185 L55 78 L40 88 L15 55 L55 28 Z"
                  fill={selectedColor.hex}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                <path d="M85 28 C95 40 105 40 115 28" fill="none" stroke="#94a3b8" strokeWidth="2" />
                {/* Kangaroo Pocket */}
                <path d="M70 125 L130 125 L135 160 L65 160 Z" fill={selectedColor.hex} stroke="#94a3b8" strokeWidth="1.5" />
              </svg>
            )}

            {selectedProduct.shape === 'mug' && (
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                <rect x="55" y="45" width="90" height="115" rx="8" fill={selectedColor.hex} stroke="#cbd5e1" strokeWidth="2" />
                <path d="M145 65 C175 65 175 125 145 125" fill="none" stroke={selectedColor.hex === '#18181b' ? '#334155' : '#cbd5e1'} strokeWidth="14" strokeLinecap="round" />
              </svg>
            )}

            {selectedProduct.shape === 'notebook' && (
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                <rect x="50" y="30" width="105" height="140" rx="4" fill={selectedColor.hex} stroke="#cbd5e1" strokeWidth="2" />
                <line x1="60" y1="30" x2="60" y2="170" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            )}

            {selectedProduct.shape === 'tote' && (
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                <path d="M75 55 C75 20 125 20 125 55" fill="none" stroke="#94a3b8" strokeWidth="6" />
                <rect x="45" y="55" width="110" height="115" rx="4" fill={selectedColor.hex} stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            )}

            {/* Artwork Placement Overlay Box */}
            <div
              className="absolute pointer-events-none transition-all duration-150 flex items-center justify-center overflow-hidden"
              style={{
                top: `${posY}%`,
                left: `${posX}%`,
                transform: 'translate(-50%, -50%)',
                width: `${scale}%`,
                maxWidth: '160px',
                maxHeight: '160px',
              }}
            >
              <img
                src={artworkUrl}
                alt="Custom Print"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#64748b] mt-4">
            Live Preview • Realistic texture and printable bounding box
          </p>
        </div>

        {/* Right: Customization Controls & Pricing Calculator (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e5e9e3] p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
            <Sliders size={16} className="text-[#367c35]" />
            <span>Customization & Pricing</span>
          </h3>

          {/* Artwork Uploader */}
          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Upload Custom Logo / Artwork
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleArtworkUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-[#f7f9f5] hover:bg-[#e5e9e3] border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UploadCloud size={15} className="text-[#367c35]" />
              <span>Upload Print Artwork (PNG/JPG)</span>
            </button>
          </div>

          {/* Sliders for Scale & Position */}
          <div className="space-y-3 p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3]">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#10182b] mb-1">
                <span>Print Scale</span>
                <span>{scale}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-[#89ca2e] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#10182b] mb-1">
                <span>Vertical Position</span>
                <span>{posY}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="65"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-[#89ca2e] cursor-pointer"
              />
            </div>
          </div>

          {/* Product Publishing Details */}
          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Attach to Campaign
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            >
              <option value="">Platform Wide (No single campaign)</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing & Split Breakdown */}
          <div className="p-4 bg-[#89ca2e]/10 border border-[#89ca2e]/30 rounded-2xl space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-[#10182b] mb-1">
                <span>Retail Price (PKR)</span>
                <span className="text-[#367c35] text-sm font-black">{formatCurrency(retailPrice)}</span>
              </div>
              <input
                type="number"
                min={selectedProduct.baseCost + 200}
                step="50"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Math.max(selectedProduct.baseCost, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-white border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] outline-none"
              />
            </div>

            {/* Split Distribution Table */}
            <div className="space-y-1.5 pt-2 border-t border-[#89ca2e]/20 text-xs">
              <div className="flex justify-between text-[#64748b]">
                <span>Base Production Cost:</span>
                <span className="font-bold text-[#10182b]">{formatCurrency(selectedProduct.baseCost)}</span>
              </div>
              <div className="flex justify-between text-[#367c35] font-bold">
                <span>Fundraiser Organization Share (50%):</span>
                <span>+{formatCurrency(fundraiserProfit)}</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Manufacturer Production & Margin (45%):</span>
                <span>{formatCurrency(manufacturerShare)}</span>
              </div>
              <div className="flex justify-between text-[#64748b]">
                <span>Sayrab Platform Oversight (5%):</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublishProduct}
            className="w-full py-3 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag size={15} />
            <span>{isPublishing ? 'Publishing to Store...' : 'Publish Custom Merchandise'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
