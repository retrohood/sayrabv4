import { Link, useNavigate } from 'react-router-dom';
import { Users, Share2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining, getVerificationLabel } from '../utils/format';

export default function CampaignCard({ campaign }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const percent = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100));
  const daysLeft = getDaysRemaining(campaign.endDate);
  const isVerified = ['verified', 'emergency_verified'].includes(campaign.verificationStatus);

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate(`/auth?mode=login&redirect=/campaigns/${campaign.slug}`);
    }
  };

  return (
    <Link
      to={user ? `/campaigns/${campaign.slug}` : `/auth?mode=login&redirect=/campaigns/${campaign.slug}`}
      onClick={handleClick}
      className="group bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 overflow-hidden hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
        <img
          src={campaign.thumbnail}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {campaign.isEmergency && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md">
            EMERGENCY
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4">
          <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {campaign.title}
          </h3>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{campaign.shortDescription}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-bold text-[10px]">
            {campaign.category}
          </span>
          <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{campaign.organizer?.fullName}</span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-extrabold text-cyan-400">
              {formatCurrency(campaign.amountRaised)}
            </span>
            <span className="text-slate-400 font-medium">Goal: {formatCurrency(campaign.fundingGoal)}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-0.5">
          <p>Deadline: {formatDate(campaign.endDate)}</p>
          <p className="font-bold text-slate-300">{daysLeft} Days Remaining</p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-auto pt-3 border-t border-slate-800/80">
          <span className="flex items-center gap-1 font-medium">
            <Users size={13} className="text-cyan-400" /> {campaign.donorCount} donors
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Share2 size={13} className="text-cyan-400" /> {campaign.shareCount} shares
          </span>
          {isVerified && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              {getVerificationLabel(campaign.verificationStatus)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
