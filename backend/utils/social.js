import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitToUserRoom } from './socket.js';

export const hashtagRegex = /(^|\s)#([a-zA-Z0-9_]+)/g;
export const mentionRegex = /(^|\s)@([a-zA-Z0-9._]+)/g;

export const extractHashtags = (text = '') => {
  const tags = new Set();
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.add(match[2].toLowerCase());
  }

  hashtagRegex.lastIndex = 0;
  return [...tags];
};

export const extractMentions = (text = '') => {
  const usernames = new Set();
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    usernames.add(match[2].toLowerCase());
  }

  mentionRegex.lastIndex = 0;
  return [...usernames];
};

export const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  message = ''
}) => {
  if (!recipient || !sender || String(recipient) === String(sender)) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    message
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'username avatar fullName')
    .populate('post', 'image videoUrl mediaType')
    .lean();

  emitToUserRoom(String(recipient), 'new_notification', populatedNotification);
  return populatedNotification;
};

export const createMentionNotifications = async ({
  text,
  senderId,
  postId = null,
  messageBuilder
}) => {
  const usernames = extractMentions(text);

  if (!usernames.length) {
    return [];
  }

  const mentionedUsers = await User.find({
    username: { $in: usernames }
  }).select('_id username');

  const notifications = [];

  for (const user of mentionedUsers) {
    if (String(user._id) === String(senderId)) {
      continue;
    }

    const notification = await createNotification({
      recipient: user._id,
      sender: senderId,
      type: 'mention',
      post: postId,
      message: typeof messageBuilder === 'function'
        ? messageBuilder(user.username)
        : `${messageBuilder || 'You were mentioned'}`
    });

    if (notification) {
      notifications.push(notification);
    }
  }

  return notifications;
};
