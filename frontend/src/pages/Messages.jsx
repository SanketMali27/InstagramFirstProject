import { FaSearch, FaRegComment, FaRegHeart, FaRegPaperPlane, FaRegBookmark, FaHome, FaUser ,FaArrowLeft } from 'react-icons/fa';
import { RiMessengerLine } from 'react-icons/ri';

import { Link } from 'react-router-dom';
// Sample dummy data (you'll replace this with real API data later)
const messageList = [
  {
    sender: "ayush.mali",
    content: "Sent a reel by infinite_editiz",
    time: new Date(Date.now() - 60 * 1000 * 58), // 58 minutes ago
  },
  {
    sender: "sneha.k",
    content: "How are you?",
    time: new Date(Date.now() - 60 * 1000 * 5), // 5 minutes ago
  },
  {
    sender: "vijay.b",
    content: "See you tomorrow 👋",
    time: new Date(Date.now() - 60 * 1000 * 120), // 2 hours ago
  },
];

// Optional: convert timestamp to something like "58m", "2h"
const formatTimeAgo = (time) => {
  const diff = Math.floor((Date.now() - new Date(time)) / 60000); // in minutes
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
};


function MessagesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0   p-4">
    
        <div className="flex items-center gap-4 mx-auto">
            <Link to="/" className="p-1">
            <FaArrowLeft className="text-xl"/>
          </Link>
          <h1 className="text-xl font-bold">sanket.mali27</h1>
         
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className=" mx-auto">
          <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
            <FaSearch className="text-gray-500 mr-2" />
            <span className="text-gray-500">Ask Meta Al or Search</span>
          </div>
        </div>
      </div>

    

      {/* Messages Section */}
      <div className="bg-white">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold">Messages</h3>
          <button className="text-blue-500 mr-16 font-semibold">Request</button>
        </div>

        {/* Requests */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-sm mb-3">Requests</h4>
          <div className="space-y-4">
            {/* Message 1 */}
           <div className="p-4 space-y-3">
      {messageList.map((msg, index) => (
        <Link to={`/messages/${msg.sender}`} key={index}>
          <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold">{msg.sender}</p>
                <p className="text-gray-500 text-xs">{formatTimeAgo(msg.time)}</p>
              </div>
              <p className="text-gray-500 text-sm truncate">{msg.content}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>

         
          </div>
        </div>
      </div>

    </div>
  );
}

export default MessagesPage;