import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
   console.log("SIGNUP ROUTE HIT ✅");
  const { username, password,fullName, bio,email} = req.body;
  console.log('password :',password);
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
      console.log('hashedPassword :',hashedPassword);
    const newUser = await User.create(
      { username,
        password: hashedPassword,
        fullName,
      
        bio,
        posts: [],
        email,
       
       });

    res.status(201).json({ message: 'User created successfully', user: newUser });
    console.log("user name is  ✅",username);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
   console.log("SIGNin ROUTE HIT ✅");
  const { username, password } = req.body;
  console.log('password :',password);
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
