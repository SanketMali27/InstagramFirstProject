import express from 'express';
import { getUserByUsername } from '../controllers/userController.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
const router = express.Router();

// GET /api/users/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:userId/edit-profile", async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { fullName, bio, avatar },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/posts/user/:userId
router.get('/posts/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



router.put('/:id/follow', async (req, res) => {
  console.log("Follow route hit ✅");
  console.log("Target user ID:", req.params.id);
  console.log("Current user ID from body:", req.body.userId);
  
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    
    console.log("Fetched userToFollow:", userToFollow);
    console.log("Fetched currentUser:", currentUser);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!userToFollow.followers.includes(req.body.userId)) {
      userToFollow.followers.push(req.body.userId);
      currentUser.following.push(req.params.id);
      
      await userToFollow.save();
      await currentUser.save();
      
      return res.status(200).json({ message: 'User followed!' });
    } else {
      return res.status(400).json({ message: 'Already following this user' });
    }
  } catch (err) {
    console.error("❌ Follow route error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Unfollow
router.put('/:id/unfollow', async (req, res) => {
  try {
    if (req.params.id === req.body.userId) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }
    
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    
    if (userToUnfollow.followers.includes(req.body.userId)) {
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => id.toString() !== req.body.userId
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      
      await userToUnfollow.save();
      await currentUser.save();
      
      return res.status(200).json({ message: 'User unfollowed!' });
    } else {
      return res.status(400).json({ message: 'You are not following this user' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Followers of a User
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    .populate('followers', 'username fullName avatar'); // Populate with details
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user.followers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Following of a User
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    .populate('following', 'username fullName avatar');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user.following);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:username', getUserByUsername);

export default router;
