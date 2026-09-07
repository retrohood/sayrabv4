import Review from '../models/Review.js';
import Campaign from '../models/Campaign.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { LIFECYCLE_STATUS } from '../constants/index.js';

export const getPublishedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isPublished: true, type: 'product' })
      .populate('author', 'fullName')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isPublished: true, type: 'product' })
      .populate('author', 'fullName')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (distribution[rounded] !== undefined) distribution[rounded]++;
    });

    res.json({
      reviews,
      total,
      averageRating: Number(avg.toFixed(1)),
      distribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitProductReview = async (req, res) => {
  try {
    const { productId, rating, feedback } = req.body;
    if (!productId || !rating || !feedback) {
      return res.status(400).json({ message: 'Product ID, rating (1-5), and review text are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has bought the product in any order
    let verifiedBuyer = false;
    if (req.user?._id) {
      const boughtOrder = await Order.findOne({
        user: req.user._id,
        'products.product': productId,
        paymentStatus: 'completed',
      });
      if (boughtOrder) verifiedBuyer = true;
    }

    const review = await Review.create({
      author: req.user._id,
      product: product._id,
      productName: product.name,
      rating: Number(rating),
      feedback: feedback.trim(),
      verifiedBuyer,
      isModerated: false,
      isPublished: true,
      type: 'product',
    });

    // Recompute product ratings
    const allProdReviews = await Review.find({ product: product._id, isPublished: true, type: 'product' });
    const count = allProdReviews.length;
    const avg = count > 0 ? allProdReviews.reduce((sum, r) => sum + r.rating, 0) / count : Number(rating);

    product.averageRating = Number(avg.toFixed(1));
    product.reviewCount = count;
    await product.save();

    const populated = await Review.findById(review._id).populate('author', 'fullName');
    res.status(201).json({ review: populated, message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCreatorProductReviews = async (req, res) => {
  try {
    const { productId } = req.query;

    // Get all products owned by creator
    let productQuery = { creator: req.user._id };
    const myProducts = await Product.find(productQuery).select('_id name price image averageRating reviewCount');

    const myProductIds = myProducts.map(p => p._id);
    if (myProductIds.length === 0) {
      return res.json({ products: [], reviews: [] });
    }

    const filter = {
      product: productId ? productId : { $in: myProductIds },
      type: 'product',
      isPublished: true,
    };

    const reviews = await Review.find(filter)
      .populate('author', 'fullName email')
      .populate('product', 'name image price')
      .sort({ createdAt: -1 });

    res.json({
      products: myProducts,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
