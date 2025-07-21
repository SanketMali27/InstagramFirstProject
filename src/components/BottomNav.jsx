import React from 'react';
import { FaRegImage,FaHome, FaCompass, FaSearch } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md z-50">
      <div className="flex justify-around items-center p-3 max-w-5xl mx-auto text-gray-600">
        <Link to="/" className="p-2 hover:text-blue-500 transition-colors">
          <FaHome className="text-2xl" />
        </Link>
        <button className="p-2 hover:text-blue-500 transition-colors">
          <FaSearch className="text-2xl" />
        </button>
       
<Link to="/create" className="p-2 text-blue-500">
  < FiPlus className="text-2xl" />
</Link>
        <button className="p-2 hover:text-blue-500 transition-colors">
          <FaCompass className="text-2xl" />
        </button>
        <Link to="/profile" className="p-2 hover:scale-105 transition-transform">
          <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden border border-gray-400">
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="Me"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;
