import jwt from 'jsonwebtoken';

export const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
