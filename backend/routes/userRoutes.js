import express from 'express';
import { body, param, query } from 'express-validator';

import User from '../models/User.js';
import Post from '../models/Post.js';
import validate from '../middleware/validate.js';
import { createNotification } from '../utils/social.js';

const router = express.Router();

const getUserByIdentifier = async (identifier) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  if (isObjectId) {
    return User.findById(identifier).select('-password');
  }

  return User.findOne({ username: identifier.toLowerCase() }).select('-password');
};

router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedPosts')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: []
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return next(error);
  }
});

router.get(
  '/search',
  [
    query('q').trim().notEmpty().withMessage('Search query is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const regex = new RegExp(req.query.q.trim(), 'i');
      const users = await User.find({
        $or: [{ username: regex }, { fullName: regex }]
      })
        .select('username fullName avatar followers')
        .limit(10);

      return res.json({
        success: true,
        users: users.map((user) => ({
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          followerCount: user.followers.length
        }))
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/posts/:userId',
  [param('userId').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      const posts = await Post.find({ user: req.params.userId })
        .populate('user', 'username fullName avatar')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        posts
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/:userId/saved',
  [param('userId').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      if (req.params.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own saved posts',
          errors: []
        });
      }

      const user = await User.findById(req.user.id)
        .select('savedPosts')
        .populate({
          path: 'savedPosts',
          populate: {
            path: 'user',
            select: 'username fullName avatar'
          }
        });

      return res.json({
        success: true,
        posts: user?.savedPosts || []
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:userId/edit-profile',
  [
    param('userId').isMongoId().withMessage('Valid userId is required'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('bio').optional().isString().withMessage('Bio must be text'),
    body('avatar').optional().isString().withMessage('Avatar must be a URL'),
    validate
  ],
  async (req, res, next) => {
    try {
      if (req.params.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own profile',
          errors: []
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
          fullName: req.body.fullName.trim(),
          bio: req.body.bio?.trim() || '',
          avatar: req.body.avatar || ''
        },
        {
          new: true
        }
      ).select('-password');

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:id/follow',
  [param('id').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      if (req.params.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "You can't follow yourself",
          errors: []
        });
      }

      const [userToFollow, currentUser] = await Promise.all([
        User.findById(req.params.id),
        User.findById(req.user.id)
      ]);

      if (!userToFollow || !currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      const alreadyFollowing = currentUser.following.some(
        (id) => String(id) === String(userToFollow._id)
      );

      if (alreadyFollowing) {
        return res.status(400).json({
          success: false,
          message: 'Already following this user',
          errors: []
        });
      }

      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await Promise.all([currentUser.save(), userToFollow.save()]);

      await createNotification({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: 'follow',
        message: `${currentUser.username} started following you`
      });

      return res.json({
        success: true,
        message: 'User followed successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:id/unfollow',
  [param('id').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      const [userToUnfollow, currentUser] = await Promise.all([
        User.findById(req.params.id),
        User.findById(req.user.id)
      ]);

      if (!userToUnfollow || !currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      currentUser.following = currentUser.following.filter(
        (id) => String(id) !== String(userToUnfollow._id)
      );
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => String(id) !== String(currentUser._id)
      );

      await Promise.all([currentUser.save(), userToUnfollow.save()]);

      return res.json({
        success: true,
        message: 'User unfollowed successfully'
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/:id/followers',
  [param('id').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
        .select('followers')
        .populate('followers', 'username fullName avatar');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      return res.json({
        success: true,
        users: user.followers
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/:id/following',
  [param('id').isMongoId().withMessage('Valid userId is required'), validate],
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
        .select('following')
        .populate('following', 'username fullName avatar');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      return res.json({
        success: true,
        users: user.following
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/:identifier', async (req, res, next) => {
  try {
    const user = await getUserByIdentifier(req.params.identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: []
      });
    }

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar')
      .populate('posts');

    return res.json({
      success: true,
      user: populatedUser
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
