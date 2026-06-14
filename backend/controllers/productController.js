import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import { generateSlug } from '../utils/generateToken.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      const products = await Product.find({
        isActive: true,
        $or: [{ campaignId: req.params.slug }, { campaign: req.params.slug }],
      }).sort({ createdAt: -1 });

      return res.json(products);
    }

    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCampaign = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $or: [{ campaignId: req.params.campaignId }, { campaign: req.params.campaignId }],
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ensureCampaignOwnership = async (campaignId, user) => {
  if (!campaignId) return null;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    const error = new Error('Campaign not found');
    error.status = 404;
    throw error;
  }

  const isOwner =
    campaign.organizer?.toString() === user._id.toString() ||
    campaign.managerId?.toString() === user._id.toString();

  if (!isOwner && user.role !== 'admin') {
    const error = new Error('Not authorized for this campaign');
    error.status = 403;
    throw error;
  }

  return campaign;
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      image,
      images,
      sizes,
      colors,
      stock,
      campaignId,
    } = req.body;

    await ensureCampaignOwnership(campaignId, req.user);

    const product = await Product.create({
      name,
      slug: generateSlug(name),
      description,
      category,
      price,
      image,
      images,
      sizes,
      colors,
      stock,
      campaignId,
      campaign: campaignId,
      creator: req.user._id,
      branding: campaignId ? 'campaign' : 'platform',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.campaignId) {
      await ensureCampaignOwnership(product.campaignId, req.user);
    } else if (product.creator?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = [
      'name',
      'description',
      'category',
      'price',
      'image',
      'images',
      'sizes',
      'colors',
      'stock',
      'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.campaignId) {
      await ensureCampaignOwnership(product.campaignId, req.user);
    } else if (product.creator?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    product.isActive = false;
    await product.save();
    res.json({ message: 'Product archived' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
