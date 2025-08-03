import React, { useEffect, useState } from 'react';
import { useParams,Link } from 'react-router-dom';
import {FaArrowLeft } from 'react-icons/fa';
function ChatPage() {
  const { userId,username } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://localhost:5000/api/messages/${storedUser._id}/${userId}`);
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const res = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: storedUser._id, receiver: userId, message: newMessage })
    });
    const data = await res.json();
    setMessages([...messages, data]);
    setNewMessage('');
  };

  return (
<div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen p-4">
  <header className="bg-white shadow-lg sticky top-0 z-10 p-4 rounded-b-xl">
    <div className="flex justify-between items-center max-w-5xl mx-auto">
      <Link 
        to="/messages" 
        className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
      >
        <FaArrowLeft className="text-xl text-indigo-600" />
      </Link>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">Chat with {username}</h1>
        <p className="text-xs text-gray-500">Online</p>
      </div>
      <button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </div>
  </header>

  <div className="max-w-5xl mx-auto mt-4">
    <div className="bg-white p-4 shadow-xl rounded-2xl h-[75vh] flex flex-col border border-gray-100">
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === userId ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${msg.sender === userId 
                ? 'bg-indigo-100 text-gray-800 rounded-tl-none' 
                : 'bg-indigo-600 text-white rounded-tr-none'}`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 text-right ${msg.sender === userId ? 'text-gray-500' : 'text-indigo-200'}`}>
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-4 p-2 border-t border-gray-100">
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1 border-0 bg-gray-50 rounded-l-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-r-full transition-all duration-300 flex items-center justify-center"
          disabled={!newMessage.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
  );
}

export default ChatPage;
