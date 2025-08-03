import { useParams, Link ,Navigate} from 'react-router-dom';
import { FaComment, FaUserPlus, FaUserCheck, FaArrowLeft } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PublicProfile() {
  const { userId ,username} = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
 const [userPosts, setUserPosts] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  // 🔹 Fetch user data when page loads
  if (currentUser?.username === username) {
    return <Navigate to="/profile" replace />;
  }
  useEffect(() => { 
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${username}`);
        setUser(res.data);

        // Check if current user is following
        if (res.data.followers?.some(id => id.toString() === currentUser._id)) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [username, currentUser._id]);

  useEffect(() => {
      const fetchUserPosts = async () => {
        try {
     
          const res = await fetch(`http://localhost:5000/api/users/posts/${userId}`);
          const data = await res.json();
          console.log("userPosts response:", data);
          setUserPosts(data);
          console.log("Fetched user posts: ", data);
        } catch (err) {
          console.error("Error fetching user posts", err);
        }
      };
      fetchUserPosts();
    }, []);
 const handleFollowToggle = async () => {
  try {
    const url = `http://localhost:5000/api/users/${user._id}/${isFollowing ? "unfollow" : "follow"}`;
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id }),
    });

    // ✅ Update current user (in memory + localStorage)
    const updatedCurrentUser = {
      ...currentUser,
      following: isFollowing
        ? currentUser.following.filter(id => id.toString() !== user._id.toString())
        : [...currentUser.following, user._id]
    };
    localStorage.setItem("user", JSON.stringify(updatedCurrentUser));

    // ✅ Update the currentUser state right away
    setIsFollowing(!isFollowing);

    // ✅ Update user profile followers list instantly
    setUser(prev => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter(id => id.toString() !== currentUser._id.toString())
        : [...prev.followers, currentUser._id]
    }));

  } catch (err) {
    console.error("Follow/unfollow error:", err);
  }
};

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 mb-16">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <Link to="/" className="p-1">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <button className="text-2xl text-gray-600 hover:text-black">⋮</button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center space-x-8 mb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-1.5 shadow-lg">
            <div className="bg-white rounded-full p-1 w-full h-full">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={user.avatar || "https://i.pravatar.cc/150"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-lg">{user.posts?.length || 0}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <Link to={`/user/${user._id}/${user.username}/followers`}>
                  <p className="font-bold text-lg">{user.followers?.length}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </Link>
              </div>
              <div className="text-center">
                <Link to={`/user/${user._id}/${user.username}/following`}>
                  <p className="font-bold text-lg">{user.following?.length}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4 leading-tight">
          <h2 className="font-bold">{user.fullName}</h2>
          <p className="text-sm text-gray-600">{user.bio}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={handleFollowToggle}
            className={`flex-1 ${isFollowing ? "bg-gray-300 text-black" : "bg-gray-800 text-white"
              } text-sm font-semibold py-2 px-4 rounded shadow-sm transition-all`}
          >
            <div className="flex items-center justify-center gap-1">
              {isFollowing ? (
                <>
                  <FaUserCheck className="text-lg" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="text-lg" />
                  <span>Follow</span>
                </>
              )}
            </div>
          </button>

          <Link to={`/messages/${user._id}/${username}`} className="flex-1 hover:bg-blue-400 bg-blue-600 text-sm text-white font-semibold py-2 px-4 rounded shadow-sm transition-all flex items-center justify-center gap-1">
            <FaComment className="text-lg" />
            <span>Message</span>
          </Link>


        </div>
      </div>

      {/* Posts or Empty State */}
       {/* Empty Post Section */}
           <div className="max-w-5xl mx-auto pt-12 pb-4">
             {userPosts.length === 0 ? (
               // 💡 Empty State
               <div className="text-center border-t border-gray-300 pt-12">
                 <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                   <FiPlus className="text-3xl text-gray-400" />
                 </div>
                 <h3 className="text-xl font-medium text-gray-700 mb-2">Capture the moment with a friend</h3>
                 <p className="text-gray-500 mb-6">Create your first post and share your vibes.</p>
     
                 <Link
                   to="/create"
                   className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all"
                 >
                   + New Post
                 </Link>
               </div>
             ) : (
               // 🖼️ Grid of Post Cards
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {userPosts.map((post) => (
     
                   <div
                     key={post._id}
                     className="group relative overflow-hidden rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                   >
                     <img
                       src={post.image}
                       alt={post.caption}
                       className="w-full h-48 object-cover"
                     />
                     <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm text-center p-2">
                       {post.caption || 'No caption'}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
     
    </div>
  );
}

export default PublicProfile;
