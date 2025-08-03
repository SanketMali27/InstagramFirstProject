import { useState, useRef } from 'react';
import { FiX, FiMapPin, FiUserPlus, FiMusic, FiSmile } from 'react-icons/fi';
import { FaRegImage, FaRegFaceSmile } from 'react-icons/fa6';
import { IoMdClose } from 'react-icons/io';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BsThreeDots, BsEmojiSmile } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';

import { Link } from 'react-router-dom';

function CreatePostPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [showLocation, setShowLocation] = useState('');
  const [showTagPeople, setShowTagPeople] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // store the actual File object!
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handlePost = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')); // get logged in user
      const userId = user?._id;


      //  const fileInput = fileInputRef.current;
      // if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      // alert("No file selected!");
      // return;
      //}

      const formData = new FormData();
      formData.append('image', selectedImage); // not fileInputRef anymore
      // the actual file
      formData.append('caption', caption);
      formData.append('location', showLocation);
      formData.append('userId', userId);

      const res = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json(); // directly get parsed JSON
      console.log(data);

      if (res.ok) {
        alert('✅ Post created successfully!');
        setSelectedImage(null);
        setCaption('');
      } else {
        alert(`❌ Error: ${data.message}`);
      }

    } catch (err) {
      console.error(err);
      alert('❌ Something went wrong!');
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto">

          <Link to="/" className="p-1">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-xl font-bold">Create new post</h1>
          <button
            className={`text-blue-500 font-semibold ${!selectedImage && 'opacity-50'}`}
            disabled={!selectedImage}
            onClick={handlePost}
          >
            Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        {!selectedImage ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <FaRegImage className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-light mb-4">Drag photos and videos here</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
              onClick={() => fileInputRef.current.click()}
            >
              Select from device
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-white">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="w-full aspect-square object-cover"
              />

              <button
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full"
                onClick={removeImage}
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            {/* Caption and Options */}
            <div className="p-4">
              <div className="mb-4">
                <textarea
                  placeholder="Write a caption..."
                  className="w-full border-none focus:ring-0 resize-none text-sm"
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <div className="flex justify-between items-center text-gray-500">
                  <div className="flex space-x-2">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <BsEmojiSmile className="text-xl" />
                    </button>
                  </div>
                  <span className="text-xs">{caption.length}/2,200</span>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">

                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex items-center w-full">
                    <HiOutlineLocationMarker className="text-2xl text-blue-500 mr-3" />
                    <input
                      type="text"
                      placeholder="Add location..."
                      value={showLocation}
                      onChange={(e) => setShowLocation(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                    />
                  </div>
                  <BsThreeDots className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>



                <button
                  className="flex items-center justify-between w-full py-2"
                  onClick={() => setShowTagPeople(!showTagPeople)}
                >
                  <div className="flex items-center">
                    <FiUserPlus className="text-xl mr-3" />
                    <span>Tag people</span>
                  </div>
                  <BsThreeDots />
                </button>

                <button
                  className="flex items-center justify-between w-full py-2"
                  onClick={() => setShowMusic(!showMusic)}
                >
                  <div className="flex items-center">
                    <FiMusic className="text-xl mr-3" />
                    <span>Add music</span>
                  </div>
                  <BsThreeDots />
                </button>
              </div>

              {/* Advanced Settings */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="flex items-center justify-between w-full py-2">
                  <span>Advanced settings</span>
                  <BsThreeDots />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
}

export default CreatePostPage;