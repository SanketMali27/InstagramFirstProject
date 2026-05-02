import express from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

import Post from '../models/Post.js';
import User from '../models/User.js';
import upload from '../middleware/multer.js';
import validate from '../middleware/validate.js';
import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  getVideoThumbnailUrl
} from '../utils/cloudinary.js';
import {
  createMentionNotifications,
  createNotification,
  extractHashtags
} from '../utils/social.js';

const router = express.Router();

const populatePost = async (postId) =>
  Post.findById(postId)
    .populate('user', 'username fullName avatar')
    .populate('likes', 'username fullName avatar')
    .populate('comments.user', 'username fullName avatar')
    .populate('comments.replies.user', 'username fullName avatar');

const normalizePagination = (page, limit, fallbackLimit = 10) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.max(Number(limit) || fallbackLimit, 1);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};

router.post(
  '/create',
  upload.single('media'),
  [
    body('caption')
      .optional()
      .isLength({ max: 2200 })
      .withMessage('Caption must be 2200 characters or fewer'),
    validate
  ],
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Media file is required',
          errors: []
        });
      }

      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'instagram-clone/posts',
        resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
      });

      const mediaType = uploadResult.resource_type === 'video' ? 'video' : 'image';
      const caption = req.body.caption?.trim() || '';
      const location = req.body.location?.trim() || '';
      const tags = extractHashtags(caption);

      const post = await Post.create({
        image: mediaType === 'image' ? uploadResult.secure_url : '',
        caption,
        location,
        publicId: uploadResult.public_id,
        user: req.user.id,
        tags,
        mediaType,
        videoUrl: mediaType === 'video' ? uploadResult.secure_url : '',
        thumbnailUrl: mediaType === 'video' ? getVideoThumbnailUrl(uploadResult.public_id) : '',
        duration: mediaType === 'video' ? uploadResult.duration || 0 : 0
      });

      await User.findByIdAndUpdate(req.user.id, {
        $push: { posts: post._id }
      });

      await createMentionNotifications({
        text: caption,
        senderId: req.user.id,
        postId: post._id,
        messageBuilder: () => 'You were mentioned in a post caption'
      });

      const populatedPost = await populatePost(post._id);

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: populatedPost
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  '/feed/:userId',
  [
    param('userId').isMongoId().withMessage('Valid userId is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const currentUser = await User.findById(req.user.id).select('following');

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      const { page, limit, skip } = normalizePagination(req.query.page, req.query.limit, 10);
      const authorIds = [...currentUser.following.map(String), req.user.id];

      const [posts, total] = await Promise.all([
        Post.find({ user: { $in: authorIds } })
          .populate('user', 'username fullName avatar')
          .populate('comments.user', 'username fullName avatar')
          .populate('comments.replies.user', 'username fullName avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments({ user: { $in: authorIds } })
      ]);

      return res.json({
        success: true,
        posts,
        page,
        limit,
        hasMore: skip + posts.length < total
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/explore', async (req, res, next) => {
  try {
    const { page, limit, skip } = normalizePagination(req.query.page, req.query.limit, 12);
    const currentUser = await User.findById(req.user.id).select('following');

    const excludedIds = [...currentUser.following.map((id) => new mongoose.Types.ObjectId(id)), new mongoose.Types.ObjectId(req.user.id)];

    const posts = await Post.aggregate([
      {
        $match: {
          user: { $nin: excludedIds }
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' }
        }
      },
      { $sort: { likeCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          image: 1,
          caption: 1,
          location: 1,
          publicId: 1,
          likes: 1,
          comments: 1,
          tags: 1,
          mediaType: 1,
          videoUrl: 1,
          thumbnailUrl: 1,
          duration: 1,
          createdAt: 1,
          user: {
            _id: '$user._id',
            username: '$user.username',
            fullName: '$user.fullName',
            avatar: '$user.avatar'
          }
        }
      }
    ]);

    return res.json({
      success: true,
      posts,
      page,
      limit,
      hasMore: posts.length === limit
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/reels', async (req, res, next) => {
  try {
    const { page, limit, skip } = normalizePagination(req.query.page, req.query.limit, 10);

    const posts = await Post.find({ mediaType: 'video' })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      posts,
      page,
      limit,
      hasMore: posts.length === limit
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/hashtag/:tag', async (req, res, next) => {
  try {
    const { page, limit, skip } = normalizePagination(req.query.page, req.query.limit, 12);
    const tag = req.params.tag.toLowerCase();

    const posts = await Post.find({ tags: tag })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      posts,
      tag,
      page,
      limit,
      hasMore: posts.length === limit
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await populatePost(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    return res.json({
      success: true,
      post
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/:postId/like', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate('user', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    const alreadyLiked = post.likes.some((id) => String(id) === req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== req.user.id);
    } else {
      post.likes.push(req.user.id);

      await createNotification({
        recipient: post.user._id,
        sender: req.user.id,
        type: 'like',
        post: post._id,
        message: 'Someone liked your post'
      });
    }

    await post.save();
    const populatedPost = await populatePost(post._id);

    return res.json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/:postId/save', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedPosts.some((id) => String(id) === req.params.postId);

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => String(id) !== req.params.postId);
    } else {
      user.savedPosts.push(req.params.postId);
    }

    await user.save();

    return res.json({
      success: true,
      message: alreadySaved ? 'Post removed from saved' : 'Post saved'
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:postId/comment', async (req, res, next) => {
  try {
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
        errors: []
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    post.comments.push({
      user: req.user.id,
      text
    });

    await post.save();

    await createNotification({
      recipient: post.user,
      sender: req.user.id,
      type: 'comment',
      post: post._id,
      message: 'Someone commented on your post'
    });

    await createMentionNotifications({
      text,
      senderId: req.user.id,
      postId: post._id,
      messageBuilder: () => 'You were mentioned in a comment'
    });

    const populatedPost = await populatePost(post._id);

    return res.json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:postId/comments/:commentId/reply', async (req, res, next) => {
  try {
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required',
        errors: []
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        errors: []
      });
    }

    comment.replies.push({
      user: req.user.id,
      text
    });

    await post.save();

    await createMentionNotifications({
      text,
      senderId: req.user.id,
      postId: post._id,
      messageBuilder: () => 'You were mentioned in a reply'
    });

    const populatedPost = await populatePost(post._id);

    return res.json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/:postId/comments/:commentId/like', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
        errors: []
      });
    }

    const liked = comment.likes.some((id) => String(id) === req.user.id);

    if (liked) {
      comment.likes = comment.likes.filter((id) => String(id) !== req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await post.save();
    const populatedPost = await populatePost(post._id);

    return res.json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    return next(error);
  }
});

router.put(
  '/:postId',
  [
    body('caption')
      .optional()
      .isLength({ max: 2200 })
      .withMessage('Caption must be 2200 characters or fewer'),
    validate
  ],
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
          errors: []
        });
      }

      if (String(post.user) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own post',
          errors: []
        });
      }

      const caption = req.body.caption?.trim() ?? post.caption;
      const location = req.body.location?.trim() ?? post.location;

      post.caption = caption;
      post.location = location;
      post.tags = extractHashtags(caption);

      await post.save();

      await createMentionNotifications({
        text: caption,
        senderId: req.user.id,
        postId: post._id,
        messageBuilder: () => 'You were mentioned in an updated post caption'
      });

      const populatedPost = await populatePost(post._id);

      return res.json({
        success: true,
        message: 'Post updated successfully',
        post: populatedPost
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        errors: []
      });
    }

    if (String(post.user) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own post',
        errors: []
      });
    }

    await deleteCloudinaryAsset(post.publicId, post.mediaType === 'video' ? 'video' : 'image');
    await User.updateMany(
      {},
      {
        $pull: {
          posts: post._id,
          savedPosts: post._id
        }
      }
    );
    await Post.findByIdAndDelete(post._id);

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
