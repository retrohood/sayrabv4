import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Campaign from '../models/Campaign.js';
import { generateSlug } from '../utils/generateToken.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, creator } = req.query;

    if (!isDatabaseConnected(mongoose)) {
      let products = inMemoryDB.products.find({ creator, category });
      if (search) {
        products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
      }
      return res.json({
        products,
        pagination: { page: 1, limit: 50, total: products.length, pages: 1 }
      });
    }

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
    if (!isDatabaseConnected(mongoose)) {
      const product = inMemoryDB.products.findOne({ slug: req.params.slug });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    }

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
    if (!isDatabaseConnected(mongoose)) {
      const products = inMemoryDB.products.find().filter(p => p.campaignId === req.params.campaignId || p.campaign === req.params.campaignId);
      return res.json(products);
    }

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
    if (!isDatabaseConnected(mongoose)) {
      const product = inMemoryDB.products.findOne({ _id: req.params.id });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    }

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
      campaign,
      branding,
    } = req.body;

    const actualCampaignId = campaignId || campaign;

    if (!isDatabaseConnected(mongoose)) {
      const product = inMemoryDB.products.create({
        name,
        slug: generateSlug(name) + '-' + Date.now(),
        description,
        category,
        price: Number(price),
        image,
        images: images || [image],
        sizes: sizes || [],
        colors: colors || [],
        stock: Number(stock),
        campaignId: actualCampaignId,
        campaign: actualCampaignId,
        creator: req.user._id,
        branding: branding || (actualCampaignId ? 'campaign' : 'platform'),
      });
      return res.status(201).json(product);
    }

    await ensureCampaignOwnership(actualCampaignId, req.user);

    const product = await Product.create({
      name,
      slug: generateSlug(name) + '-' + Date.now(),
      description,
      category,
      price,
      image,
      images,
      sizes,
      colors,
      stock,
      campaignId: actualCampaignId,
      campaign: actualCampaignId,
      creator: req.user._id,
      branding: branding || (actualCampaignId ? 'campaign' : 'platform'),
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected(mongoose)) {
      const product = inMemoryDB.products.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
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
        'branding',
        'campaign',
        'campaignId',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'name') {
            product.name = req.body.name;
            product.slug = generateSlug(req.body.name) + '-' + Date.now();
          } else {
            product[field] = req.body[field];
          }
        }
      });

      return res.json(product);
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const actualCampaignId = product.campaignId || product.campaign;
    if (actualCampaignId) {
      await ensureCampaignOwnership(actualCampaignId, req.user);
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
      'branding',
      'campaign',
      'campaignId',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'name') {
          product.name = req.body.name;
          product.slug = generateSlug(req.body.name) + '-' + Date.now();
        } else {
          product[field] = req.body[field];
        }
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
    const { id } = req.params;

    if (!isDatabaseConnected(mongoose)) {
      const success = inMemoryDB.products.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json({ message: 'Product deleted successfully' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const actualCampaignId = product.campaignId || product.campaign;
    if (actualCampaignId) {
      await ensureCampaignOwnership(actualCampaignId, req.user);
    } else if (product.creator?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
