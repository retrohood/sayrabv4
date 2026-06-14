import mongoose from 'mongoose';
import Upload from '../models/Upload.js';
import { isDatabaseConnected } from '../utils/demoAuth.js';
import { inMemoryDB } from '../utils/inMemoryDB.js';

export const createUpload = async (req, res) => {
  try {
    const { name, url, type, size, category } = req.body;

    if (!isDatabaseConnected(mongoose)) {
      const upload = inMemoryDB.uploads.create({
        owner: req.user._id,
        name,
        url,
        type,
        size,
        category,
      });
      return res.status(201).json(upload);
    }

    const upload = await Upload.create({
      owner: req.user._id,
      name,
      url,
      type,
      size,
      category,
    });
    res.status(201).json(upload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyUploads = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const uploads = inMemoryDB.uploads.find({ owner: req.user._id });
      return res.json(uploads);
    }
    const uploads = await Upload.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUpload = async (req, res) => {
  try {
    if (!isDatabaseConnected(mongoose)) {
      const success = inMemoryDB.uploads.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Upload not found' });
      }
      return res.json({ message: 'Upload deleted' });
    }

    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    if (upload.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await upload.deleteOne();
    res.json({ message: 'Upload deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
