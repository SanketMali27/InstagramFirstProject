// models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  image: { type: String, required: true },
  caption: String,
  location: String,

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who posted
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
