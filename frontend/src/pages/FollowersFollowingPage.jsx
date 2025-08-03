import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaArrowLeft, FaUser } from "react-icons/fa";

function FollowersFollowingPage() {
  const { id,username } = useParams();

  const location = useLocation();
  const [users, setUsers] = useState([]);
  const isFollowersPage = location.pathname.includes("followers");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint = isFollowersPage ? "followers" : "following";
        const res = await fetch(`http://localhost:5000/api/users/${id}/${endpoint}`);
        const data = await res.json();
        setUsers(data);
        console.log("USers:", users);
      } catch (err) {
        console.error("Error fetching list:", err);
      }
    };
    fetchUsers();
  }, [id, isFollowersPage]);
  
  const handleFollow = async () => {
  try {
    await fetch(`http://localhost:5000/api/users/${profileUser._id}/follow`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser._id })
    });

    // ✅ Update frontend state
    setCurrentUser(prev => ({
      ...prev,
      following: prev.following.includes(profileUser._id)
        ? prev.following.filter(id => id !== profileUser._id)
        : [...prev.following, profileUser._id]
    }));
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
<header className="bg-white shadow-md p-4 sticky top-0 z-10">
  <div className="flex justify-between items-center max-w-5xl mx-auto">
    {/* Back Button */}
    <Link
      to={`/userprofile/${username}`}
      className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
    >
      <FaArrowLeft className="text-2xl" />
      <span className="text-sm font-medium">Back</span>
    </Link>

    {/* Center Title */}
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900">
        {isFollowersPage ? "Followers" : "Following"}
      </h2>
      <p className="text-xs text-gray-500">of @{username}</p>
    </div>

    {/* Placeholder for alignment (keeps title centered) */}
    <div className="w-16"></div>
  </div>
</header>


      {/* User List */}
      <main className="p-4 max-w-md mx-auto">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">
            No {isFollowersPage ? "followers" : "following"} yet.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 bg-white shadow-sm rounded-lg p-3 mb-3"
            >
              <img
                src={u.avatar || "https://i.pravatar.cc/100"}
                alt={u.username}
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <p className="font-semibold">{u.fullName}</p>
                <p className="text-gray-500 text-sm">@{u.username}</p>
              </div>
              <Link
                to={`/userprofile/${u._id}/${u.username}`}
                className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                View
              </Link>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default FollowersFollowingPage;
