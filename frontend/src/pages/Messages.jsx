import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';

function MessagesPage() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      console.log("User ID:", storedUser._id);

      const res = await fetch(`http://localhost:5000/api/messages/conversations/${storedUser._id}`);
      const data = await res.json();
      setConversations(data);
    };
    fetchConversations();
  }, []);

  const formatTimeAgo = (time) => {
    const diff = Math.floor((Date.now() - new Date(time)) / 60000);
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b p-4 flex items-center gap-4">
        <Link to="/" className="p-1">
          <FaArrowLeft className="text-xl"/>
        </Link>
        <h1 className="text-xl font-bold">Messages</h1>
      </header>

      <div className="bg-white p-4 border-b">
        <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
          <FaSearch className="text-gray-500 mr-2" />
          <span className="text-gray-500">Search</span>
        </div>
      </div>

      <div className="bg-white">

        {
         conversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">
            No Messages yet.
          </p>
        ) : (conversations.map((conv, index) => (
       <Link 
  to={`/messages/${conv.user._id}/${conv.user.username}`} 
  key={index}
  className="block hover:bg-gray-50 transition-colors duration-200"
>
  <div className="flex items-center p-4 border-b border-gray-100 last:border-0">
    <div className="relative mr-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden border-2 border-white shadow-sm">
        <img
          src={conv.user.avatar}
          alt={conv.user.username}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
          }}
        />
      </div>
      {conv.user.isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline">
        <h3 className="font-semibold text-gray-800 truncate mr-2">{conv.user.username}</h3>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatTimeAgo(conv.time)}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <p className="text-sm text-gray-500 truncate pr-2">
          {conv.lastMessage}
        </p>
        {conv.unreadCount > 0 && (
          <span className="bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </div>
  </div>
</Link>
        )))}
      
      </div>
    </div>
  );
}

export default MessagesPage;
