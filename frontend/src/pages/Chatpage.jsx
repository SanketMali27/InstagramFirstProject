import { useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiSend } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import { createSocket } from '../lib/socket';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function ChatPage() {
  const { userId, username } = useParams();
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const socketRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    const socket = createSocket();
    socketRef.current = socket;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/messages/${currentUser._id}/${userId}`);

        if (active) {
          setMessages(response.data.messages || []);
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

    loadMessages();

    socket.emit('join_room', currentUser._id);
    socket.emit('message_seen', { senderId: userId });

    const handleReceiveMessage = (message) => {
      const isCurrentConversation =
        message.sender._id === userId || message.receiver._id === userId;

      if (!isCurrentConversation) {
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage._id === message._id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });

      if (message.sender._id === userId) {
        socket.emit('message_seen', { senderId: userId });
      }
    };

    const handleMessageSent = (message) => {
      if (message.receiver._id !== userId) {
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage._id === message._id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    };

    const handleTyping = ({ fromUserId }) => {
      if (fromUserId === userId) {
        setIsOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ fromUserId }) => {
      if (fromUserId === userId) {
        setIsOtherUserTyping(false);
      }
    };

    const handleMessagesSeen = ({ seenBy }) => {
      if (seenBy !== userId) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.sender?._id === currentUser._id || message.sender === currentUser._id
            ? { ...message, seen: true }
            : message
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('typing_indicator', handleTyping);
    socket.on('stop_typing_indicator', handleStopTyping);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      active = false;
      if (stopTypingTimeoutRef.current) {
        window.clearTimeout(stopTypingTimeoutRef.current);
      }
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('typing_indicator', handleTyping);
      socket.off('stop_typing_indicator', handleStopTyping);
      socket.off('messages_seen', handleMessagesSeen);
      socket.disconnect();
    };
  }, [currentUser._id, showToast, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherUserTyping]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setNewMessage(value);

    if (!socketRef.current) {
      return;
    }

    socketRef.current.emit('typing', { toUserId: userId });

    if (stopTypingTimeoutRef.current) {
      window.clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit('stop_typing', { toUserId: userId });
    }, 1000);
  };

  const sendMessage = async () => {
    const text = newMessage.trim();

    if (!text || !socketRef.current) {
      return;
    }

    socketRef.current.emit('send_message', { receiver: userId, message: text }, (response) => {
      if (!response?.success) {
        showToast({
          message: response?.message || 'Failed to send message'
        });
        return;
      }

      setMessages((currentMessages) => [...currentMessages, response.message]);
      setNewMessage('');
      socketRef.current?.emit('stop_typing', { toUserId: userId });
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5d0fe,transparent_25%),linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 py-6 pb-28">
      <div className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-[36px] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <Link to="/messages" className="rounded-full bg-slate-100 p-3 text-slate-700">
              <FiArrowLeft />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Realtime Chat</p>
              <h1 className="text-2xl font-black text-slate-900">{username}</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="list" count={4} />
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex h-[65vh] flex-col gap-3 overflow-y-auto px-5 py-6">
              {messages.map((message) => {
                const isMine =
                  (message.sender?._id || message.sender) === currentUser._id;

                return (
                  <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-[24px] px-4 py-3 ${
                        isMine ? 'rounded-br-md bg-slate-900 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${isMine ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isMine ? (
                          <span className="inline-flex items-center gap-1">
                            <FiCheck className={message.seen ? 'text-sky-300' : ''} />
                            {message.seen ? 'Seen' : 'Delivered'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isOtherUserTyping ? (
                <div className="flex justify-start">
                  <div className="rounded-[24px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
                <button
                  type="button"
                  className="rounded-full bg-slate-900 p-3 text-white"
                  onClick={sendMessage}
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
