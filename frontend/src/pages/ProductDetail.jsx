import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Star, CheckCircle2, MessageSquarePlus, User, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/format';
import { addCartItem } from '../utils/cart';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating, size = 16, interactive = false, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = interactive
          ? star <= (hoverRating || rating)
          : star <= Math.round(rating);

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    total: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Write Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    api.get(`/products/item/${id}`).then((res) => {
      setProduct(res.data);
      if (res.data?.sizes?.length > 0) setSelectedSize(res.data.sizes[0]);
      if (res.data?.colors?.length > 0) setSelectedColor(res.data.colors[0]);

      // Fetch reviews for this product
      fetchReviews(res.data._id);
    });
  }, [id]);

  const fetchReviews = (productId) => {
    setReviewsLoading(true);
    api.get(`/reviews/product/${productId}`)
      .then((res) => {
        setReviewsData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load product reviews:', err);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!user) {
      setReviewError('Please login to leave a review.');
      return;
    }

    if (!reviewForm.feedback.trim()) {
      setReviewError('Please write your review feedback.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews/product', {
        productId: product._id,
        rating: reviewForm.rating,
        feedback: reviewForm.feedback,
      });

      setReviewSuccess('Thank you! Your review has been published.');
      setReviewForm({ rating: 5, feedback: '' });
      setTimeout(() => setShowReviewForm(false), 2000);
      fetchReviews(product._id);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const image = product.image || product.images?.[0] || 'https://picsum.photos/seed/sayrab/500/500';
  const averageRating = reviewsData.total > 0 ? reviewsData.averageRating : (product.averageRating || 5);
  const totalReviews = reviewsData.total;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Product Hero Section */}
      <div className="grid gap-10 lg:grid-cols-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 aspect-square flex items-center justify-center">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right: Details & Purchase */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Quick Peek */}
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={averageRating} size={18} />
              <span className="text-sm font-bold text-slate-800">
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-sm text-slate-400">·</span>
              <a href="#customer-reviews" className="text-sm font-medium text-primary-600 hover:text-primary-700 underline underline-offset-2">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </a>
            </div>

            <p className="mt-5 text-slate-600 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Portion of merchandise revenue directly supports verified community campaigns.
              </p>
            </div>

            {/* Sizes Selection */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === s
                          ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection */}
            {product.colors?.length > 0 && (
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        selectedColor === c
                          ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => {
                addCartItem({
                  ...product,
                  selectedSize,
                  selectedColor,
                });
                setAdded(true);
                setTimeout(() => setAdded(false), 2500);
              }}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <ShoppingCart size={18} />
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            <Link
              to="/cart"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Reviews Section Below Product Details & Image */}
      {/* ========================================================= */}
      <section id="customer-reviews" className="mt-12 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Customer Reviews & Experiences
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read real reviews from people who have purchased this product.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors self-start md:self-auto cursor-pointer"
          >
            <MessageSquarePlus size={16} />
            {showReviewForm ? 'Close Review Form' : 'Write a Review'}
          </button>
        </div>

        {/* Rating Breakdown Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-slate-100">
          {/* Average Rating Big Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-5xl font-extrabold text-slate-900">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <div className="mt-2">
              <StarRating rating={averageRating} size={22} />
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Based on {totalReviews} {totalReviews === 1 ? 'customer review' : 'customer reviews'}
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.distribution?.[star] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : star === 5 ? 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <span className="w-12 text-slate-700 font-semibold">{star} Stars</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Submission Form Modal/Inline */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Share Your Feedback for {product.name}
            </h3>

            {reviewError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                {reviewSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Rating *
                </label>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={reviewForm.rating}
                    size={24}
                    interactive={true}
                    onRatingChange={(newRating) => setReviewForm({ ...reviewForm, rating: newRating })}
                  />
                  <span className="text-sm font-semibold text-slate-700 ml-2">
                    {reviewForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review / Comment *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How was the quality, fit, and delivery of this product?"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="mt-8 space-y-6">
          {reviewsLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading reviews...
            </div>
          ) : reviewsData.reviews?.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No reviews yet for this product</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Be the first person to share your experience with this item!
              </p>
            </div>
          ) : (
            reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {rev.author?.fullName ? rev.author.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {rev.author?.fullName || 'Verified Customer'}
                      </h4>
                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                          <CheckCircle2 size={12} /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                <div className="mt-2 mb-3">
                  <StarRating rating={rev.rating} size={14} />
                </div>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {rev.feedback}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

