import express from 'express';
import { param } from 'express-validator';

import Message from '../models/Message.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get(
  '/conversations/:userId',
  [param('userId').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
      })
        .populate('sender', 'username fullName avatar')
        .populate('receiver', 'username fullName avatar')
        .sort({ createdAt: -1 });

      const conversationsMap = new Map();

      for (const message of messages) {
        const otherUser = String(message.sender._id) === userId ? message.receiver : message.sender;

        if (!conversationsMap.has(String(otherUser._id))) {
          conversationsMap.set(String(otherUser._id), {
            user: otherUser,
            lastMessage: message.message,
            createdAt: message.createdAt,
            unreadCount: 0
          });
        }

        if (String(message.receiver._id) === userId && !message.seen) {
          const conversation = conversationsMap.get(String(otherUser._id));
          conversation.unreadCount += 1;
        }
      }

      return res.json({
        success: true,
        conversations: [...conversationsMap.values()]
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/:userId/:otherUserId',
  [
    param('userId').isMongoId().withMessage('Valid userId is required'),
    param('otherUserId').isMongoId().withMessage('Valid otherUserId is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;

      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      })
        .populate('sender', 'username fullName avatar')
        .populate('receiver', 'username fullName avatar')
        .sort({ createdAt: 1 });

      return res.json({
        success: true,
        messages
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
