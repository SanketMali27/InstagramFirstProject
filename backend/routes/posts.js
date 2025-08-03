import express from 'express';
import Post from '../models/Post.js';
import upload from '../middleware/multer.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { caption, userId, location } = req.body;
    const imageUrl = req.file.path;

    const newPost = new Post({
      image: imageUrl,
      caption,
      location,
      user: userId,
    });

    const saved = await newPost.save();
    await User.findByIdAndUpdate(userId, {
  $push: { posts: saved._id }
    });
    console.log("Post creted");
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
router.get('/feed/:userId', async (req,res) => {
  try {
    const {userId } =req.params;

    const currentUser = await User.findById(userId);
    if(!currentUser) return res.status(404).json({error: "User not found!"});
    

    const posts =await Post.find({
      user:{$in: [...currentUser.following] }

    })
    .populate('user' ,'username avatar')
    .sort({ createdAt: -1});
    console.log("Posts ",posts);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error:error.message });
  }
});

// Like / Unlike Post
router.put('/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // If user already liked → unlike
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:postId/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
