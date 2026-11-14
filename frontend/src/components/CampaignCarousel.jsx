import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function CampaignCarousel({ campaigns }) {
  const containerRef = useRef(null);

  if (!campaigns?.length) return null;

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const doubled = [...campaigns, ...campaigns];

  return (
    <section className="bg-white border-y border-[#e5e9e3] py-6 overflow-hidden relative shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#89ca2e]/20 text-[#367c35]">
            <Sparkles size={16} />
          </div>
          <h2 className="text-[#10182b] text-xs sm:text-sm font-black tracking-wider uppercase">
            Featured Community Campaigns
          </h2>
        </div>

        {/* Manual Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="p-1.5 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] hover:bg-[#89ca2e] hover:text-[#10182b] text-[#172033] transition-colors cursor-pointer shadow-xs"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="p-1.5 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] hover:bg-[#89ca2e] hover:text-[#10182b] text-[#172033] transition-colors cursor-pointer shadow-xs"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-none py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex animate-scroll w-max gap-4 px-4 sm:px-6">
          {doubled.map((campaign, i) => (
            <Link
              key={`${campaign._id}-${i}`}
              to={`/campaigns/${campaign.slug}`}
              className="flex-shrink-0 w-80 bg-white border border-[#e5e9e3] hover:border-[#89ca2e] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex items-center"
            >
              <div className="w-24 h-24 shrink-0 bg-slate-100 overflow-hidden">
                <img
                  src={campaign.thumbnail || '/placeholder-campaign.jpg'}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#367c35] uppercase tracking-wide">
                  {campaign.category}
                </span>
                <h3 className="text-[#10182b] font-bold text-xs line-clamp-2 group-hover:text-[#367c35] transition-colors mt-0.5">
                  {campaign.title}
                </h3>
                <p className="text-[#10182b] font-black text-xs mt-1.5 flex items-baseline gap-1">
                  {formatCurrency(campaign.amountRaised)}
                  <span className="text-[#64748b] text-[10px] font-normal">raised</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
