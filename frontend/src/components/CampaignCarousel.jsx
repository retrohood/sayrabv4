import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { Sparkles } from 'lucide-react';

export default function CampaignCarousel({ campaigns }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!campaigns?.length) return null;

  const doubled = [...campaigns, ...campaigns];

  return (
    <section className="bg-slate-900 border-y border-slate-800 py-6 overflow-hidden relative">
      <div className="flex items-center justify-center gap-2 mb-4 px-4">
        <Sparkles size={16} className="text-cyan-400" />
        <h2 className="text-white text-center text-sm font-extrabold tracking-wider uppercase">
          Featured Community Campaigns
        </h2>
      </div>
      <div className="relative">
        <div className="flex animate-scroll w-max gap-4 px-4">
          {doubled.map((campaign, i) => (
            <Link
              key={`${campaign._id}-${i}`}
              to={user ? `/campaigns/${campaign.slug}` : `/auth?mode=login&redirect=/campaigns/${campaign.slug}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  navigate(`/auth?mode=login&redirect=/campaigns/${campaign.slug}`);
                }
              }}
              className="flex-shrink-0 w-80 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-cyan-500/10 transition-all group"
            >
              <div className="flex">
                <img
                  src={campaign.thumbnail}
                  alt={campaign.title}
                  className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-xs line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-cyan-400 font-black text-xs mt-1">
                    {formatCurrency(campaign.amountRaised)} <span className="text-slate-500 font-normal">raised</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">{campaign.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
