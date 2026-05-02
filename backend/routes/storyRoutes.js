import express from 'express';

import Story from '../models/Story.js';
import User from '../models/User.js';
import upload from '../middleware/multer.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/', upload.single('media'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Story media is required',
        errors: []
      });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'instagram-clone/stories',
      resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    });

    const story = await Story.create({
      user: req.user.id,
      mediaUrl: uploadResult.secure_url,
      mediaType: uploadResult.resource_type === 'video' ? 'video' : 'image',
      publicId: uploadResult.public_id
    });

    const populatedStory = await Story.findById(story._id).populate('user', 'username fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story: populatedStory
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/feed', async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select('following');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const userIds = [...currentUser.following.map((id) => id.toString()), req.user.id];

    const stories = await Story.find({
      user: { $in: userIds },
      createdAt: { $gte: since }
    })
      .populate('user', 'username fullName avatar')
      .populate('viewers.user', 'username fullName avatar')
      .sort({ createdAt: 1 });

    const groupedStories = stories.reduce((acc, story) => {
      const key = String(story.user._id);
      if (!acc[key]) {
        acc[key] = {
          user: story.user,
          stories: []
        };
      }

      acc[key].stories.push(story);
      return acc;
    }, {});

    return res.json({
      success: true,
      storyGroups: Object.values(groupedStories)
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:storyId/view', async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
        errors: []
      });
    }

    const hasViewed = story.viewers.some((viewer) => String(viewer.user) === req.user.id);

    if (!hasViewed) {
      story.viewers.push({
        user: req.user.id,
        viewedAt: new Date()
      });
      await story.save();
    }

    return res.json({
      success: true,
      message: 'Story view recorded'
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:storyId/viewers', async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.storyId)
      .populate('viewers.user', 'username fullName avatar');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
        errors: []
      });
    }

    if (String(story.user) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view viewers for your own stories',
        errors: []
      });
    }

    return res.json({
      success: true,
      viewers: story.viewers
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
