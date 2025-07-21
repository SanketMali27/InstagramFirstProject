import React, { useState } from 'react';
import { FiHeart, FiMessageSquare, FiUserPlus, FiTag } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { FaArrowLeft } from 'react-icons/fa';

import { Link } from 'react-router-dom';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'follow',
      username: 'johndoe',
      userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'like',
      username: 'janedoe',
      userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      postPreview: 'https://picsum.photos/id/10/200/200',
      time: '15 min ago',
      read: false
    },
    {
      id: 3,
      type: 'comment',
      username: 'bobsmith',
      userImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      comment: 'Great photo! 😍',
      postPreview: 'https://picsum.photos/id/20/200/200',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'tag',
      username: 'alicejohnson',
      userImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      postPreview: 'https://picsum.photos/id/30/200/200',
      time: '3 hours ago',
      read: true
    },
    {
      id: 5,
      type: 'like',
      username: 'mikebrown',
      userImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      postPreview: 'https://picsum.photos/id/40/200/200',
      time: '5 hours ago',
      read: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <FiUserPlus className="text-blue-500" size={24} />;
      case 'like':
        return <AiFillHeart className="text-red-500" size={24} />;
      case 'comment':
        return <FiMessageSquare className="text-blue-400" size={24} />;
      case 'tag':
        return <FiTag className="text-purple-500" size={24} />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'follow':
        return `${notification.username} started following you`;
      case 'like':
        return `${notification.username} liked your post`;
      case 'comment':
        return `${notification.username} commented: "${notification.comment}"`;
      case 'tag':
        return `${notification.username} tagged you in a post`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky flex gap-4 bg-white border-b border-gray-200 p-4">
           <Link to="/" className="p-1">
            <FaArrowLeft className="text-xl"/>
          </Link>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>
      
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-center p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="mr-3">
              <div className="relative">
                <img 
                  src={notification.userImage} 
                  alt={notification.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm">
                {getNotificationText(notification)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
            </div>
            
            {notification.type !== 'follow' && (
              <div className="ml-2">
                <img 
                  src={notification.postPreview} 
                  alt="post preview"
                  className="w-12 h-12 object-cover border border-gray-200"
                />
              </div>
            )}
            
            {!notification.read && (
              <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;