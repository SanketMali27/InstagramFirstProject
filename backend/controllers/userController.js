import User from '../models/User.js';

export const getUserByUsername = async (req, res) => {
  
console.log("Requested user:", req.params.username);
try {
  const param = req.params.username;
    // Check if it's a valid MongoDB ObjectId
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

    // Search by ID or username
       const user = isObjectId
      ? await User.findById(param).populate('followers following posts')
      : await User.findOne({ username: param }).populate('followers following posts');

  
       console.log("Fetched user from DB:", user);

    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
