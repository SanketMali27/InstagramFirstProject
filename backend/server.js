import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ALLOW CROSS-ORIGIN REQUESTS
app.use(cors());
// Middleware
app.use(express.json());
// Routes
app.use('/api/users', userRoutes);

// Connect DB and start server

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));