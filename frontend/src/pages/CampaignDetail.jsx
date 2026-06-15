import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Share2,
  ShieldCheck,
  Copy,
  Heart,
  Trophy,
  ShoppingBag,
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
} from '../utils/format';

export default function CampaignDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showDonate, setShowDonate] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyForm, setBuyForm] = useState({ size: '', color: '', qty: 1 });
  const [buyError, setBuyError] = useState('');

  const refCode = searchParams.get('ref');

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

  const handleBuyClick = (product) => {
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

    addCartItem({
      ...selectedProduct,
      selectedSize: buyForm.size || undefined,
      selectedColor: buyForm.color || undefined,
    }, buyForm.qty);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Campaign not found</h2>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const story = campaign.story || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <img
          src={campaign.thumbnail}
          alt={campaign.title}
          className="w-full h-64 sm:h-96 object-cover"
        />

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full mb-2">
                {campaign.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{campaign.title}</h1>
              <p className="text-slate-600 mt-2">
                Organized by <strong>{campaign.organizer?.fullName}</strong>
                {campaign.organizer?.isVerifiedFundraiser && (
                  <span className="ml-2 text-primary-600 text-sm">✓ Verified Fundraiser</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg">
              <ShieldCheck className="text-primary-600" size={20} />
              <span className="text-sm font-medium text-primary-700">
                {getVerificationLabel(campaign.verificationStatus)}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm text-slate-500">Raised</p>
              <p className="text-xl font-bold text-primary-700">
                {formatCurrency(campaign.amountRaised)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Goal</p>
              <p className="text-xl font-bold">{formatCurrency(campaign.fundingGoal)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Donors</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <Users size={20} /> {campaign.donorCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Time Left</p>
              <p className="text-xl font-bold">{daysLeft} days</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{percent}% funded</span>
              <span>{formatCurrency(campaign.amountRaised)} of {formatCurrency(campaign.fundingGoal)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => setShowDonate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Heart size={20} /> Donate Now
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Share2 size={20} /> Share Campaign
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Copy size={20} /> {copied ? 'Copied!' : 'Copy Referral Link'}
            </button>
          </div>

          {!user && (
            <p className="text-sm text-slate-500 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              Log in to get a unique referral link and track your impact on the leaderboard.
            </p>
          )}

          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Campaign Story</h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              {story.background && (
                <div>
                  <h3 className="font-semibold text-slate-800">Background</h3>
                  <p>{story.background}</p>
                </div>
              )}
              {story.currentSituation && (
                <div>
                  <h3 className="font-semibold text-slate-800">Current Situation</h3>
                  <p>{story.currentSituation}</p>
                </div>
              )}
              {story.fundingNeed && (
                <div>
                  <h3 className="font-semibold text-slate-800">Funding Need</h3>
                  <p>{story.fundingNeed}</p>
                </div>
              )}
              {story.expectedImpact && (
                <div>
                  <h3 className="font-semibold text-slate-800">Expected Impact</h3>
                  <p>{story.expectedImpact}</p>
                </div>
              )}
              {story.supportingEvidence && (
                <div>
                  <h3 className="font-semibold text-slate-800">Supporting Evidence</h3>
                  <p>{story.supportingEvidence}</p>
                </div>
              )}
            </div>
          </section>

          {products.length > 0 && (
            <section className="mb-10 border-t border-slate-100 pt-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Campaign Merchandise</h2>
              <p className="text-sm text-slate-600 mb-6">
                Support this campaign by purchasing official merchandise. 50% of the proceeds will go directly to the campaign goal!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => {
                  const contribution = product.price * 0.5;
                  return (
                    <div key={product._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <img
                        src={product.image || product.images?.[0] || 'https://picsum.photos/seed/placeholder/300/300'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{product.category}</span>
                          <h3 className="font-bold text-slate-800 mt-1 line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-xl font-extrabold text-slate-900">{formatCurrency(product.price)}</span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              {formatCurrency(contribution)} raised
                            </span>
                          </div>
                          <button
                            onClick={() => handleBuyClick(product)}
                            className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm cursor-pointer"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {leaderboard.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Trophy className="text-accent-500" size={24} /> Referral Leaderboard
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-2 pr-4">Rank</th>
                      <th className="py-2 pr-4">Promoter</th>
                      <th className="py-2 pr-4">Donors Referred</th>
                      <th className="py-2">Amount Raised</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-bold">#{entry.rank}</td>
                        <td className="py-3 pr-4">{entry.name}</td>
                        <td className="py-3 pr-4">{entry.donationCount}</td>
                        <td className="py-3">{formatCurrency(entry.amountRaised)}</td>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{selectedProduct.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{formatCurrency(selectedProduct.price)} · 50% split contribution</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {selectedProduct.sizes?.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Select Size *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, size: s })}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                          buyForm.size === s
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Select Color *</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBuyForm({ ...buyForm, color: c })}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                          buyForm.color === c
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Quantity *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={buyForm.qty <= 1}
                    onClick={() => setBuyForm({ ...buyForm, qty: buyForm.qty - 1 })}
                    className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer animate-scale-in"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-slate-800">{buyForm.qty}</span>
                  <button
                    type="button"
                    disabled={buyForm.qty >= selectedProduct.stock}
                    onClick={() => setBuyForm({ ...buyForm, qty: buyForm.qty + 1 })}
                    className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer animate-scale-in"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 font-medium">({selectedProduct.stock} available)</span>
                </div>
              </div>

              {buyError && <p className="text-xs text-red-600 font-semibold">{buyError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Buy & Checkout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
