import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Users,
  Share2,
  ShieldCheck,
  Copy,
  Heart,
  Trophy,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import DonationModal from '../components/DonationModal';
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
  const [campaign, setCampaign] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showDonate, setShowDonate] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } catch {
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

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
    </div>
  );
}
