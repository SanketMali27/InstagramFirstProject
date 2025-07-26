import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: String,
  avatar: String,
  bio: String,
  posts: Number,
  email: String,
  password: { type: String, required: true },
 

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  collection: 'User' // 👈 tell Mongoose to use 'User' exactly
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
