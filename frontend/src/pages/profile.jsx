import { FiEdit, FiShare2, FiPlus } from 'react-icons/fi';
import { FaHome, FaCompass, FaSearch,	FaComment } from 'react-icons/fa';
import React from "react";
import {Link} from 'react-router-dom';
import { useEffect, useState } from 'react';


function Profile() {
    const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);
  
  if (!user) {
    return (
      <div className="text-center mt-20 text-xl font-semibold text-gray-500">
        Loading profile...
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 mb-16">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <h1 className="text-xl font-bold">{user?.username}</h1>
          <button className="text-2xl text-gray-600 hover:text-black transition-colors">⋮</button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center space-x-8 mb-6">
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-1.5 shadow-lg">
            <div className="bg-white rounded-full p-1 w-full h-full">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                {/* Profile image here */}
                <img
                  src="https://i.pravatar.cc/150?img=5"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 text-gray-800">
            <div className="flex  mb-4 gap-6">
              <div className="text-center">
                <p className="font-bold text-lg">{user.post}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user.followers}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user.following}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4 text-gray-800 leading-tight">
          <h2 className="font-bold">{user.fullname}</h2>
          <p className="text-sm text-gray-600">{user.bio}</p>
    
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button className="flex-1 hover:bg-gray-500 bg-gray-800 text-sm text-white font-semibold py-2 px-4 rounded shadow-sm transition-all">
            <div className="flex items-center justify-center gap-1">
              <FiEdit className="text-lg" />
              <span>Edit Profile</span>
            </div>
          </button>
          <button className="flex-1 hover:bg-blue-400 bg-blue-600 text-sm text-white font-semibold py-2 px-4 rounded shadow-sm transition-all">
            <div className="flex items-center justify-center gap-1">
              <	FaComment className="text-lg" />
              <span>Message</span>
            </div>
          </button>
        </div>
      </div>

      {/* Empty Post Section */}
      <div className="max-w-5xl mx-auto border-t border-gray-300 pt-12 text-center pb-4">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
          <FiPlus className="text-3xl text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Capture the moment with a friend</h3>
        <p className="text-gray-500 mb-6">Create your first post and share your vibes.</p>
        
               
<Link to="/create" className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all">
 
 + New Post
</Link> 
       
      </div>

    </div>
  );
}

export default Profile;
