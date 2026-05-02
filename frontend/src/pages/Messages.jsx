import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import { createSocket } from '../lib/socket';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function MessagesPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const socket = createSocket();

    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/messages/conversations/${currentUser._id}`);

        if (active) {
          setConversations(response.data.conversations || []);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          const message = extractErrorMessage(requestError);
          setError(message);
          showToast({
            message
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    socket.emit('join_room', currentUser._id);

    const upsertConversationFromMessage = (message, incrementUnread) => {
      const otherUser =
        message.sender._id === currentUser._id ? message.receiver : message.sender;

      setConversations((currentConversations) => {
        const existing = currentConversations.find(
          (conversation) => conversation.user._id === otherUser._id
        );

        const updatedConversation = {
          user: otherUser,
          lastMessage: message.message,
          createdAt: message.createdAt,
          unreadCount:
            existing?.unreadCount && incrementUnread
              ? existing.unreadCount + 1
              : incrementUnread
                ? 1
                : existing?.unreadCount || 0
        };

        const filtered = currentConversations.filter(
          (conversation) => conversation.user._id !== otherUser._id
        );

        return [updatedConversation, ...filtered];
      });
    };

    const handleReceiveMessage = (message) => {
      if (message.receiver._id === currentUser._id) {
        upsertConversationFromMessage(message, true);
      }
    };

    const handleMessageSent = (message) => {
      upsertConversationFromMessage(message, false);
    };

    const handleMessagesSeen = ({ seenBy }) => {
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.user._id === seenBy
            ? {
                ...conversation,
                unreadCount: 0
              }
            : conversation
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      active = false;
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('messages_seen', handleMessagesSeen);
      socket.disconnect();
    };
  }, [currentUser._id, showToast]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[36px] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-full bg-slate-100 p-3 text-slate-700">
              <FiArrowLeft />
            </Link>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Inbox</p>
              <h1 className="text-2xl font-black text-slate-900">Messages</h1>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-500">
            <FiSearch />
            Search is ready to be connected to a users endpoint when needed
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <LoadingSkeleton variant="list" count={4} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          ) : conversations.length ? (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.user._id}
                  to={`/messages/${conversation.user._id}/${conversation.user.username}`}
                  className="flex items-center gap-3 rounded-[28px] border border-slate-100 p-4 transition hover:bg-slate-50"
                >
                  <img
                    src={conversation.user.avatar || 'https://i.pravatar.cc/120'}
                    alt={conversation.user.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-slate-900">{conversation.user.username}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(conversation.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="truncate text-sm text-slate-500">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-pink-500 px-2.5 py-1 text-xs font-semibold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-slate-50 p-8 text-center">
              <p className="text-xl font-black text-slate-900">No conversations yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Follow someone and start chatting from their profile page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
