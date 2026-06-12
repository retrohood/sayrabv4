import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const DOC_TYPES = {
  'Medical Assistance': ['Medical reports', 'Hospital estimates'],
  'Education / Student Fees': ['Admission letter', 'Fee challan'],
  'Small Business Support': ['Business proposal', 'Cost estimates'],
  'Disaster Relief': ['Evidence/photos', 'Relevant documentation'],
};

export default function CreateCampaign() {
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    api.get('/constants').then((res) => setCategories(res.data.campaignCategories));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/campaigns', {
        ...form,
        fundingGoal: Number(form.fundingGoal),
      });
      navigate(`/campaigns/${res.data.slug}`, {
        state: { message: 'Campaign submitted! It will be visible after verification.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const docTypes = DOC_TYPES[form.category] || ['Supporting documentation'];

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
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
          className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}
