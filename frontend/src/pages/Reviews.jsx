import { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import api from '../api/client';
import { formatDate } from '../utils/format';

function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-[#e5e9e3]'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reviews')
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load reviews:', err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20 text-[#172033]">
      {/* Page Header */}
      <div className="border-b border-[#e5e9e3] pb-4 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#89ca2e]/25 text-[#367c35] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={12} /> Community Feedback
        </div>
        <h1 className="text-3xl font-black text-[#10182b] tracking-tight">Campaign & Platform Reviews</h1>
        <p className="text-xs sm:text-sm text-[#64748b]">
          Verified organizers and donors share their real experiences after campaigns conclude. All reviews are checked for authenticity.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-40 animate-pulse border border-[#e5e9e3]" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e5e9e3] space-y-3 shadow-xs">
          <MessageSquare size={44} className="text-[#64748b] mx-auto opacity-40" />
          <h2 className="text-base font-bold text-[#10182b]">No Published Reviews Yet</h2>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Reviews will appear here as verified campaign creators and donors conclude their initiatives and submit feedback.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-3xl border border-[#e5e9e3] hover:border-[#89ca2e] p-6 space-y-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating || 5} />
                  <span className="text-[11px] text-[#64748b] font-medium">
                    {formatDate(review.createdAt || new Date())}
                  </span>
                </div>

                <h3 className="font-extrabold text-[#10182b] text-sm">
                  {review.campaignName || 'Community Campaign'}
                </h3>

                <p className="text-xs text-[#172033] leading-relaxed italic">
                  &ldquo;{review.comment || review.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#e5e9e3] flex items-center justify-between text-xs">
                <span className="font-bold text-[#367c35] flex items-center gap-1">
                  <ShieldCheck size={14} /> {review.reviewerName || review.user?.fullName || 'Verified Supporter'}
                </span>
                <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">
                  Verified Review
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
