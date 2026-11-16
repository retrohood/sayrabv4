import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Plus, ArrowRight, Trash2, Layers, AlertCircle } from 'lucide-react';
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
    setForm((prev) => ({
      ...prev,
      startDate: startStr,
      endDate: endDate.toISOString().split('T')[0],
    }));
  };

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Apparel',
    price: '',
    stock: 100,
    description: '',
    image: '',
    sizes: ['M', 'L'],
    colors: 'Black, White',
  });
  const [merchList, setMerchList] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');

  useEffect(() => {
    api
      .get('/campaigns/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        } else {
          setCategories([
            'Medical Assistance',
            'Education / Student Fees',
            'Small Business Support',
            'Disaster Relief',
            'Community Project',
          ]);
        }
      })
      .catch(() => {
        setCategories([
          'Medical Assistance',
          'Education / Student Fees',
          'Small Business Support',
          'Disaster Relief',
          'Community Project',
        ]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('story.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        story: { ...prev.story, [field]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleNextToMerchandise = (e) => {
    e.preventDefault();
    setError('');

    const days = calculateDurationDays(form.startDate, form.endDate);
    if (days === null || days < 7 || days > 90) {
      setError(`Campaign duration must be between 7 and 90 days. Current duration is ${days ?? 0} days.`);
      return;
    }

    if (!form.title || !form.category || !form.location || !form.fundingGoal || !form.purposeOfFunds) {
      setError('Please fill in all required campaign fields.');
      return;
    }

    if (Number(form.fundingGoal) <= 0) {
      setError('Funding Goal must be greater than zero.');
      return;
    }

    const { background, currentSituation, fundingNeed, expectedImpact, supportingEvidence } = form.story;
    if (!background || !currentSituation || !fundingNeed || !expectedImpact || !supportingEvidence) {
      setError('Please complete all 5 parts of the campaign story.');
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      name: `${form.title} - Official Tee`,
      description: `Support "${form.title}" by purchasing official charity merchandise. 50% proceeds directly fund this campaign.`,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      price: '2200',
    }));

    setStep(2);
  };

  const handleSizeChange = (size) => {
    setProductForm((prev) => {
      const exists = prev.sizes.includes(size);
      const nextSizes = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  const handleAddProductToList = () => {
    setProductError('');
    if (!productForm.name?.trim()) {
      setProductError('Please enter product name.');
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      setProductError('Please enter a valid price in PKR.');
      return;
    }
    if (!productForm.description?.trim()) {
      setProductError('Please enter a product description.');
      return;
    }

    const fallbackImg =
      productForm.category === 'Drinkware'
        ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
        : productForm.category === 'Stationery'
        ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';

    const newProd = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock) || 100,
      description: productForm.description.trim(),
      image: productForm.image?.trim() || fallbackImg,
      sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
      colors: productForm.colors
        ? productForm.colors.split(',').map((c) => c.trim()).filter(Boolean)
        : ['Black'],
    };

    setMerchList((prev) => [...prev, newProd]);
    setProductSuccess(`Added "${newProd.name}" to merchandise list!`);
    setTimeout(() => setProductSuccess(''), 2500);

    setProductForm({
      name: '',
      category: 'Apparel',
      price: '',
      stock: 100,
      description: '',
      image: '',
      sizes: ['M', 'L'],
      colors: 'Black, White',
    });
  };

  const handleRemoveProductFromList = (index) => {
    setMerchList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFinalSubmitWithProduct = async (e) => {
    e.preventDefault();
    setProductError('');

    const currentEnteredHasData = productForm.name?.trim() && productForm.price;
    if (merchList.length === 0 && !currentEnteredHasData) {
      setProductError('You must link at least one merchandise product to your campaign.');
      return;
    }

    const finalProductList = [...merchList];
    if (currentEnteredHasData) {
      const fallbackImg =
        productForm.category === 'Drinkware'
          ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';

      finalProductList.push({
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 100,
        description: productForm.description.trim() || `Official charity merchandise for ${form.title}`,
        image: productForm.image?.trim() || fallbackImg,
        sizes: productForm.sizes.length > 0 ? productForm.sizes : ['Standard'],
        colors: productForm.colors
          ? productForm.colors.split(',').map((c) => c.trim()).filter(Boolean)
          : ['Black'],
      });
    }

    setProductLoading(true);
    try {
      const campaignPayload = {
        title: form.title,
        category: form.category,
        location: form.location,
        shortDescription: form.shortDescription,
        fundingGoal: Number(form.fundingGoal),
        purposeOfFunds: form.purposeOfFunds,
        startDate: form.startDate,
        endDate: form.endDate,
        isEmergency: form.isEmergency,
        story: `${form.story.background}\n\n${form.story.currentSituation}\n\n${form.story.fundingNeed}\n\n${form.story.expectedImpact}\n\n${form.story.supportingEvidence}`,
        thumbnail: finalProductList[0]?.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
      };

      const resCamp = await api.post('/campaigns', campaignPayload);
      const newCampaign = resCamp.data;

      const productPromises = finalProductList.map((p) =>
        api.post('/products', {
          ...p,
          campaignId: newCampaign._id,
        })
      );

      const createdResponses = await Promise.all(productPromises);
      setAddedProducts(createdResponses.map((r) => r.data));
      setCreatedCampaign(newCampaign);
      setStep(3);
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to create campaign and linked merchandise.');
    } finally {
      setProductLoading(false);
    }
  };

  const docTypes = DOC_TYPES[form.category] || ['Supporting documentation'];

  // Step 3: Success Screen
  if (step === 3 && createdCampaign) {
    return (
      <div className="min-h-screen bg-[#f7f9f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 max-w-xl w-full shadow-xl space-y-5 text-center">
          <div className="w-16 h-16 bg-[#89ca2e]/20 text-[#367c35] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-[#10182b]">Campaign & Merchandise Created!</h2>
          <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Your campaign <strong className="text-[#367c35]">&quot;{createdCampaign.title}&quot;</strong> and its linked merchandise have been submitted for verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-[#89ca2e] hover:bg-[#78b327] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              Go to Fundraiser Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(`/campaigns/${createdCampaign.slug || createdCampaign._id}`)}
              className="flex-1 py-3 bg-[#f7f9f5] hover:bg-[#e5e9e3] border border-[#e5e9e3] text-[#10182b] font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              View Public Page →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Merchandise Form
  if (step === 2) {
    const totalCount = merchList.length + (productForm.name?.trim() && productForm.price ? 1 : 0);

    return (
      <div className="min-h-screen bg-[#f7f9f5] py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/15 px-3 py-1 rounded-full mb-2">
              Step 2 of 2 · Link Merchandise
            </span>
            <h1 className="text-2xl font-black text-[#10182b]">Add Linked Merchandise</h1>
            <p className="text-xs text-[#64748b] mt-1">
              Every campaign on Sayrab must have at least one merchandise item linked to it. 50% of all product sales directly fund your campaign goal.
            </p>
          </div>

          <form onSubmit={handleFinalSubmitWithProduct} className="bg-white rounded-3xl shadow-xl border border-[#e5e9e3] p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Product Name *
              </label>
              <input
                placeholder="Product Name * (e.g. Flood Relief Hoodie)"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  Category *
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
                >
                  <option value="Apparel">Apparel (Shirt/Hoodie/Cap)</option>
                  <option value="Drinkware">Drinkware (Mug/Flask)</option>
                  <option value="Stationery">Stationery (Journal/Notebook)</option>
                  <option value="Accessories">Accessories (Tote bag/Wristband)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                  Retail Price (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Price (PKR) *"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Short Description *
              </label>
              <textarea
                rows={3}
                placeholder="Short Description of the merchandise *"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            {productError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{productError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-[#e5e9e3]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-[#f7f9f5] hover:bg-[#e5e9e3] border border-[#e5e9e3] text-[#10182b] font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={productLoading}
                className="w-2/3 py-3 bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{productLoading ? 'Submitting...' : `Create Campaign & Publish Merch (${Math.max(1, totalCount)})`}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 1: Campaign Details Form
  return (
    <div className="min-h-screen bg-[#f7f9f5] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#367c35] bg-[#89ca2e]/15 px-3 py-1 rounded-full mb-2">
            Step 1 of 2
          </span>
          <h1 className="text-2xl font-black text-[#10182b]">Start a Campaign</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Fill in your campaign details. In Step 2, you will configure your linked merchandise before submission.
          </p>
        </div>

        <form onSubmit={handleNextToMerchandise} className="bg-white rounded-3xl shadow-xl border border-[#e5e9e3] p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Campaign Title *
            </label>
            <input
              name="title"
              placeholder="Campaign Title *"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              >
                <option value="">Select Category *</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Location *
              </label>
              <input
                name="location"
                placeholder="Location (e.g. Lahore, Pakistan) *"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Funding Goal (PKR) *
              </label>
              <input
                name="fundingGoal"
                type="number"
                placeholder="Funding Goal (PKR) *"
                value={form.fundingGoal}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Purpose of Funds *
              </label>
              <input
                name="purposeOfFunds"
                placeholder="e.g. ICU charges, surgery fees *"
                value={form.purposeOfFunds}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
              />
            </div>
          </div>

          {/* Schedule 7-90 days */}
          <div className="p-4 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#10182b] uppercase">
                Campaign Schedule & Duration (7 to 90 Days) *
              </span>
              {(() => {
                const days = calculateDurationDays(form.startDate, form.endDate);
                if (days === null) return null;
                const isValid = days >= 7 && days <= 90;
                return (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {days} Days ({isValid ? 'Valid' : 'Must be 7–90 days'})
                  </span>
                );
              })()}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">
                  Starting Date
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">
                  Finish Date
                </label>
                <input
                  name="endDate"
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#64748b]">Presets:</span>
              {[15, 30, 45, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setQuickDurationDays(d)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-[#e5e9e3] text-[#10182b] hover:border-[#89ca2e] cursor-pointer"
                >
                  +{d} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Short Summary *
            </label>
            <textarea
              name="shortDescription"
              placeholder="Short Description (max 300 chars) *"
              value={form.shortDescription}
              onChange={handleChange}
              required
              maxLength={300}
              rows={2}
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          {/* Campaign Story */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#10182b] uppercase">
              Campaign Story Details *
            </label>
            {['background', 'currentSituation', 'fundingNeed', 'expectedImpact', 'supportingEvidence'].map(
              (key) => (
                <textarea
                  key={key}
                  name={`story.${key}`}
                  placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()) + ' *'}
                  value={form.story[key]}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 bg-[#f7f9f5] border border-[#e5e9e3] text-[#10182b] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#89ca2e]"
                />
              )
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#89ca2e] hover:bg-[#78b327] text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 2 (Link Merchandise)</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
