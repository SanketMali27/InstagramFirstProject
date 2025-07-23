import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: String,
  avatar: String,
  bio: String,
  posts: Number,
  followers: Number,
  following: Number,
}, {
  collection: 'User' // 👈 tell Mongoose to use 'User' exactly
});

const User = mongoose.model('User', userSchema);
export default User;
