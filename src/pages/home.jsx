import React from "react";
import { Link } from 'react-router-dom';
import {FaInstagram ,FaHeart, FaComment, FaPaperPlane, FaBookmark, FaEllipsisH, FaHome, FaSearch, FaPlusSquare, FaCompass, FaUser } from 'react-icons/fa';


function Home() {
  // Sample data
  const stories = [
    { id: 1, username: 'your_story', isYou: true },
    { id: 2, username: 'travel_lover', isViewed: false },
    { id: 3, username: 'foodie_adventures', isViewed: false },
    { id: 4, username: 'tech_geek', isViewed: true },
    { id: 5, username: 'fitness_guru', isViewed: true },
    { id: 6, username: 'art_creator', isViewed: false },
    { id: 7, username: 'music_producer', isViewed: true },
    
    { id: 8, username: 'tech_geek', isViewed: true },
    { id: 9, username: 'fitness_guru', isViewed: true },
    { id: 10, username: 'art_creator', isViewed: false },
    { id: 11, username: 'music_producer', isViewed: true },
  
  ];

  const posts = [
    {
      id: 1,
      username: 'travel_lover',
      location: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1518544866330-95a2bf4855a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      caption: 'Enjoying the beautiful beaches of Bali! #travel #bali',
      likes: '21M',
      comments: 89,
      time: '2 hours ago',
      saved: false
    },
    {
      id: 2,
      username: 'foodie_adventures',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      caption: 'Healthy breakfast bowl to start the day right! #healthyfood #breakfast',
      likes: 892,
      comments: 42,
      time: '5 hours ago',
      saved: true
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center p-4 max-w-5xl mx-auto">
    <div className="flex items-center gap-2">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
    alt="Instagram Logo"
    className="w-6 h-6"
  />
  <h1 className="text-xl font-semibold italic text-gray-800">Instagram</h1>
</div>

         
          <div className="flex space-x-4">
          
<Link to="/notification" className="p-1">
   <FaHeart className="text-2xl text-gray-800" />
</Link>

<Link to="/messages" className="p-1">
  <FaPaperPlane className="text-2xl text-gray-800" />
</Link>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto pb-16">
        {/* Stories */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="flex space-x-4">
            {stories.map(story => (

              <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center 
                  ${story.isYou ? 'bg-white border-2 border-gray-300' : 
                    story.isViewed ? 'bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5' : 
                    'bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5'}`}>
                  <div className="bg-white rounded-full p-0.5 w-full h-full flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/150?img=${story.id}`} 
                        alt={story.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-800">{story.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg mb-4">
            {/* Post Header */}
     <div className="flex justify-between items-center p-3">
  {/* Left: Avatar + Username + Location */}
  <div className="flex items-center space-x-4">
    <Link to={`/userprofile/${post.username}`} className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
        <div className="bg-white rounded-full p-0.5 w-full h-full">
          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={`https://i.pravatar.cc/150?img=${post.id + 10}`}
              alt={post.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <p className="font-semibold text-sm text-gray-800 hover:underline">{post.username}</p>
    </Link>

    {/* Show location if available */}
    {post.location && (
      <p className="text-xs text-gray-800">{post.location}</p>
    )}
  </div>

  {/* Right: Menu icon */}
  <button className="text-gray-600 hover:text-black text-xl">
    <FaEllipsisH />
  </button>
</div>
            {/* Post Image */}
            <div className="w-full aspect-square bg-gray-100">
              <img 
                src={post.image} 
                alt={post.caption} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-3">
              <div className="flex justify-between mb-2">
             <div className="flex space-x-4">
 <button className="text-2xl text-gray-300 hover:text-red-400 transition-transform duration-200 transform hover:scale-125">
  <FaHeart />
</button>

  <button className="text-2xl text-gray-300 hover:text-blue-400 transition-transform duration-200 transform hover:scale-125">
    <FaComment />
  </button>
  <button className="text-2xl text-gray-300 hover:text-purple-400 transition-transform duration-200 transform hover:scale-125">
    <FaPaperPlane />
  </button>
</div>

                <button className="text-2xl">
                  <FaBookmark className={post.saved ? 'text-black' : ''} />
                </button>
              </div>

              {/* Likes */}
              <p className="font-semibold text-sm text-gray-800">{post.likes.toLocaleString()} likes</p>

              {/* Caption */}
              <p className="text-sm mt-1  text-gray-800">
                <span className="font-semibold">{post.username}</span> {post.caption}
              </p>

              {/* Comments */}
              <button className="text-gray-500 text-sm mt-1  text-gray-800">
                View all {post.comments} comments
              </button>

              {/* Time */}
              <p className="text-gray-400 text-xs mt-1 uppercase">{post.time}</p>
            </div>
          </div>
        ))}
      </main>

    </div>
  );
}

export default Home;