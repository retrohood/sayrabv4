import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Plus, ArrowRight } from 'lucide-react';
import api from '../api/client';

const DOC_TYPES = {
  'Medical Assistance': ['Medical reports', 'Hospital estimates'],
  'Education / Student Fees': ['Admission letter', 'Fee challan'],
  'Small Business Support': ['Business proposal', 'Cost estimates'],
  'Disaster Relief': ['Evidence/photos', 'Relevant documentation'],
};

export default function CreateCampaign() {
  const [categories, setCategories] = useState([]);
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    shortDescription: '',
    fundingGoal: '',
    purposeOfFunds: '',
    startDate: '',
    endDate: '',
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

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Apparel',
    price: '',
    sizes: [],
    colors: '',
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
    const { name, value } = e.target;
    if (name.startsWith('story.')) {
      const key = name.split('.')[1];
      setForm({ ...form, story: { ...form.story, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/campaigns', {
        ...form,
        fundingGoal: Number(form.fundingGoal),
      });
      setCreatedCampaign(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');
    setProductLoading(true);

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        image: productForm.image || `https://picsum.photos/seed/${productForm.name}/400/400`,
        sizes: productForm.sizes,
        colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        campaignId: createdCampaign._id,
      };

      const res = await api.post('/products', payload);
      setAddedProducts([...addedProducts, res.data]);
      setProductSuccess(`"${productForm.name}" added successfully!`);
      setProductForm({
        name: '',
        description: '',
        category: 'Apparel',
        price: '',
        sizes: [],
        colors: '',
        stock: 100,
        image: '',
      });
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setProductLoading(false);
    }
  };

  const docTypes = DOC_TYPES[form.category] || ['Supporting documentation'];

  if (createdCampaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <CheckCircle className="text-emerald-600 shrink-0" size={32} />
          <div>
            <h2 className="text-xl font-bold text-emerald-800">Campaign Created Successfully!</h2>
            <p className="text-emerald-700 mt-1 text-sm">
              Your campaign <strong>"{createdCampaign.title}"</strong> is now pending verification.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Step 2: Add Merchandise (Optional)</h1>
          <p className="text-slate-600">
            Boost your fundraising by selling t-shirts, hoodies, caps, or mugs. <strong>50% of all product sales</strong> will go directly to this campaign's target!
          </p>
        </div>

        <form onSubmit={handleProductSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-800">Product Details</legend>
            <input
              required
              placeholder="Product Name * (e.g. Save Gaza Hoodie)"
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
              placeholder="Short Description of the merchandise..."
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
            <legend className="text-lg font-semibold text-slate-800">Product Image URL</legend>
            <input
              type="url"
              placeholder="Mock Image URL (optional, e.g. https://picsum.photos/400/400)"
              value={productForm.image}
              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </fieldset>

          {productError && <p className="text-sm text-red-600">{productError}</p>}
          {productSuccess && <p className="text-sm text-emerald-600 font-semibold">{productSuccess}</p>}

          {addedProducts.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShoppingBag size={16} /> Added Products ({addedProducts.length}):
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside">
                {addedProducts.map((p) => (
                  <li key={p._id}>
                    {p.name} — PKR {p.price} ({p.stock} in stock)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={productLoading}
              className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> {productLoading ? 'Adding...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/campaigns/${createdCampaign.slug}`)}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {addedProducts.length > 0 ? 'Finish & View Campaign' : 'Skip & View Campaign'} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Start a Campaign</h1>
      <p className="text-slate-600 mb-8">
        Your campaign will be reviewed before becoming publicly visible. This helps prevent fraud
        and builds donor trust.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
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
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-800">Timeline</legend>
          <p className="text-sm text-slate-500">Recommended duration: 7–90 days</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-800">Campaign Story</legend>
          {['background', 'currentSituation', 'fundingNeed', 'expectedImpact', 'supportingEvidence'].map(
            (key) => (
              <textarea
                key={key}
                name={`story.${key}`}
                placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                value={form.story[key]}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
            <p className="text-xs text-amber-600 mt-2">
              Document upload will be available in the admin verification module.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}
