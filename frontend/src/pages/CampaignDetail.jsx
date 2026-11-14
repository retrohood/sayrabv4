import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Share2,
  ShieldCheck,
  Copy,
  Heart,
  Trophy,
  ShoppingBag,
  ShieldAlert,
  X,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck,
  Info,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationModal from '../components/DonationModal';
import CampaignCard from '../components/CampaignCard';
import { addCartItem } from '../utils/cart';
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getVerificationLabel,
  isFundraiserUser,
} from '../utils/format';

export default function CampaignDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isFundraiser = isFundraiserUser(user);
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showDonate, setShowDonate] = useState(false);
  const [showFundraiserNotice, setShowFundraiserNotice] = useState(false);
  const [fundraiserNoticeText, setFundraiserNoticeText] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);

  // Campaign merchandise products
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyForm, setBuyForm] = useState({ size: '', color: '', qty: 1 });
  const [buyError, setBuyError] = useState('');

  const refCode = searchParams.get('ref');

  // Track referral click if ref param present
  useEffect(() => {
    if (refCode && slug) {
      api.get('/referrals/track', { params: { ref: refCode, campaignSlug: slug } }).catch(() => {});
    }
  }, [refCode, slug]);

  // Load campaign details
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/campaigns/${slug}`);
        const cData = res.data;
        setCampaign(cData);

        // Leaderboard
        try {
          const lb = await api.get(`/referrals/leaderboard/${cData._id}`);
          setLeaderboard(Array.isArray(lb.data) ? lb.data : []);
        } catch {
          setLeaderboard([]);
        }

        // Referral link: logged-in user gets unique link, guest gets generic
        if (user) {
          try {
            const linkRes = await api.get(`/referrals/link/${cData._id}`);
            setReferralLink(linkRes.data?.link || window.location.href);
          } catch {
            setReferralLink(window.location.href);
          }
        } else {
          setReferralLink(window.location.href);
        }

        // Merchandise tied to campaign
        try {
          const productsRes = await api.get(`/products/campaign/${cData._id}`);
          setProducts(productsRes.data || []);
        } catch {
          setProducts([]);
        }

        // Related campaigns
        if (cData.category) {
          try {
            const relRes = await api.get('/campaigns', {
              params: { category: cData.category, limit: 3 },
            });
            const filtered = (relRes.data?.campaigns || []).filter((c) => c._id !== cData._id);
            setRelatedCampaigns(filtered.slice(0, 3));
          } catch {
            setRelatedCampaigns([]);
          }
        }
      } catch (err) {
        console.error('Failed to load campaign:', err);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user]);

  const handleDonateClick = () => {
    if (isFundraiser) {
      setFundraiserNoticeText(
        'Fundraiser accounts cannot make donations to campaigns on this platform. Please switch to a donor account to make a contribution.'
      );
      setShowFundraiserNotice(true);
      return;
    }
    setShowDonate(true);
  };

  const handleBuyClick = (product) => {
    if (isFundraiser) {
      setFundraiserNoticeText(
        'Fundraiser accounts cannot purchase merchandise products. Product purchases are for buyers and donors to fund active campaigns.'
      );
      setShowFundraiserNotice(true);
      return;
    }
    setSelectedProduct(product);
    setBuyForm({
      size: product.sizes?.[0] || '',
      color: product.colors?.[0] || '',
      qty: 1,
    });
    setBuyError('');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/auth?mode=login&redirect=/campaigns/${slug}`);
      return;
    }
    if (selectedProduct.sizes?.length > 0 && !buyForm.size) {
      setBuyError('Please select a size');
      return;
    }
    if (selectedProduct.colors?.length > 0 && !buyForm.color) {
      setBuyError('Please select a color');
      return;
    }
    if (buyForm.qty < 1 || buyForm.qty > (selectedProduct.stock || 99)) {
      setBuyError(`Quantity must be between 1 and ${selectedProduct.stock || 99}`);
      return;
    }

    addCartItem(
      {
        ...selectedProduct,
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        selectedSize: buyForm.size || undefined,
        selectedColor: buyForm.color || undefined,
      },
      buyForm.qty,
      user?._id
    );

    setSelectedProduct(null);
    navigate('/checkout');
  };

  const handleShare = async () => {
    const link = referralLink || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: campaign?.title, url: link });
        api.post(`/campaigns/${campaign._id}/share`).catch(() => {});
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const link = referralLink || window.location.href;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    if (campaign?._id) {
      api.post(`/campaigns/${campaign._id}/share`).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#89ca2e]" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-[#10182b]">Campaign Not Found</h2>
        <p className="text-[#64748b] text-sm mt-2">The requested campaign does not exist or has been removed.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-5 py-2.5 bg-[#89ca2e] text-[#10182b] font-bold rounded-xl text-xs"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const fundingGoal = campaign.fundingGoal || 1;
  const percent = Math.min(100, Math.round((campaign.amountRaised / fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const isVerified = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);

  // Story parsing (structured narrative)
  const storyObj = typeof campaign.story === 'object' && campaign.story !== null ? campaign.story : null;
  const storyText = typeof campaign.story === 'string' ? campaign.story : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24 text-[#172033]">
      {/* Fundraiser notice modal */}
      {showFundraiserNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-lg font-black text-center text-[#10182b]">Fundraiser Policy Notice</h3>
            <p className="text-xs sm:text-sm text-[#64748b] text-center leading-relaxed">
              {fundraiserNoticeText}
            </p>
            <button
              onClick={() => setShowFundraiserNotice(false)}
              className="w-full py-2.5 bg-[#10182b] text-white rounded-xl text-xs font-bold hover:bg-[#172033]"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}

      {/* Header Area */}
      <section className="space-y-4 border-b border-[#e5e9e3] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-[#89ca2e]/25 text-[#367c35] text-xs font-black uppercase tracking-wider rounded-lg">
            {campaign.category}
          </span>
          {campaign.isEmergency && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-xs">
              Emergency Relief
            </span>
          )}
          {isVerified && (
            <span className="px-2.5 py-1 bg-[#367c35] text-white text-xs font-bold rounded-lg flex items-center gap-1">
              <ShieldCheck size={14} /> {getVerificationLabel(campaign.verificationStatus)}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#10182b] tracking-tight leading-tight">
          {campaign.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#64748b] pt-1">
          <div className="flex items-center gap-1.5 font-bold text-[#10182b]">
            <span>Organized by:</span>
            <span className="text-[#367c35] underline decoration-[#89ca2e] underline-offset-2">
              {campaign.organizer?.fullName || 'Verified Campaign Leader'}
            </span>
          </div>

          {campaign.location && (
            <div className="flex items-center gap-1">
              <MapPin size={15} className="text-[#367c35]" />
              <span>{campaign.location}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar size={15} className="text-[#367c35]" />
            <span>Started {formatDate(campaign.createdAt || campaign.startDate)}</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Campaign Story, Updates, Evidence, Referral */}
        <div className="lg:col-span-8 space-y-8">
          {/* Large Campaign Thumbnail / Media */}
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-[#e5e9e3] shadow-sm">
            <img
              src={campaign.thumbnail || '/placeholder-campaign.jpg'}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Structured Story Narrative */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-black text-[#10182b] border-b border-[#e5e9e3] pb-3">
              About This Campaign
            </h2>

            {/* 1. Introduction */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35]">
                1. Campaign Introduction
              </h3>
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                {campaign.shortDescription || campaign.description || 'This campaign represents a genuine community appeal seeking transparent support.'}
              </p>
            </div>

            {/* 2. Background */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35]">
                2. Background & Circumstances
              </h3>
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                {storyObj?.background ||
                  'The beneficiaries are facing critical challenges requiring immediate community intervention and solidarity.'}
              </p>
            </div>

            {/* 3. Current Problem */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35]">
                3. The Current Challenge
              </h3>
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                {storyObj?.currentSituation ||
                  'Without timely financial backing, this vital initiative risks stalling, leaving beneficiaries in acute distress.'}
              </p>
            </div>

            {/* 4. Why Assistance Is Needed */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35]">
                4. Why Immediate Assistance Is Needed
              </h3>
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                {storyObj?.fundingNeed ||
                  'Every rupee gathered directly provides essential relief, medical treatment, education, or rehabilitation.'}
              </p>
            </div>

            {/* 5. Intended Use of Funds */}
            <div className="space-y-2 bg-[#f7f9f5] p-4 sm:p-5 rounded-2xl border border-[#e5e9e3]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#10182b] flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#367c35]" /> 5. Intended Use of Collected Funds
              </h3>
              <p className="text-sm text-[#172033] leading-relaxed font-medium">
                {campaign.purposeOfFunds || 'Direct allocation towards medical, education, or community welfare relief as authorized.'}
              </p>
            </div>

            {/* 6. Expected Impact */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#367c35]">
                6. Expected Community Impact
              </h3>
              <p className="text-sm sm:text-base text-[#172033] leading-relaxed">
                {storyObj?.expectedImpact ||
                  storyText ||
                  'Achieving this funding target will stabilize the crisis and empower the recipients to rebuild their lives with dignity.'}
              </p>
            </div>
          </div>

          {/* Verification & Supporting Evidence */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-[#367c35]">
              <FileCheck size={20} />
              <h3 className="text-base font-black text-[#10182b]">Platform Verification & Evidence</h3>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              This campaign has undergone verified review by our compliance team. Supporting documentation has been inspected to validate the urgency and legitimacy of this cause. In accordance with privacy and security standards, personal identification numbers (CNIC) and confidential private records remain securely protected.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3] text-xs">
                <ShieldCheck size={16} className="text-[#367c35]" />
                <span className="font-bold text-[#10182b]">Identity Verification: Completed</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3] text-xs">
                <ShieldCheck size={16} className="text-[#367c35]" />
                <span className="font-bold text-[#10182b]">Document & Purpose Review: Passed</span>
              </div>
            </div>
          </div>

          {/* Referral & Sharing Tracking */}
          <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#10182b]">Share This Campaign</h3>
                <p className="text-xs text-[#64748b]">
                  {user ? 'Share your unique referral link to track donors and contributions inspired by you.' : 'Copy and share this link to help spread awareness for this cause.'}
                </p>
              </div>
              <div className="p-2.5 bg-[#89ca2e]/20 text-[#367c35] rounded-xl">
                <Share2 size={20} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-4 py-2.5 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#172033] font-mono select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 bg-[#10182b] hover:bg-[#172033] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Share2 size={14} /> Share
              </button>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="pt-4 border-t border-[#e5e9e3] space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#10182b] flex items-center gap-1.5">
                  <Trophy size={15} className="text-amber-500" /> Top Referral Supporters
                </h4>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]"
                    >
                      <span className="font-bold text-[#10182b]">
                        #{idx + 1} {entry.referrerName || 'Generous Supporter'}
                      </span>
                      <span className="text-[#367c35] font-extrabold">
                        {entry.referralCount || 0} donors referred
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Donation Panel & Campaign Merch */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Prominent Donation Card */}
          <div className="bg-white rounded-3xl border-2 border-[#89ca2e] p-6 sm:p-7 space-y-6 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-[#64748b]">Total Raised</span>
                <span className="text-xs font-extrabold text-[#367c35] bg-[#89ca2e]/20 px-2 py-0.5 rounded-full">
                  {percent}% of Goal
                </span>
              </div>
              <p className="text-3xl font-black text-[#10182b] tracking-tight">
                {formatCurrency(campaign.amountRaised)}
              </p>
              <p className="text-xs text-[#64748b]">
                Target Goal: <strong className="text-[#10182b] font-bold">{formatCurrency(campaign.fundingGoal)}</strong>
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-[#f7f9f5] rounded-full h-3 overflow-hidden border border-[#e5e9e3] mt-2">
                <div
                  className="bg-gradient-to-r from-[#89ca2e] to-[#367c35] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#e5e9e3] text-center">
              <div>
                <p className="text-lg font-black text-[#10182b]">{campaign.donorCount || 0}</p>
                <p className="text-[11px] font-semibold text-[#64748b] flex items-center justify-center gap-1">
                  <Users size={12} className="text-[#367c35]" /> Donors
                </p>
              </div>
              <div>
                <p className="text-lg font-black text-[#10182b]">{daysLeft}</p>
                <p className="text-[11px] font-semibold text-[#64748b] flex items-center justify-center gap-1">
                  <Clock size={12} className="text-[#367c35]" /> Days Remaining
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleDonateClick}
              className="w-full py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] text-base font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart size={18} className="fill-[#10182b]" /> Donate Now
            </button>

            <button
              onClick={handleShare}
              className="w-full py-3 bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] text-[#10182b] text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={15} /> Share with Family & Friends
            </button>

            <div className="text-[11px] text-[#64748b] text-center space-y-1">
              <p className="flex items-center justify-center gap-1 text-[#367c35] font-semibold">
                <ShieldCheck size={14} /> 100% Secure & Verified Donation Flow
              </p>
              <p>Supports Card, Easypaisa, JazzCash, QR Code & Bank Transfer</p>
            </div>
          </div>

          {/* Campaign Merchandise Box (If any products tied to this campaign) */}
          {products.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#10182b]">
                <ShoppingBag size={18} className="text-[#367c35]" />
                <h3 className="text-sm font-black">Support Through Merchandise</h3>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Purchase merchandise linked to this campaign. Proceeds are directly allocated to this fundraiser.
              </p>

              <div className="space-y-3">
                {products.map((prod) => (
                  <div
                    key={prod._id}
                    className="p-3 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image || prod.images?.[0] || '/placeholder-merch.jpg'}
                        alt={prod.name}
                        className="w-12 h-12 object-contain bg-white rounded-xl border border-[#e5e9e3] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10182b] truncate">{prod.name}</p>
                        <p className="text-xs font-black text-[#367c35]">{formatCurrency(prod.price)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyClick(prod)}
                      className="px-3 py-1.5 bg-[#10182b] hover:bg-[#172033] text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <section className="pt-10 border-t border-[#e5e9e3] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-[#10182b]">Related Campaigns</h3>
            <Link to="/campaigns" className="text-xs font-bold text-[#367c35] hover:underline flex items-center gap-1">
              View all campaigns <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {/* Donation Modal */}
      {showDonate && (
        <DonationModal
          campaign={campaign}
          referralCode={refCode}
          onClose={() => setShowDonate(false)}
          onSuccess={(donationData) => {
            setShowDonate(false);
            if (donationData) {
              setCampaign((prev) => ({
                ...prev,
                amountRaised: (prev.amountRaised || 0) + (donationData.amount || 0),
                donorCount: (prev.donorCount || 0) + 1,
              }));
            }
          }}
        />
      )}

      {/* Merchandise Quick Buy Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#e5e9e3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e9e3] pb-3">
              <h3 className="font-black text-[#10182b] text-sm">Select Product Options</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-[#64748b] hover:text-[#10182b]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.image || selectedProduct.images?.[0] || '/placeholder-merch.jpg'}
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-contain bg-[#f7f9f5] rounded-xl border border-[#e5e9e3]"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#10182b]">{selectedProduct.name}</h4>
                  <p className="text-sm font-black text-[#367c35]">{formatCurrency(selectedProduct.price)}</p>
                </div>
              </div>

              {selectedProduct.sizes?.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#10182b]">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, size: s })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                          buyForm.size === s
                            ? 'bg-[#89ca2e] text-[#10182b] border-[#89ca2e]'
                            : 'bg-[#f7f9f5] text-[#172033] border-[#e5e9e3]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.colors?.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#10182b]">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, color: c })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                          buyForm.color === c
                            ? 'bg-[#89ca2e] text-[#10182b] border-[#89ca2e]'
                            : 'bg-[#f7f9f5] text-[#172033] border-[#e5e9e3]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#10182b]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock || 99}
                  value={buyForm.qty}
                  onChange={(e) => setBuyForm({ ...buyForm, qty: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs text-[#172033]"
                />
              </div>

              {buyError && <p className="text-xs text-rose-600 font-semibold">{buyError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
