// Example Express route to create a new post

import express from 'express';
const router = express.Router();

router.post('/create-post', async (req, res) => {
  try {
    const { image, caption, location, userId } = req.body;

    // Basic validation
    if (!image || !userId) {
      return res.status(400).json({ message: 'Image and user are required.' });
    }

    const newPost = new Post({
      image,
      caption,
      location,
      user: userId, // this should be an ObjectId
      likes: [],
      comments: [],
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
