import { useParams } from 'react-router-dom';
import { FaComment,FaUserPlus,FaArrowLeft } from 'react-icons/fa';
import { FiPlus,FiEdit} from 'react-icons/fi';

import { Link } from 'react-router-dom';

function PublicProfile() {
  const { username } = useParams();

  // Replace this with actual fetch call later
  const userData = {
    fullName: 'Sneha K.',
    bio: 'Love to capture 📸',
    posts: 3,
    followers: 987,
    following: 412,
    avatar: 'https://i.pravatar.cc/150?img=10',
  };

  return (
   <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 mb-16">
      
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
           <Link to="/" className="p-1">
            <FaArrowLeft className="text-xl"/>
          </Link>
          <h1 className="text-xl font-bold">{username}</h1>
          <button className="text-2xl text-gray-600 hover:text-black">⋮</button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center space-x-8 mb-6">
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-1.5 shadow-lg">
            <div className="bg-white rounded-full p-1 w-full h-full">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={userData.avatar}
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
                <p className="font-bold text-lg">{userData.posts}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userData.followers}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userData.following}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-4 leading-tight">
          <h2 className="font-bold">{userData.fullName}</h2>
          <p className="text-sm text-gray-600">{userData.bio}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button className="flex-1 hover:bg-gray-500 bg-gray-800 text-sm text-white font-semibold py-2 px-4 rounded shadow-sm transition-all">
            <div className="flex items-center justify-center gap-1">
            <FaUserPlus className="text-lg" />
              <span>Follow</span>
            </div>
          </button>
          <button className="flex-1 hover:bg-blue-400 bg-blue-600 text-sm text-white font-semibold py-2 px-4 rounded shadow-sm transition-all">
            <div className="flex items-center justify-center gap-1">
              <FaComment className="text-lg" />
              <span>Message</span>
            </div>
          </button>
        </div>
      </div>

      {/* Empty Post State */}
      <div className="max-w-5xl mx-auto border-t border-gray-300 pt-12 text-center pb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
          <FiPlus className="text-3xl text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No posts yet</h3>
        <p className="text-gray-500">
          Once {userData.fullName} shares something, it'll show up here.
        </p>
      </div>
    </div>
  );
}

export default PublicProfile;
