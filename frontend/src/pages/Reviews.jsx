import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../api/client';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Campaign Reviews</h1>
      <p className="text-slate-600 mb-8">
        Verified campaign creators share their experience after campaigns conclude. Reviews are
        moderated before publication.
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No published reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{review.campaignName}</h3>
                  <p className="text-sm text-slate-500">
                    by {review.author?.fullName || 'Verified Creator'}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-slate-700 leading-relaxed">{review.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
