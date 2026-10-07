import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Plus, ArrowRight, Flame, Trash2, Layers } from 'lucide-react';
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
  const [merchList, setMerchList] = useState([]);
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

  const handleAddProductToList = () => {
    setProductError('');
    setProductSuccess('');

    if (!productForm.name?.trim()) {
      setProductError('Product name is required.');
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      setProductError('A valid price in PKR (> 0) is required.');
      return;
    }
    if (!productForm.description?.trim()) {
      setProductError('Product short description is required.');
      return;
    }

    const newItem = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock) || 100,
      image: productForm.image?.trim() || `https://picsum.photos/seed/${encodeURIComponent(productForm.name)}/400/400`,
      sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Classic'],
    };

    setMerchList(prev => [...prev, newItem]);
    setProductSuccess(`Added "${newItem.name}" to merchandise list! You can add another product below.`);
    setProductForm({
      name: '',
      description: '',
      category: 'Apparel',
      price: '',
      sizes: ['M', 'L'],
      colors: 'Black, White',
      stock: 100,
      image: '',
    });
  };

  const handleRemoveProductFromList = (index) => {
    setMerchList(prev => prev.filter((_, i) => i !== index));
  };

  // Step 1: Validate campaign info and proceed to merchandise
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

    let productsToCreate = [...merchList];

    // If no items staged, check if the current filled product form can be used
    if (productsToCreate.length === 0) {
      if (!productForm.name?.trim() || !productForm.price || Number(productForm.price) <= 0 || !productForm.description?.trim()) {
        setProductError('Please provide at least one merchandise product (Name, Price > 0, and Description).');
        return;
      }
      productsToCreate.push({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 100,
        image: productForm.image?.trim() || `https://picsum.photos/seed/${encodeURIComponent(productForm.name)}/400/400`,
        sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
        colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Classic'],
      });
    } else if (productForm.name?.trim() && productForm.price && Number(productForm.price) > 0 && productForm.description?.trim()) {
      // Also include current form if filled before clicking submit
      productsToCreate.push({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 100,
        image: productForm.image?.trim() || `https://picsum.photos/seed/${encodeURIComponent(productForm.name)}/400/400`,
        sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
        colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : ['Classic'],
      });
    }

    setProductLoading(true);

    try {
      // 1. Create campaign first
      const campaignRes = await api.post('/campaigns', {
        ...form,
        fundingGoal: Number(form.fundingGoal),
      });

      const newCampaign = campaignRes.data;

      // 2. Create all linked products
      const productPromises = productsToCreate.map(p =>
        api.post('/products', {
          ...p,
          campaignId: newCampaign._id,
        })
      );

      const createdResponses = await Promise.all(productPromises);
      setAddedProducts(createdResponses.map(r => r.data));
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
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in pb-20">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 mb-8 shadow-2xl space-y-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-white">Campaign & Merchandise Created!</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Your campaign <strong className="text-cyan-400">"{createdCampaign.title}"</strong> and its linked merchandise have been submitted and are now pending review.
          </p>
        </div>

        {addedProducts.length > 0 && (
          <div className="p-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl mb-8 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ShoppingBag size={18} /> Linked Campaign Merchandise ({addedProducts.length}):
            </h3>
            <div className="space-y-2">
              {addedProducts.map((p) => (
                <div key={p._id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400">PKR {p.price} · Stock: {p.stock} units · 50% proceeds support campaign</p>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                    Linked
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer text-center"
          >
            Go to Fundraiser Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${createdCampaign.slug}`)}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            View Public Page →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Merchandise Form
  if (step === 2) {
    const totalCount = merchList.length + (productForm.name?.trim() && productForm.price ? 1 : 0);

    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in pb-20 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold mb-3">
            Step 2 of 2 · Link Campaign Merchandise (1 or Multiple Products)
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Add Linked Merchandise</h1>
          <p className="text-slate-400 text-xs mt-1">
            Every campaign on Sayrab must have at least one merchandise item linked to it. You can link <strong>one or multiple products</strong>. <strong>50% of all product sales</strong> directly fund your campaign goal.
          </p>
        </div>

        {/* Existing Added Merchandise List */}
        {merchList.length > 0 && (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-cyan-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Layers size={16} /> Products Ready to Link ({merchList.length})
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Will be created with campaign
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {merchList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-start justify-between gap-3 relative group hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <p className="font-bold text-white text-xs line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PKR {Number(item.price).toLocaleString()} · {item.stock} in stock
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProductFromList(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remove product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleFinalSubmitWithProduct} className="bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <legend className="text-sm font-black text-white uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <ShoppingBag size={18} /> {merchList.length === 0 ? 'Primary Merchandise Product' : `Add Another Product (#${merchList.length + 1})`}
            </legend>
            {merchList.length > 0 && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                ✓ {merchList.length} in list
              </span>
            )}
          </div>

          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-slate-400 uppercase">Product Details</legend>
            <input
              placeholder="Product Name * (e.g. Flood Relief Hoodie)"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="Apparel">Apparel (Shirt/Hoodie/Cap)</option>
                <option value="Drinkware">Drinkware (Mug/Flask)</option>
                <option value="Stationery">Stationery (Journal/Notebook)</option>
                <option value="Accessories">Accessories (Tote bag/Wristband)</option>
                <option value="Event Merchandise">Event Merchandise</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Price (PKR) *"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Short Description of the merchandise *"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-bold text-slate-400 uppercase">Inventory & Styling</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="number"
                min="1"
                placeholder="Stock Quantity *"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <input
                placeholder="Colors (Comma-separated, e.g. Black, White, Navy)"
                value={productForm.colors}
                onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Available Sizes</span>
              <div className="flex flex-wrap gap-4">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={productForm.sizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-slate-400 uppercase">
              Mockup Image URL <span className="text-slate-500 font-normal lowercase">(optional - defaults automatically)</span>
            </legend>
            <input
              type="url"
              placeholder="Optional (e.g. https://... or leave empty for auto mockup)"
              value={productForm.image}
              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </fieldset>

          {/* Button to add current item to list so fundraiser can enter more products */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Want to link multiple merchandise products? Add this item to the list and configure another!
            </div>
            <button
              type="button"
              onClick={handleAddProductToList}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> + Add Another Product
            </button>
          </div>

          {productError && <p className="text-xs text-red-300 p-3 bg-red-950/50 border border-red-800 rounded-xl">{productError}</p>}
          {productSuccess && <p className="text-xs text-emerald-300 font-semibold p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl">{productSuccess}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { setProductError(''); setStep(1); }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              ← Back to Campaign Details
            </button>
            <button
              type="submit"
              disabled={productLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} /> {productLoading ? 'Creating Campaign & Merchandise...' : `Create Campaign & Link Merchandise (${Math.max(1, totalCount)} product${totalCount > 1 ? 's' : ''})`}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 1: Campaign Details Form
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-20 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold mb-3">
          Step 1 of 2
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Start a Campaign</h1>
        <p className="text-slate-400 text-xs mt-1">
          Fill in your campaign details. In Step 2, you will configure your linked merchandise before submission.
        </p>
      </div>

      <form onSubmit={handleNextToMerchandise} className="bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">Basic Information</legend>
          <input
            name="title"
            placeholder="Campaign Title *"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <textarea
            name="shortDescription"
            placeholder="Short Description (max 300 chars) *"
            value={form.shortDescription}
            onChange={handleChange}
            required
            maxLength={300}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">Funding Information</legend>
          <input
            name="fundingGoal"
            type="number"
            placeholder="Funding Goal (PKR) *"
            value={form.fundingGoal}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <textarea
            name="purposeOfFunds"
            placeholder="Purpose of Funds *"
            value={form.purposeOfFunds}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
          />
        </fieldset>

        <fieldset className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <legend className="text-sm font-bold text-white uppercase tracking-wider">Campaign Schedule & Duration *</legend>
              <p className="text-xs text-slate-400 mt-0.5">Select Starting Date and Finish Date (must be 7 to 90 days total).</p>
            </div>
            {(() => {
              const days = calculateDurationDays(form.startDate, form.endDate);
              if (days === null) return null;
              if (days >= 7 && days <= 90) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle size={14} /> Total Duration: {days} Days (Valid)
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚠ Duration: {days} Days (Must be 7–90 days)
                </span>
              );
            })()}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Starting Date *</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Finish Date *</label>
              <input
                name="endDate"
                type="date"
                min={form.startDate || new Date().toISOString().split('T')[0]}
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400">Quick Duration:</span>
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
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Emergency Campaign Toggle */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${form.isEmergency ? 'bg-red-950/40 border-red-800' : 'bg-slate-950/60 border-slate-800'}`}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isEmergency"
              checked={form.isEmergency}
              onChange={handleChange}
              className="mt-1 w-4 h-4 accent-red-500 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Mark as Emergency Campaign</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/30">
                  Urgent Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Check this if this campaign is time-critical (e.g. ICU patient, immediate life-saving surgery, acute disaster relief).
              </p>
            </div>
          </label>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-black text-white uppercase tracking-wider text-cyan-400">Campaign Story</legend>
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
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
              />
            )
          )}
        </fieldset>

        {form.category && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 text-xs">
            <p className="font-bold text-cyan-400">
              Required documentation for {form.category}:
            </p>
            <ul className="text-slate-400 list-disc list-inside space-y-0.5">
              {docTypes.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-xs text-red-400 p-3 bg-red-950/50 border border-red-800 rounded-xl">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          Next: Add Linked Merchandise (Required) <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
