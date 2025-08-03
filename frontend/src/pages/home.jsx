import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { FaInstagram, FaHeart, FaComment, FaPaperPlane, FaBookmark, FaEllipsisH, FaHome, FaSearch, FaPlusSquare, FaCompass, FaUser } from 'react-icons/fa';
import axios from "axios";


function Home() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  console.log("loggedInUser: ", currentUser);

  const fetchfeed = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/feed/${currentUser._id}`);
      setPosts(res.data);
      console.log(res.data);

    } catch (err) {
      console.error("Error Fetching Feed: ", err);
    }
  };


  const handleLike = async (postId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id })
    });
    fetchfeed(); // refresh posts
  };

  const handleComment = async (postId, text) => {
    const user = JSON.parse(localStorage.getItem("user"));
    await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, text })
    });
    fetchfeed()
  };
  useEffect(() => {
    fetchfeed();
  }, [currentUser._id]);


  const stories = [
    { id: 1, username: 'your_story', isYou: true },
    { id: 2, username: 'travel_lover', isViewed: false },
    { id: 3, username: 'foodie_adventures', isViewed: false },
    { id: 4, username: 'tech_geek', isViewed: true }
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
        {
          posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-white border border-gray-200 rounded-lg mb-4">
                {/* Post Header */}
                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center space-x-4">
                    <Link to={`/userprofile/${post.user._id}/${post.user.username}`} className="flex items-center space-x-2">
                      <img
                        src={post.user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="font-semibold text-sm text-gray-800 hover:underline">
                        {post.user.username}
                      </p>
                    </Link>
                    {post.location && <p className="text-xs text-gray-800">{post.location}</p>}
                  </div>
                  <button className="text-gray-600 hover:text-black text-xl"><FaEllipsisH /></button>
                </div>

                {/* Post Image */}
                <div className="w-full aspect-square bg-gray-100">
                  <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                </div>

                {/* Actions */}
                <div className="p-3">
                  <div className="flex justify-between mb-2">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`text-2xl transition-transform duration-200 transform hover:scale-125 
                         ${post.likes.includes(currentUser._id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                      >
                        <FaHeart />
                      </button>

                      <div className="flex flex-col mt-2">
                        {/* Comment Button */}
                        <button
                          onClick={() =>
                            setActiveCommentPost(activeCommentPost === post._id ? null : post._id)
                          }
                          className="text-2xl text-gray-300 hover:text-blue-400 w-fit"
                        >
                          <FaComment />
                        </button>

                        {/* Comment Input (only for active post) */}
                        {activeCommentPost === post._id && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              onClick={() => {
                                handleComment(post._id, commentText);
                                setCommentText("");
                                setActiveCommentPost(null); // close after submit
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Post
                            </button>
                          </div>
                        )}
                      </div>
                        
                    <button className="text-2xl text-gray-300 hover:text-purple-400">
                      <FaPaperPlane />
                    </button>
                    </div>
                   
                  <button className="text-2xl"><FaBookmark className={post.saved ? 'text-black' : ''} /></button>
                  </div>

                </div>

                <p className="font-semibold text-sm text-gray-800">{post.likes.length} likes</p>
                <p className="text-sm mt-1 text-gray-800">
                  <span className="font-semibold">{post.user.username}</span> {post.caption}
                </p>
                <button className="text-gray-500 text-sm mt-1">View all {post.comments.length} comments</button>
                <p className="text-gray-400 text-xs mt-1 uppercase">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
              
  )))
}

      </main >

    </div >
  );
}

export default Home;