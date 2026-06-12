import { Link } from 'react-router-dom';
import { Users, Share2, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining, getVerificationLabel } from '../utils/format';

export default function CampaignCard({ campaign }) {
  const percent = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const isVerified = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);

  return (
    <Link
      to={`/campaigns/${campaign.slug}`}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={campaign.thumbnail}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {campaign.isEmergency && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            EMERGENCY
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2">
            {campaign.title}
          </h3>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <p className="text-sm text-slate-600 line-clamp-2">{campaign.shortDescription}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
            {campaign.category}
          </span>
          <span className="text-slate-500">{campaign.organizer?.fullName}</span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-primary-700">
              {formatCurrency(campaign.amountRaised)} raised
            </span>
            <span className="text-slate-500">of {formatCurrency(campaign.fundingGoal)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-0.5">
          <p>Started: {formatDate(campaign.startDate)}</p>
          <p>Deadline: {formatDate(campaign.endDate)}</p>
          <p className="font-medium text-slate-700">{daysLeft} Days Remaining</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Users size={14} /> {campaign.donorCount} donors
          </span>
          <span className="flex items-center gap-1">
            <Share2 size={14} /> {campaign.shareCount} shares
          </span>
          {isVerified && (
            <span className="flex items-center gap-1 text-primary-600">
              <ShieldCheck size={14} />
              {getVerificationLabel(campaign.verificationStatus)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
