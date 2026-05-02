import { useEffect, useMemo, useState } from 'react';
import { FiBell, FiCompass, FiHome, FiPlusSquare, FiPlayCircle, FiSearch } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

import api from '../api/axios';
import { getStoredUser, getToken } from '../lib/auth';
import { createSocket } from '../lib/socket';

function BottomNav() {
  const location = useLocation();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [unreadCount, setUnreadCount] = useState(0);
  const hiddenRoutes = ['/login', '/signup'];

  useEffect(() => {
    if (!getToken()) {
      return undefined;
    }

    let active = true;
    const socket = createSocket();

    const loadUnreadCount = async () => {
      try {
        const response = await api.get('/api/notifications');
        if (active) {
          setUnreadCount((response.data.notifications || []).filter((notification) => !notification.read).length);
        }
      } catch (error) {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    loadUnreadCount();
    socket.emit('join_room', currentUser?._id);

    const handleNewNotification = () => {
      setUnreadCount((current) => current + 1);
    };

    const handleNotificationsUpdated = () => {
      loadUnreadCount();
    };

    socket.on('new_notification', handleNewNotification);
    window.addEventListener('notifications:updated', handleNotificationsUpdated);

    return () => {
      active = false;
      socket.off('new_notification', handleNewNotification);
      window.removeEventListener('notifications:updated', handleNotificationsUpdated);
      socket.disconnect();
    };
  }, [currentUser?._id, location.pathname]);

  if (!currentUser || hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/explore', icon: FiSearch, label: 'Explore' },
    { to: '/create', icon: FiPlusSquare, label: 'Create' },
    { to: '/reels', icon: FiPlayCircle, label: 'Reels' },
    { to: '/notification', icon: FiBell, label: 'Notifications', badge: unreadCount },
    { to: '/profile', icon: FiCompass, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-3xl -translate-x-1/2 rounded-full bg-white/90 p-2 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;

          if (item.to === '/profile') {
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative rounded-full p-3 transition ${active ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                <img
                  src={currentUser.avatar || 'https://i.pravatar.cc/120'}
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover"
                />
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative rounded-full p-3 transition ${active ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              <Icon className="text-xl" />
              {item.badge ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
