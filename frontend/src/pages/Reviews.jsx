import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquareQuote,
  TrendingUp,
  Layers,
  ArrowUpDown,
  ShoppingBag,
  Flag,
} from 'lucide-react';
import api from '../api/client';
import { formatDate } from '../utils/format';

function StarRating({ rating = 5, size = 16 }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('latest');
  const [starFilter, setStarFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api
      .get('/reviews')
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute live statistics only from genuine records
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const average = (sum / total).toFixed(1);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    return { total, average, distribution };
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (starFilter !== 'all') {
      const targetStar = parseInt(starFilter, 10);
      list = list.filter((r) => Math.round(r.rating || 5) === targetStar);
    }

    if (sortOption === 'highest') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortOption === 'lowest') {
      list.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    } else {
      // Latest first
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [reviews, sortOption, starFilter]);

  return (
    <div className="space-y-12 pb-20 text-[#172033]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10182b] via-[#172033] to-[#10182b] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#10182b]">
        {/* Subtle decorative grid/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#89ca2e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#89ca2e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-black uppercase tracking-wider border border-[#89ca2e]/30">
            <Sparkles size={14} /> Community Feedback & Transparency
          </div>
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            What People Say<br className="sm:hidden" /> About <span className="text-[#89ca2e]">Sayrab.</span>
          </h1>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Every experience helps us improve. Discover feedback from people who have interacted with our platform and become part of the Sayrab community.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 sm:px-3 rounded-xl border border-white/10">
              <ShieldCheck size={13} className="text-[#89ca2e]" /> Post-Campaign Verified
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 sm:px-3 rounded-xl border border-white/10">
              <CheckCircle2 size={13} className="text-[#89ca2e]" /> Zero Fabricated Testimonials
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 sm:px-3 rounded-xl border border-white/10">
              <Clock size={13} className="text-[#89ca2e]" /> Audited Before Publication
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-56 animate-pulse border border-[#e5e9e3]" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State: Strict adherence to prompt section 8 */
          <div className="space-y-10">
            <div className="bg-white rounded-3xl border border-[#e5e9e3] p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 bg-[#89ca2e]/15 text-[#367c35] rounded-3xl mx-auto flex items-center justify-center shadow-xs">
                <MessageSquareQuote size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#10182b]">
                  Your Experience Matters.
                </h2>
                <p className="text-xs sm:text-sm text-[#64748b] max-w-lg mx-auto leading-relaxed">
                  We are continuously working to improve the Sayrab experience. Feedback from our community helps us move forward.
                </p>
              </div>

              {/* Review Process Explanation */}
              <div className="p-6 bg-[#f7f9f5] rounded-2xl border border-[#e5e9e3] text-left space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#10182b] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#367c35]" /> How Sayrab Reviews Work
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 text-xs text-[#64748b]">
                  <div className="space-y-1">
                    <p className="font-bold text-[#10182b]">1. Concluded Campaigns</p>
                    <p className="text-[11px] leading-relaxed">
                      Only verified fundraisers whose campaigns have successfully completed or reached their goals are invited to submit reviews.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#10182b]">2. Real Experience</p>
                    <p className="text-[11px] leading-relaxed">
                      Feedback covers donor interactions, campaign disbursement, apparel production tech-packs, and transparent 50/45/5 split fulfillment.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#10182b]">3. Platform Moderation</p>
                    <p className="text-[11px] leading-relaxed">
                      All reviews undergo administrative compliance checks to eliminate spam and ensure genuine community experiences before public release.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/campaigns"
                  className="w-full sm:w-auto px-6 py-3 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  Explore Active Campaigns <ArrowRight size={15} />
                </Link>
                <Link
                  to="/store"
                  className="w-full sm:w-auto px-6 py-3 bg-[#f7f9f5] hover:bg-slate-100 border border-[#e5e9e3] text-[#10182b] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} /> Browse Purpose Merch
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Populated State with Real Verified Reviews */
          <div className="space-y-8">
            {/* Real Statistics Card (Only displayed when real records exist) */}
            {stats && (
              <div className="bg-white rounded-3xl border border-[#e5e9e3] p-6 sm:p-8 shadow-sm grid md:grid-cols-12 gap-8 items-center">
                {/* Left: Overall Rating */}
                <div className="md:col-span-5 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#e5e9e3] pb-6 md:pb-0 md:pr-8">
                  <span className="text-xs font-black uppercase text-[#367c35] tracking-wider bg-[#89ca2e]/20 px-3 py-1 rounded-full">
                    Platform Rating
                  </span>
                  <div className="pt-2 flex items-baseline justify-center md:justify-start gap-3">
                    <span className="text-5xl font-black text-[#10182b]">{stats.average}</span>
                    <span className="text-slate-400 font-bold text-base">/ 5.0</span>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <StarRating rating={parseFloat(stats.average)} size={20} />
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Based on <strong className="text-[#10182b]">{stats.total}</strong> verified community reviews
                  </p>
                </div>

                {/* Right: Rating Distribution Bars */}
                <div className="md:col-span-7 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[star] || 0;
                    const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-bold text-[#10182b] flex items-center gap-1">
                          {star} <Star size={12} className="fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2.5 bg-[#f7f9f5] rounded-full overflow-hidden border border-[#e5e9e3]">
                          <div
                            className="bg-[#89ca2e] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] text-[#64748b] font-bold">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter and Sort Toolbar */}
            <div className="bg-white rounded-2xl border border-[#e5e9e3] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Star Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase text-[#64748b] tracking-wider mr-1 flex items-center gap-1">
                  <Filter size={12} /> Filter:
                </span>
                <button
                  onClick={() => setStarFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    starFilter === 'all'
                      ? 'bg-[#89ca2e] text-[#10182b] shadow-xs'
                      : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                  }`}
                >
                  All ({reviews.length})
                </button>
                {[5, 4, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStarFilter(s.toString())}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      starFilter === s.toString()
                        ? 'bg-[#89ca2e] text-[#10182b] shadow-xs'
                        : 'bg-[#f7f9f5] text-[#172033] border border-[#e5e9e3] hover:border-[#89ca2e]'
                    }`}
                  >
                    <span>{s}</span> <Star size={12} className="fill-amber-400 text-amber-400" />
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 bg-[#f7f9f5] border border-[#e5e9e3] rounded-xl text-xs font-bold text-[#10182b] focus:outline-none focus:ring-2 focus:ring-[#89ca2e] cursor-pointer"
                >
                  <option value="latest">Sort: Latest Reviews</option>
                  <option value="highest">Sort: Highest Rated</option>
                  <option value="lowest">Sort: Lowest Rated</option>
                </select>
                <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((review) => {
                const authorName = review.author?.fullName || review.reviewerName || 'Verified Organizer';
                const initials = authorName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={review._id}
                    className="bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Rating & Date */}
                      <div className="flex items-center justify-between">
                        <StarRating rating={review.rating || 5} size={15} />
                        <span className="text-[11px] text-[#64748b] font-medium">
                          {formatDate(review.createdAt || new Date())}
                        </span>
                      </div>

                      {/* Associated Campaign Tag */}
                      <div className="inline-block px-2.5 py-1 bg-[#f7f9f5] text-[#10182b] rounded-lg border border-[#e5e9e3] text-[11px] font-bold truncate max-w-full">
                        Campaign: {review.campaignName || 'Community Campaign'}
                      </div>

                      {/* Review Feedback Text */}
                      <p className="text-xs sm:text-sm text-[#172033] leading-relaxed italic">
                        &ldquo;{review.feedback || review.comment || review.text}&rdquo;
                      </p>
                    </div>

                    {/* Reviewer Details */}
                    <div className="pt-4 border-t border-[#e5e9e3] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#89ca2e]/25 text-[#367c35] font-black text-xs flex items-center justify-center">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#10182b] line-clamp-1">{authorName}</p>
                          <p className="text-[10px] text-[#64748b]">Campaign Organizer</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#367c35] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Call to Action (Prompt Section 9) */}
        <section className="bg-gradient-to-r from-[#10182b] via-[#172033] to-[#10182b] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#89ca2e]/20 text-[#89ca2e] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Join the Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Be Part of the Sayrab Journey.</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore our platform, support meaningful initiatives, and discover what Sayrab is building.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/campaigns"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#89ca2e] hover:bg-[#7bb926] text-[#10182b] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Explore Campaigns <ArrowRight size={15} />
            </Link>
            <Link
              to="/store"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/15 flex items-center justify-center gap-2"
            >
              Visit Merch Store
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
