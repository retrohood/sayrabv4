import { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Calendar,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Coins,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../../api/client';

const CATEGORIES = [
  { id: 'Medical', label: 'Medical & Healthcare', requiredDoc: 'Hospital estimate, prescription or diagnostic report' },
  { id: 'Education', label: 'Education & Tuition', requiredDoc: 'School/University fee voucher or student ID' },
  { id: 'Emergency', label: 'Emergency Relief & Disaster', requiredDoc: 'Local authority verification or crisis report' },
  { id: 'Orphan Care', label: 'Orphan & Family Support', requiredDoc: 'Guardian CNIC and family registration cert' },
  { id: 'Water & Sanitation', label: 'Clean Water & Sanitation', requiredDoc: 'Project cost breakdown & site plan' },
  { id: 'Community', label: 'Community Development', requiredDoc: 'Community board letter & project proposal' },
];

export default function FundraiserFundraisingView({ setActiveTab, onCampaignCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Medical',
    location: 'Lahore, Pakistan',
    fundingGoal: 100000,
    durationDays: 30,
    shortDescription: '',
    story: '',
    purposeOfFunds: '',
    thumbnail: '',
    isEmergency: false,
    supportingDocuments: [],
  });

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // AI Story Assistant
  const handleGenerateAIStory = () => {
    if (!formData.title) {
      setError('Please enter a campaign title first to help our AI generate a story.');
      return;
    }
    setError('');
    setAiGenerating(true);

    setTimeout(() => {
      const generatedPitch = `Dear Supporters and Kind Donors,

We are urgently reaching out for our campaign "${formData.title}". 

In our community, every single contribution creates an immediate, life-changing ripple effect. The funds gathered through this transparent Sayrab platform will be disbursed directly towards ${formData.purposeOfFunds || 'essential project costs and direct relief'}.

Our verified target goal is PKR ${Number(formData.fundingGoal).toLocaleString()}, which covers all mandatory logistical and verified beneficiary needs without delay. We pledge complete transparency with progress updates, receipts, and photos posted regularly right here on Sayrab.

Please join hands with us, donate whatever is in your capacity, and share this campaign with your friends and family. Together, we can make an undeniable difference.`;

      const generatedSummary = `Urgent fundraising initiative to support ${formData.title}. 100% verified beneficiary relief with transparent milestone tracking.`;

      setFormData((prev) => ({
        ...prev,
        story: generatedPitch,
        shortDescription: prev.shortDescription || generatedSummary,
      }));
      setAiGenerating(false);
    }, 800);
  };

  // Image Upload handler
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, thumbnail: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  // Document Upload handler
  const handleDocFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      supportingDocuments: [
        ...prev.supportingDocuments,
        { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const days = parseInt(formData.durationDays, 10);
    if (isNaN(days) || days < 7 || days > 90) {
      setError('Campaign duration must be between 7 and 90 days. Please adjust your timeline.');
      return;
    }

    if (!formData.story || formData.story.length < 50) {
      setError('Please write a detailed story of at least 50 characters explaining why this cause needs support.');
      return;
    }

    setLoading(true);

    try {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

      const payload = {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        fundingGoal: Number(formData.fundingGoal),
        targetAmount: Number(formData.fundingGoal),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        shortDescription: formData.shortDescription || formData.title,
        story: formData.story,
        purposeOfFunds: formData.purposeOfFunds || 'Direct beneficiary aid',
        thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        image: formData.thumbnail || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        isEmergency: formData.isEmergency,
        supportingDocuments: formData.supportingDocuments,
      };

      await api.post('/campaigns', payload);
      setSuccess('Campaign created successfully and submitted for verification!');

      setTimeout(() => {
        if (onCampaignCreated) onCampaignCreated();
        setActiveTab('campaigns');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === formData.category) || CATEGORIES[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Guidelines */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e9e3] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#89ca2e]/20 text-[#367c35] flex items-center justify-center">
            <Megaphone size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#10182b]">Launch a New Campaign</h2>
            <p className="text-xs text-[#64748b]">
              7–90 day timeline verification, goal setting, and required category documentation
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Campaign Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Campaign Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider flex items-center gap-2">
            <span>1. Campaign Overview</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Life-Saving Heart Surgery for 6-Year-Old Ayan"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Lahore, Punjab"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Fundraising Goal (PKR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="fundingGoal"
                  min="5000"
                  step="1000"
                  value={formData.fundingGoal}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <Coins size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
              <p className="text-[10px] text-[#64748b] mt-1">
                100% of ordinary campaign donations go directly to verified campaign funds.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
                Duration in Days (7 to 90 Days) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="durationDays"
                  min="7"
                  max="90"
                  value={formData.durationDays}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e] pl-9"
                />
                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              </div>
              <p className="text-[10px] text-[#367c35] font-semibold mt-1">
                Enforced timeline rule: Minimum 7 days, maximum 90 days.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Story & AI Pitch Generator */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
              2. Campaign Story & Pitch
            </h3>
            <button
              type="button"
              onClick={handleGenerateAIStory}
              disabled={aiGenerating}
              className="px-3 py-1.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35] hover:bg-[#89ca2e]/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={13} />
              <span>{aiGenerating ? 'Generating...' : 'Generate with AI'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Short Description / Headline *
            </label>
            <input
              type="text"
              name="shortDescription"
              placeholder="Brief summary displayed on social shares and campaign cards"
              value={formData.shortDescription}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Detailed Story *
            </label>
            <textarea
              name="story"
              rows={6}
              placeholder="Describe the background, why this help is urgent, and how the funds will be deployed..."
              value={formData.story}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Purpose of Funds
            </label>
            <input
              type="text"
              name="purposeOfFunds"
              placeholder="e.g. Surgical fees, post-op medication, hospital bed charges"
              value={formData.purposeOfFunds}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none focus:ring-2 focus:ring-[#89ca2e]"
            />
          </div>
        </div>

        {/* Section 3: Media & Category Verification Documents */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5e9e3] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#10182b] uppercase tracking-wider">
            3. Verification Documents & Cover Photo
          </h3>

          {/* Category Guideline Notice */}
          <div className="p-4 bg-[#89ca2e]/10 border border-[#89ca2e]/30 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#367c35] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#367c35]">
                Verification Requirement for {formData.category}
              </h4>
              <p className="text-[11px] text-[#10182b] mt-0.5">
                {selectedCategoryObj.requiredDoc}. Please attach official documentation to expedite approval.
              </p>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Campaign Cover Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="text-xs text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#89ca2e] file:text-white hover:file:bg-[#78b327] cursor-pointer"
              />
              <span className="text-xs text-[#64748b]">or paste image URL:</span>
              <input
                type="url"
                name="thumbnail"
                placeholder="https://example.com/photo.jpg"
                value={formData.thumbnail}
                onChange={handleChange}
                className="flex-1 px-3 py-1.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#10182b] outline-none"
              />
            </div>
            {formData.thumbnail && (
              <div className="mt-3 w-40 h-24 rounded-xl overflow-hidden border border-[#e5e9e3]">
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-xs font-bold text-[#10182b] uppercase mb-1">
              Supporting Verification Documents (Bills, CNIC, Invoices)
            </label>
            <input
              type="file"
              onChange={handleDocFile}
              className="text-xs text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#f7f9f5] file:text-[#10182b] file:border file:border-[#e5e9e3] hover:file:bg-[#e5e9e3] cursor-pointer"
            />
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.supportingDocuments.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-[#367c35] font-semibold bg-[#89ca2e]/10 px-3 py-1.5 rounded-lg border border-[#89ca2e]/20"
                  >
                    <FileText size={14} />
                    <span>{doc.name} ({doc.size})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className="px-6 py-3 rounded-xl border border-[#e5e9e3] text-[#64748b] hover:text-[#10182b] text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#89ca2e] hover:bg-[#78b327] text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span>{loading ? 'Submitting...' : 'Submit Campaign for Verification'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
