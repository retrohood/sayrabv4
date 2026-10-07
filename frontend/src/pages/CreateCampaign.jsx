import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Plus, ArrowRight, Flame } from 'lucide-react';
import api from '../api/client';

const DOC_TYPES = {
  'Medical Assistance': ['Medical reports', 'Hospital estimates'],
  'Education / Student Fees': ['Admission letter', 'Fee challan'],
  'Small Business Support': ['Business proposal', 'Cost estimates'],
  'Disaster Relief': ['Evidence/photos', 'Relevant documentation'],
};

export default function CreateCampaign() {
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1); // 1 = Campaign info, 2 = Merchandise info, 3 = Success
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    shortDescription: '',
    fundingGoal: '',
    purposeOfFunds: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isEmergency: false,
    story: {
      background: '',
      currentSituation: '',
      fundingNeed: '',
      expectedImpact: '',
      supportingEvidence: '',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateDurationDays = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffTime = e.getTime() - s.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const setQuickDurationDays = (days) => {
    const startStr = form.startDate || new Date().toISOString().split('T')[0];
    const startDate = new Date(startStr);
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    setForm(prev => ({
      ...prev,
      startDate: startStr,
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    sizes: ['M', 'L'],
    colors: 'Black, White',
    stock: 100,
    image: '',
  });
  const [productSuccess, setProductSuccess] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [addedProducts, setAddedProducts] = useState([]);

  useEffect(() => {
    api.get('/constants')
      .then((res) => setCategories(res.data?.campaignCategories || []))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('story.')) {
      const key = name.split('.')[1];
      setForm({ ...form, story: { ...form.story, [key]: value } });
    } else {
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSizeChange = (size) => {
    setProductForm((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  // Step 1: Validate campaign info and proceed to merchandise without creating DB record
  const handleNextToMerchandise = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title?.trim() || !form.category || !form.location?.trim() || !form.shortDescription?.trim() || !form.fundingGoal || !form.purposeOfFunds?.trim() || !form.startDate || !form.endDate) {
      setError('Please fill in all required campaign fields before proceeding.');
      return;
    }

    const days = calculateDurationDays(form.startDate, form.endDate);
    if (days === null || days < 7 || days > 90) {
      setError(`Campaign duration from Starting Date to Finish Date must be between 7 and 90 days. Currently selected: ${days ?? 0} days.`);
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Validate merchandise, create campaign and merchandise together
  const handleFinalSubmitWithProduct = async (e) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');

    if (!productForm.name?.trim() || !productForm.price || Number(productForm.price) <= 0 || !productForm.description?.trim()) {
      setProductError('Please provide complete merchandise details (Name, Price > 0, and Description). Campaign cannot be created without merchandise.');
      return;
    }

    setProductLoading(true);

    try {
      // 1. Create campaign first
      const campaignRes = await api.post('/campaigns', {
        ...form,
        fundingGoal: Number(form.fundingGoal),
      });

      const newCampaign = campaignRes.data;

      // 2. Create linked product immediately
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 100,
        image: productForm.image?.trim() || `https://picsum.photos/seed/${productForm.name}/400/400`,
        sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
        colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Classic'],
        campaignId: newCampaign._id,
      };

      const productRes = await api.post('/products', payload);
      setAddedProducts([productRes.data]);
      setCreatedCampaign(newCampaign);
      setStep(3); // Success page
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to create campaign and linked merchandise. Please try again.');
    } finally {
      setProductLoading(false);
    }
  };

  const docTypes = DOC_TYPES[form.category] || ['Supporting documentation'];

  // Step 3: Success Screen
  if (step === 3 && createdCampaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <CheckCircle className="text-emerald-600 shrink-0" size={32} />
          <div>
            <h2 className="text-xl font-bold text-emerald-800">Campaign & Merchandise Created Successfully!</h2>
            <p className="text-emerald-700 mt-1 text-sm">
              Your campaign <strong>"{createdCampaign.title}"</strong> and its linked merchandise have been submitted and are now pending verification.
            </p>
          </div>
        </div>

        {addedProducts.length > 0 && (
          <div className="p-5 bg-white border border-slate-200 rounded-2xl mb-6 space-y-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary-600" /> Linked Campaign Merchandise:
            </h3>
            <div className="space-y-2">
              {addedProducts.map((p) => (
                <div key={p._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">PKR {p.price} · Stock: {p.stock} units · 50% proceeds support campaign</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">Linked</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer text-center"
          >
            Go to Fundraiser Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${createdCampaign.slug}`)}
            className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            View Public Page →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Merchandise Form (Required before DB creation)
  if (step === 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-bold mb-3">
            Step 2 of 2 · Mandatory Requirement
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Add Linked Merchandise</h1>
          <p className="text-slate-600 text-sm">
            Each campaign on SAYRAB must have at least one merchandise product linked to it. <strong>50% of all product sales</strong> directly fund your campaign goal. Campaign will only be created once merchandise info is provided.
          </p>
        </div>

        <form onSubmit={handleFinalSubmitWithProduct} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-800">Product Details</legend>
            <input
              required
              placeholder="Product Name * (e.g. Flood Relief Hoodie)"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="Apparel">Apparel (Shirt/Hoodie/Cap)</option>
                <option value="Drinkware">Drinkware (Mug/Flask)</option>
                <option value="Stationery">Stationery (Journal/Notebook)</option>
                <option value="Accessories">Accessories (Tote bag/Wristband)</option>
                <option value="Event Merchandise">Event Merchandise</option>
              </select>
              <input
                required
                type="number"
                min="1"
                placeholder="Price (PKR) *"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="Short Description of the merchandise *"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-800">Inventory & Styling</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="number"
                min="1"
                placeholder="Stock Quantity *"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input
                placeholder="Colors (Comma-separated, e.g. Black, White, Navy)"
                value={productForm.colors}
                onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">Available Sizes</span>
              <div className="flex flex-wrap gap-4">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={productForm.sizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-slate-700 uppercase">
              Mockup Image URL <span className="text-slate-400 font-normal lowercase">(optional - defaults automatically)</span>
            </legend>
            <input
              type="url"
              placeholder="Optional (e.g. https://... or leave empty for auto mockup)"
              value={productForm.image}
              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </fieldset>

          {productError && <p className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">{productError}</p>}
          {productSuccess && <p className="text-sm text-emerald-600 font-semibold p-3 bg-emerald-50 border border-emerald-200 rounded-lg">{productSuccess}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setProductError(''); setStep(1); }}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-center"
            >
              ← Back to Campaign Details
            </button>
            <button
              type="submit"
              disabled={productLoading}
              className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Plus size={18} /> {productLoading ? 'Creating Campaign & Product...' : 'Create Campaign with Merchandise'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 1: Campaign Details Form
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-bold mb-3">
          Step 1 of 2
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Start a Campaign</h1>
        <p className="text-slate-600">
          Fill in your campaign details. In Step 2, you will configure your mandatory linked merchandise before the campaign is created.
        </p>
      </div>

      <form onSubmit={handleNextToMerchandise} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-800">Basic Information</legend>
          <input
            name="title"
            placeholder="Campaign Title *"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
          >
            <option value="">Select Category *</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            name="location"
            placeholder="Location *"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <textarea
            name="shortDescription"
            placeholder="Short Description (max 300 chars) *"
            value={form.shortDescription}
            onChange={handleChange}
            required
            maxLength={300}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-800">Funding Information</legend>
          <input
            name="fundingGoal"
            type="number"
            placeholder="Funding Goal (PKR) *"
            value={form.fundingGoal}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <textarea
            name="purposeOfFunds"
            placeholder="Purpose of Funds *"
            value={form.purposeOfFunds}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
        </fieldset>

        <fieldset className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <legend className="text-base font-bold text-slate-800">Campaign Schedule & Duration *</legend>
              <p className="text-xs text-slate-500 mt-0.5">Select your Starting Date and Finish Date (must be 7 to 90 days total).</p>
            </div>
            {(() => {
              const days = calculateDurationDays(form.startDate, form.endDate);
              if (days === null) return null;
              if (days >= 7 && days <= 90) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle size={14} /> Total Duration: {days} Days (Valid)
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  ⚠ Duration: {days} Days (Must be 7–90 days)
                </span>
              );
            })()}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Date *</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Finish Date *</label>
              <input
                name="endDate"
                type="date"
                min={form.startDate || new Date().toISOString().split('T')[0]}
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">Quick Duration:</span>
            {[
              { label: '+15 Days', days: 15 },
              { label: '+30 Days (Recommended)', days: 30 },
              { label: '+45 Days', days: 45 },
              { label: '+60 Days', days: 60 },
              { label: '+90 Days (Max)', days: 90 },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => setQuickDurationDays(preset.days)}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Emergency / Urgent Campaign Toggle */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${form.isEmergency ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' : 'bg-slate-50 border-slate-200'}`}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isEmergency"
              checked={form.isEmergency}
              onChange={handleChange}
              className="mt-1 w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Mark as Emergency Campaign</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-700 border border-rose-200">
                  Urgent / Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Check this if this campaign is time-critical (e.g. ICU patient, immediate life-saving surgery, acute disaster relief). Emergency campaigns receive a prominent emergency badge and prioritized visibility for donors.
              </p>
            </div>
          </label>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-800">Campaign Story</legend>
          {['background', 'currentSituation', 'fundingNeed', 'expectedImpact', 'supportingEvidence'].map(
            (key) => (
              <textarea
                key={key}
                name={`story.${key}`}
                placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()) + ' *'}
                value={form.story[key]}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              />
            )
          )}
        </fieldset>

        {form.category && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Required documentation for {form.category}:
            </p>
            <ul className="text-sm text-amber-700 list-disc list-inside">
              {docTypes.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
        >
          Next: Add Linked Merchandise (Required) <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
