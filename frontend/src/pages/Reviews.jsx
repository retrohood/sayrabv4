import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../api/client';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
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
      .then((res) => setReviews(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Campaign Reviews</h1>
        <p className="text-slate-400 text-xs mt-1">
          Verified campaign creators share their experience after campaigns conclude. Reviews are moderated before publication.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl h-32 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <MessageSquare size={44} className="text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No published reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 p-6 space-y-3 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm">{review.campaignName}</h3>
                  <p className="text-xs text-cyan-400 mt-0.5">
                    by {review.author?.fullName || 'Verified Creator'}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{review.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
