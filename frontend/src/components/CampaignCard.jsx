import { Link, useNavigate } from 'react-router-dom';
import { Users, Share2, ShieldCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining, getVerificationLabel } from '../utils/format';

export default function CampaignCard({ campaign }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fundingGoal = campaign.fundingGoal || 1;
  const percent = Math.min(100, Math.round((campaign.amountRaised / fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const isVerified = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);

  const handleClick = (e) => {
    if (!user) {
      // Allow guest to click and navigate to campaign details directly;
      // or redirect if authentication policy requires it.
    }
  };

  return (
    <Link
      to={`/campaigns/${campaign.slug}`}
      onClick={handleClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-[#e5e9e3] hover:border-[#89ca2e] transition-all duration-300 flex flex-col overflow-hidden text-[#172033]"
    >
      {/* Upper Half: Thumbnail, Badges, Title */}
      <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-[#e5e9e3]">
        <img
          src={campaign.thumbnail || '/placeholder-campaign.jpg'}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category & Emergency Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 bg-[#10182b]/85 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm">
            {campaign.category}
          </span>
          {campaign.isEmergency && (
            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
              <AlertTriangle size={11} /> EMERGENCY
            </span>
          )}
        </div>

        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-[#89ca2e] text-[#10182b] text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#10182b]" />
            <span>{getVerificationLabel(campaign.verificationStatus)}</span>
          </div>
        )}

        {/* Title overlay or header bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
          <h3 className="text-white font-extrabold text-sm line-clamp-1 group-hover:text-[#b4df76] transition-colors drop-shadow-sm">
            {campaign.title}
          </h3>
        </div>
      </div>

      {/* Lower Half: Left Description/Organizer, Right Funding Progress */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div className="grid grid-cols-2 gap-3 items-start">
          {/* Left Side: Short Description & Organizer */}
          <div className="space-y-1 pr-1 border-r border-[#e5e9e3]">
            <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
              {campaign.shortDescription || campaign.story?.substring(0, 80) || 'Help support this verified community cause.'}
            </p>
            <p className="text-[11px] font-bold text-[#10182b] truncate">
              By: <span className="text-[#367c35]">{campaign.organizer?.fullName || 'Verified Organizer'}</span>
            </p>
          </div>

          {/* Right Side: Funding Progress */}
          <div className="space-y-1.5 pl-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-[11px] text-[#64748b] font-medium">Raised</span>
              <span className="font-black text-[#367c35] text-xs">
                {percent}%
              </span>
            </div>
            <p className="font-extrabold text-[#10182b] text-xs truncate">
              {formatCurrency(campaign.amountRaised)}
            </p>
            <p className="text-[10px] text-[#64748b] truncate">
              Goal: {formatCurrency(campaign.fundingGoal)}
            </p>
            <div className="w-full bg-[#f7f9f5] rounded-full h-2 overflow-hidden border border-[#e5e9e3]">
              <div
                className="bg-gradient-to-r from-[#89ca2e] to-[#367c35] h-2 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Separated Timeline Area */}
        <div className="pt-2.5 mt-1 border-t border-[#e5e9e3] bg-[#f7f9f5] -mx-4 -mb-4 p-3 rounded-b-2xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span className="flex items-center gap-1 font-medium">
              <Calendar size={12} className="text-[#367c35]" />
              <span>Started: {formatDate(campaign.createdAt || campaign.startDate)}</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-[#10182b]">
              <Clock size={12} className="text-[#367c35]" />
              <span>{daysLeft} Days Left</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1 border-t border-[#e5e9e3]/60">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-[#367c35]" /> {campaign.donorCount || 0} donors
            </span>
            <span className="flex items-center gap-1">
              <Share2 size={12} className="text-[#367c35]" /> {campaign.shareCount || 0} shares
            </span>
            <span className="text-[10px] font-semibold text-[#64748b]">
              Deadline: {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
