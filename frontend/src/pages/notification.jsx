import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiAtSign, FiHeart, FiMessageCircle, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import { createSocket } from '../lib/socket';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

const iconMap = {
  like: FiHeart,
  comment: FiMessageCircle,
  follow: FiUserPlus,
  mention: FiAtSign
};

function NotificationPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const socket = createSocket();

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/notifications');

        if (active) {
          setNotifications(response.data.notifications || []);
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

    loadNotifications();

    socket.emit('join_room', currentUser._id);

    const handleNewNotification = (notification) => {
      setNotifications((currentNotifications) => [notification, ...currentNotifications]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      active = false;
      socket.off('new_notification', handleNewNotification);
      socket.disconnect();
    };
  }, [currentUser._id, showToast]);

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/mark-read');
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, read: true }))
      );
      window.dispatchEvent(new Event('notifications:updated'));
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    }
  };

  const markOneRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      window.dispatchEvent(new Event('notifications:updated'));
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification._id !== notificationId)
      );
      window.dispatchEvent(new Event('notifications:updated'));
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[36px] bg-white shadow-xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/" className="rounded-full bg-slate-100 p-3 text-slate-700">
                <FiArrowLeft />
              </Link>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Realtime Feed</p>
                <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <LoadingSkeleton variant="list" count={4} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          ) : notifications.length ? (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type] || FiAtSign;

                return (
                  <div
                    key={notification._id}
                    className={`rounded-[28px] border p-4 transition ${
                      notification.read ? 'border-slate-100 bg-white' : 'border-pink-100 bg-pink-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-white p-2 shadow-sm">
                        <Icon className="text-slate-700" />
                      </div>
                      <img
                        src={notification.sender?.avatar || 'https://i.pravatar.cc/120'}
                        alt={notification.sender?.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">{notification.sender?.username}</span>{' '}
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {!notification.read ? (
                          <button
                            type="button"
                            className="mt-2 text-xs font-semibold text-pink-600"
                            onClick={() => markOneRead(notification._id)}
                          >
                            Mark as read
                          </button>
                        ) : null}
                      </div>
                      {notification.post ? (
                        <img
                          src={notification.post.thumbnailUrl || notification.post.image || notification.post.videoUrl}
                          alt="Related post"
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : null}
                      <button
                        type="button"
                        className="rounded-full p-2 text-slate-500 hover:bg-white"
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-slate-50 p-8 text-center">
              <p className="text-xl font-black text-slate-900">No notifications yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Likes, comments, follows, and mentions will show up here live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
