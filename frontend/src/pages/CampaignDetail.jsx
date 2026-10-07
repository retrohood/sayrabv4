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
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationModal from '../components/DonationModal';
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

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyForm, setBuyForm] = useState({ size: '', color: '', qty: 1 });
  const [buyError, setBuyError] = useState('');

  const refCode = searchParams.get('ref');

  useEffect(() => {
    if (!user) {
      navigate(`/auth?mode=login&redirect=/campaigns/${slug}`);
    }
  }, [user, slug, navigate]);

  useEffect(() => {
    if (refCode && slug) {
      api.get('/referrals/track', { params: { ref: refCode, campaignSlug: slug } });
    }
  }, [refCode, slug]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/campaigns/${slug}`);
        setCampaign(res.data);
        const lb = await api.get(`/referrals/leaderboard/${res.data._id}`);
        setLeaderboard(lb.data);
        const linkRes = await api.get(`/referrals/link/${res.data._id}`);
        setReferralLink(linkRes.data.link);

        try {
          const productsRes = await api.get(`/products/campaign/${res.data._id}`);
          setProducts(productsRes.data || []);
        } catch (err) {
          console.error("Failed to load campaign merchandise:", err);
          setProducts([]);
        }
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleDonateClick = () => {
    if (isFundraiser) {
      setFundraiserNoticeText(
        'Fundraiser accounts are not allowed to make donations to campaigns on this platform. Please switch to or use a donor account to make a contribution.'
      );
      setShowFundraiserNotice(true);
      return;
    }
    setShowDonate(true);
  };

  const handleBuyClick = (product) => {
    if (!user) {
      navigate(`/auth?mode=login&redirect=/campaigns/${slug}`);
      return;
    }
    if (isFundraiser) {
      setFundraiserNoticeText(
        'Fundraiser accounts cannot purchase merchandise products. Merchandise purchases are for buyers and donors to support charitable goals.'
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
    if (buyForm.qty < 1 || buyForm.qty > selectedProduct.stock) {
      setBuyError(`Quantity must be between 1 and ${selectedProduct.stock}`);
      return;
    }

    const linkedCampaignId =
      (selectedProduct.campaignId?._id || selectedProduct.campaignId) ||
      (selectedProduct.campaign?._id || selectedProduct.campaign) ||
      campaign?._id;

    addCartItem(
      {
        ...selectedProduct,
        campaignId: linkedCampaignId,
        campaignTitle: campaign?.title || selectedProduct.campaignTitle || 'Campaign Merchandise',
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
    if (navigator.share) {
      await navigator.share({ title: campaign.title, url: referralLink });
    } else {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    api.post(`/campaigns/${campaign._id}/share`);
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
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mb-3" />
        <p className="text-slate-400 font-medium text-xs">Redirecting to login / sign up...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 max-w-lg mx-auto my-12 p-8">
        <h2 className="text-2xl font-black text-white">Campaign Not Found</h2>
        <p className="text-slate-400 text-xs mt-2">The requested campaign could not be located or has ended.</p>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const story = campaign.story || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="relative aspect-[21/9] sm:h-96 w-full bg-slate-950 overflow-hidden">
          <img
            src={campaign.thumbnail}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {campaign.isEmergency && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md">
              EMERGENCY RELIEF
            </span>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold rounded-full mb-2">
                {campaign.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{campaign.title}</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Organized by <strong className="text-white">{campaign.organizer?.fullName}</strong>
                {campaign.organizer?.isVerifiedFundraiser && (
                  <span className="ml-2 text-emerald-400 text-xs font-bold">✓ Verified Fundraiser</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl">
              <ShieldCheck className="text-cyan-400" size={18} />
              <span className="text-xs font-bold text-slate-200">
                {getVerificationLabel(campaign.verificationStatus)}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Raised</p>
              <p className="text-xl font-black text-cyan-400 mt-0.5">
                {formatCurrency(campaign.amountRaised)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Target Goal</p>
              <p className="text-xl font-black text-white mt-0.5">{formatCurrency(campaign.fundingGoal)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Donors</p>
              <p className="text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
                <Users size={18} className="text-cyan-400" /> {campaign.donorCount}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Time Remaining</p>
              <p className="text-xl font-black text-white mt-0.5">{daysLeft} days</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-400 font-bold">{percent}% funded</span>
              <span className="text-slate-400">{formatCurrency(campaign.amountRaised)} of {formatCurrency(campaign.fundingGoal)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Active Campaign Period: {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleDonateClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Heart size={16} /> Donate Directly Now
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Share2 size={16} /> Share Campaign
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Copy size={16} /> {copied ? 'Copied!' : 'Copy Referral Link'}
            </button>
          </div>

          <section className="border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-black text-white uppercase tracking-wider text-cyan-400 mb-4">
              Campaign Story & Impact
            </h2>
            <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {story.background && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                  <h3 className="font-bold text-white mb-1">Background</h3>
                  <p>{story.background}</p>
                </div>
              )}
              {story.currentSituation && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                  <h3 className="font-bold text-white mb-1">Current Situation</h3>
                  <p>{story.currentSituation}</p>
                </div>
              )}
              {story.fundingNeed && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                  <h3 className="font-bold text-white mb-1">Funding Need & Allocation</h3>
                  <p>{story.fundingNeed}</p>
                </div>
              )}
              {story.expectedImpact && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                  <h3 className="font-bold text-white mb-1">Expected Community Impact</h3>
                  <p>{story.expectedImpact}</p>
                </div>
              )}
              {story.supportingEvidence && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                  <h3 className="font-bold text-white mb-1">Supporting Evidence & Verifications</h3>
                  <p>{story.supportingEvidence}</p>
                </div>
              )}
            </div>
          </section>

          {products.length > 0 && (
            <section className="border-t border-slate-800/80 pt-6 space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">Campaign Merchandise</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Support this campaign by purchasing official merchandise. 50% of the proceeds directly fund this campaign goal!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((product) => {
                  const contribution = product.price * 0.5;
                  return (
                    <div
                      key={product._id}
                      className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl"
                    >
                      <div>
                        <img
                          src={product.image || product.images?.[0] || 'https://picsum.photos/seed/placeholder/300/300'}
                          alt={product.name}
                          className="w-full h-48 object-cover bg-slate-900"
                        />
                        <div className="p-4">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                            {product.category}
                          </span>
                          <h3 className="font-bold text-white text-sm line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80 mb-3">
                          <span className="text-lg font-black text-white">{formatCurrency(product.price)}</span>
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                            +{formatCurrency(contribution)} to cause
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyClick(product)}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                        >
                          Buy Merchandise
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {leaderboard.length > 0 && (
            <section className="border-t border-slate-800/80 pt-6 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} /> Referral Leaderboard
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400 font-bold uppercase">
                      <th className="py-2.5 pr-4">Rank</th>
                      <th className="py-2.5 pr-4">Promoter</th>
                      <th className="py-2.5 pr-4">Donors Referred</th>
                      <th className="py-2.5 text-right">Amount Raised</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4 font-mono font-bold text-cyan-400">#{entry.rank}</td>
                        <td className="py-3 pr-4 font-semibold text-white">{entry.name}</td>
                        <td className="py-3 pr-4">{entry.donationCount} supporters</td>
                        <td className="py-3 text-right font-bold text-cyan-400">{formatCurrency(entry.amountRaised)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {showDonate && (
        <DonationModal
          campaign={campaign}
          referralCode={refCode}
          onClose={() => setShowDonate(false)}
          onSuccess={() => {
            api.get(`/campaigns/${slug}`).then((res) => setCampaign(res.data));
          }}
        />
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 relative animate-scale-up space-y-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <div>
              <h3 className="text-lg font-black text-white">{selectedProduct.name}</h3>
              <p className="text-xs text-cyan-400 mt-0.5">{formatCurrency(selectedProduct.price)} · 50% split contribution</p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {selectedProduct.sizes?.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Select Size *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, size: s })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          buyForm.size === s
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/25'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.colors?.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Select Color *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, color: c })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          buyForm.color === c
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/25'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Quantity *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={buyForm.qty <= 1}
                    onClick={() => setBuyForm({ ...buyForm, qty: buyForm.qty - 1 })}
                    className="w-10 h-10 border border-slate-700 bg-slate-800 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-white text-sm">{buyForm.qty}</span>
                  <button
                    type="button"
                    disabled={buyForm.qty >= selectedProduct.stock}
                    onClick={() => setBuyForm({ ...buyForm, qty: buyForm.qty + 1 })}
                    className="w-10 h-10 border border-slate-700 bg-slate-800 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400 font-medium">({selectedProduct.stock} in stock)</span>
                </div>
              </div>

              {buyError && <p className="text-xs text-red-400 font-semibold">{buyError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Add to Cart & Checkout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fundraiser Role Policy Notice Modal */}
      {showFundraiserNotice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert className="text-amber-400" size={22} />
                <h3 className="text-base font-extrabold text-white">Action Restricted for Fundraisers</h3>
              </div>
              <button
                onClick={() => setShowFundraiserNotice(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {fundraiserNoticeText}
              </p>
              <p className="text-[11px] text-slate-500">
                Fundraiser accounts are strictly designated for campaign creation, merchandise launching, and payout tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/dashboard"
                onClick={() => setShowFundraiserNotice(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                Go to Fundraiser Portal <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setShowFundraiserNotice(false)}
                className="py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
