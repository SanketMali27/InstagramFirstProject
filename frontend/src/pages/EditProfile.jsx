import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [fullName, setFullName] = useState(currentUser.fullName || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [preview, setPreview] = useState(currentUser.avatar || "");

  // ✅ Handle image upload to Cloudinary
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Insta-Clone"); // set in Cloudinary

    const res = await fetch("https://api.cloudinary.com/v1_1/doqqy5ays/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAvatar(data.secure_url);
    console.log("Avatar URl :",data );
    setPreview(data.secure_url);
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser._id}/edit-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, bio, avatar }),
      });

      const updatedUser = await res.json();
      
      if (res.ok) {
        alert('✅ Profile updated successfully!');
       }
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/profile"); // redirect to profile
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      
      {/* Avatar Preview */}
      <div className="flex justify-center mb-4">
        <img
          src={preview || "https://i.pravatar.cc/150"}
          alt="Avatar"
          className="w-24 h-24 rounded-full border"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <input
          type="file"
          onChange={handleAvatarUpload}
          className="block w-full text-sm text-gray-600"
        />

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg p-2"
        />

        {/* Bio */}
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded-lg p-2"
        ></textarea>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
