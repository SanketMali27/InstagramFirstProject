import express from 'express';

import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username avatar fullName')
      .populate('post', 'image videoUrl thumbnailUrl mediaType')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/mark-read', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );

    return res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { read: true } },
      { new: true }
    )
      .populate('sender', 'username avatar fullName')
      .populate('post', 'image videoUrl thumbnailUrl mediaType');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        errors: []
      });
    }

    return res.json({
      success: true,
      notification
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        errors: []
      });
    }

    return res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
