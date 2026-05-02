import { useMemo, useRef, useState } from 'react';
import { FiFilm, FiImage, FiMapPin, FiMusic, FiSmile, FiTag, FiUploadCloud } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function CreatePostPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast({
        message: 'Select an image or video first.'
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('caption', caption);
      formData.append('location', location);

      await api.post('/api/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast({
        type: 'success',
        message: 'Post created successfully'
      });

      navigate('/');
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fce7f3,transparent_25%),linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 py-6 pb-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-white shadow-xl">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-slate-950 p-4">
            {previewUrl ? (
              selectedFile?.type.startsWith('video/') ? (
                <video src={previewUrl} controls className="h-full max-h-[80vh] w-full rounded-[28px] object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="h-full max-h-[80vh] w-full rounded-[28px] object-contain" />
              )
            ) : (
              <button
                type="button"
                className="flex min-h-[520px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/20 text-white/80"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUploadCloud className="text-5xl" />
                <p className="mt-4 text-xl font-bold">Drag, drop, or select media</p>
                <p className="mt-2 text-sm text-white/60">Images and reels both work here now.</p>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || 'https://i.pravatar.cc/120'}
                alt={currentUser?.username}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-900">{currentUser?.username}</p>
                <p className="text-sm text-slate-500">{currentUser?.fullName}</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="caption">
                  Caption
                </label>
                <textarea
                  id="caption"
                  rows="6"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="Write a caption with #hashtags or @mentions"
                />
                <p className="mt-2 text-xs text-slate-400">{caption.length}/2200</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  placeholder="Add a location"
                />
              </div>

              <div className="grid gap-3 rounded-[28px] bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <FiMapPin />
                  Location metadata is saved with your post.
                </div>
                <div className="flex items-center gap-3">
                  <FiTag />
                  Hashtags in the caption are indexed automatically.
                </div>
                <div className="flex items-center gap-3">
                  <FiSmile />
                  Mentions create notifications for tagged users.
                </div>
                <div className="flex items-center gap-3">
                  <FiMusic />
                  Video uploads appear in the Reels feed automatically.
                </div>
                <div className="flex items-center gap-3">
                  {selectedFile?.type.startsWith('video/') ? <FiFilm /> : <FiImage />}
                  {selectedFile
                    ? `Selected ${selectedFile.type.startsWith('video/') ? 'video' : 'image'}: ${selectedFile.name}`
                    : 'Select a file to see type details'}
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-[24px] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'Publishing...' : 'Share Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
