import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

export default function CampaignCarousel({ campaigns }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!campaigns?.length) return null;

  const doubled = [...campaigns, ...campaigns];

  return (
    <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-6 overflow-hidden">
      <h2 className="text-white text-center text-lg font-semibold mb-4 px-4">
        Featured Campaigns
      </h2>
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
              className="flex-shrink-0 w-72 bg-white/10 backdrop-blur rounded-xl overflow-hidden hover:bg-white/20 transition-colors"
            >
              <div className="flex">
                <img
                  src={campaign.thumbnail}
                  alt={campaign.title}
                  className="w-24 h-24 object-cover"
                />
                <div className="p-3 flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm line-clamp-2">{campaign.title}</h3>
                  <p className="text-primary-200 text-xs mt-1">
                    {formatCurrency(campaign.amountRaised)} raised
                  </p>
                  <span className="text-xs text-white/70">{campaign.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
