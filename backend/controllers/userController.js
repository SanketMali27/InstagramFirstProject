import User from '../models/User.js';

export const getUserByUsername = async (req, res) => {
  
console.log("Requested user:", req.params.username);
const user = await User.findOne({ username: req.params.username });
console.log("Fetched user from DB:", user);

  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
