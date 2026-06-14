import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import { generateSlug } from '../utils/generateToken.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, creator } = req.query;
    const filter = {};
    if (creator) {
      filter.creator = creator;
    } else {
      filter.isActive = true;
    }

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
<<<<<<< Updated upstream
    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      const products = await Product.find({
        isActive: true,
        $or: [{ campaignId: req.params.slug }, { campaign: req.params.slug }],
      }).sort({ createdAt: -1 });

      return res.json(products);
    }

    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
=======
    const product = await Product.findOne({ slug: req.params.slug });
>>>>>>> Stashed changes
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< Updated upstream
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
=======
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, image, stock, branding, campaign } = req.body;
    const product = await Product.create({
      name,
      slug: generateSlug(name) + '-' + Date.now(),
>>>>>>> Stashed changes
      description,
      category,
      price,
      image,
<<<<<<< Updated upstream
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
=======
      stock,
      branding: branding || 'platform',
      campaign: campaign || undefined,
      creator: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> Stashed changes
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
<<<<<<< Updated upstream

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
=======
    if (product.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, description, category, price, image, stock, isActive, branding, campaign } = req.body;
    if (name) {
      product.name = name;
      product.slug = generateSlug(name) + '-' + Date.now();
    }
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = stock;
    if (isActive !== undefined) product.isActive = isActive;
    if (branding !== undefined) product.branding = branding;
    if (campaign !== undefined) product.campaign = campaign;
>>>>>>> Stashed changes

    await product.save();
    res.json(product);
  } catch (error) {
<<<<<<< Updated upstream
    res.status(error.status || 500).json({ message: error.message });
=======
    res.status(500).json({ message: error.message });
>>>>>>> Stashed changes
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
<<<<<<< Updated upstream

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
=======
    if (product.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> Stashed changes
  }
};
