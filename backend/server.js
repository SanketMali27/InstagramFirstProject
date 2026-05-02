import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import auth from './middleware/auth.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import Message from './models/Message.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import postsRoutes from './routes/posts.js';
import storyRoutes from './routes/storyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { setSocketIO } from './utils/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

setSocketIO(io);

const PORT = process.env.PORT || 5000;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: []
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    errors: []
  }
});

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }
  if (req.headers) {
    req.headers = mongoSanitize.sanitize(req.headers);
  }
  next();
};

app.use(sanitizeRequest);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    dbState: mongoose.connection.readyState
  });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', auth);
app.use('/api/users', userRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes);

io.use((socket, next) => {
  try {
    const rawToken = socket.handshake.auth?.token;
    const token = rawToken?.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid socket token'));
  }
});

io.on('connection', (socket) => {
  socket.join(String(socket.user.id));

  socket.on('join_room', (userId) => {
    if (String(userId) === String(socket.user.id)) {
      socket.join(String(userId));
    }
  });

  socket.on('send_message', async (payload, callback) => {
    try {
      const text = payload?.message?.trim();
      const receiverId = payload?.receiver;

      if (!text || !receiverId) {
        callback?.({
          success: false,
          message: 'Receiver and message are required'
        });
        return;
      }

      const message = await Message.create({
        sender: socket.user.id,
        receiver: receiverId,
        message: text
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username fullName avatar')
        .populate('receiver', 'username fullName avatar');

      io.to(String(receiverId)).emit('receive_message', populatedMessage);
      io.to(String(socket.user.id)).emit('message_sent', populatedMessage);

      callback?.({
        success: true,
        message: populatedMessage
      });
    } catch (error) {
      callback?.({
        success: false,
        message: 'Failed to send message'
      });
    }
  });

  socket.on('typing', ({ toUserId }) => {
    if (!toUserId) {
      return;
    }

    io.to(String(toUserId)).emit('typing_indicator', {
      fromUserId: socket.user.id
    });
  });

  socket.on('stop_typing', ({ toUserId }) => {
    if (!toUserId) {
      return;
    }

    io.to(String(toUserId)).emit('stop_typing_indicator', {
      fromUserId: socket.user.id
    });
  });

  socket.on('message_seen', async ({ senderId }) => {
    if (!senderId) {
      return;
    }

    await Message.updateMany(
      {
        sender: senderId,
        receiver: socket.user.id,
        seen: false
      },
      {
        $set: { seen: true }
      }
    );

    io.to(String(senderId)).emit('messages_seen', {
      seenBy: socket.user.id
    });
  });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
