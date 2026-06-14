import Design from '../models/Design.js';
import Campaign from '../models/Campaign.js';

const buildMockups = (prompt) => {
  const seed = encodeURIComponent(prompt.trim().toLowerCase().replace(/\s+/g, '-'));
  return [1, 2, 3].map((index) => `https://picsum.photos/seed/${seed}-${index}/800/800`);
};

const ensureCampaignAccess = async (campaignId, user) => {
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
    const error = new Error('Not authorized');
    error.status = 403;
    throw error;
  }

  return campaign;
};

export const generateDesign = async (req, res) => {
  try {
    const { campaignId, prompt } = req.body;
    if (!campaignId || !prompt?.trim()) {
      return res.status(400).json({ message: 'campaignId and prompt are required' });
    }

    await ensureCampaignAccess(campaignId, req.user);

    const design = await Design.create({
      campaignId,
      prompt,
      generatedImages: buildMockups(prompt),
      status: 'generated',
      requestedBy: req.user._id,
    });

    res.status(201).json(design);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const approveDesign = async (req, res) => {
  try {
    const { designId, approvedImage } = req.body;
    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    await ensureCampaignAccess(design.campaignId, req.user);

    design.approved = true;
    design.status = 'approved';
    design.approvedImage = approvedImage || design.generatedImages[0] || '';
    await design.save();

    res.json(design);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getCampaignDesigns = async (req, res) => {
  try {
    await ensureCampaignAccess(req.params.campaignId, req.user);
    const designs = await Design.find({ campaignId: req.params.campaignId }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
