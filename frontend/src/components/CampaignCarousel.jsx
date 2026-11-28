import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function CampaignCarousel({ campaigns }) {
  const containerRef = useRef(null);

  if (!campaigns?.length) return null;

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const doubled = [...campaigns, ...campaigns];

  return (
    <section className="bg-white border-y border-[#e5e9e3] py-8 overflow-hidden relative shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-[#89ca2e]/20 text-[#367c35]">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-[#10182b] text-sm sm:text-base font-black tracking-wider uppercase">
              Featured Community Campaigns
            </h2>
            <p className="text-xs text-[#64748b]">Selected verified fundraising appeals with high community impact</p>
          </div>
        </div>

        {/* Manual Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="p-2 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] hover:bg-[#89ca2e] hover:text-[#10182b] text-[#172033] transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="p-2 rounded-xl border border-[#e5e9e3] bg-[#f7f9f5] hover:bg-[#89ca2e] hover:text-[#10182b] text-[#172033] transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-none py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex animate-scroll w-max gap-5 px-4 sm:px-6">
          {doubled.map((campaign, i) => {
            const goal = campaign.fundingGoal || campaign.goalAmount || 1;
            const raised = campaign.amountRaised || campaign.raisedAmount || 0;
            const pct = Math.min(100, Math.round((raised / goal) * 100));
            const thumbnail =
              campaign.thumbnail ||
              campaign.image ||
              'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=500&q=80';

            return (
              <Link
                key={`${campaign._id}-${i}`}
                to={`/campaigns/${campaign.slug || campaign._id}`}
                className="flex-shrink-0 w-88 sm:w-96 bg-white border border-[#e5e9e3] hover:border-[#89ca2e] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="flex items-center p-3.5 gap-3.5 border-b border-[#e5e9e3]/60 bg-[#f7f9f5]/50">
                  <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-[#e5e9e3]">
                    <img
                      src={thumbnail}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#89ca2e]/20 text-[#367c35] text-[10px] font-extrabold uppercase tracking-wide">
                      {campaign.category || 'Community'}
                    </span>
                    <h3 className="text-[#10182b] font-black text-xs sm:text-sm line-clamp-2 group-hover:text-[#367c35] transition-colors mt-1">
                      {campaign.title}
                    </h3>
                    <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                      By {campaign.organizer?.fullName || campaign.organization?.name || 'Verified Fundraiser'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#10182b]">{formatCurrency(raised)}</span>
                    <span className="text-[11px] font-bold text-[#367c35]">{pct}% Funded</span>
                  </div>
                  <div className="w-full bg-[#f7f9f5] rounded-full h-2 overflow-hidden border border-[#e5e9e3]">
                    <div
                      className="bg-gradient-to-r from-[#89ca2e] to-[#367c35] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>Goal: {formatCurrency(goal)}</span>
                    <span className="text-[#367c35] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View Campaign <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
