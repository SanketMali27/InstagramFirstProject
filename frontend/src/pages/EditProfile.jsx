import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { getStoredUser, setAuthData } from '../lib/auth';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function EditProfile() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [preview, setPreview] = useState(currentUser?.avatar || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await api.post(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL, formData, {
        baseURL: undefined,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAvatar(response.data.secure_url);
      setPreview(response.data.secure_url);
    } catch (error) {
      showToast({
        message: error.message || 'Avatar upload failed'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const response = await api.put(`/api/users/${currentUser._id}/edit-profile`, {
        fullName,
        bio,
        avatar
      });

      setAuthData({
        token: localStorage.getItem('token'),
        user: response.data.user
      });

      showToast({
        type: 'success',
        message: 'Profile updated successfully'
      });

      navigate('/profile');
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde68a,transparent_28%),linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 py-6 pb-28">
      <div className="mx-auto max-w-2xl rounded-[36px] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">Edit profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Avatar uploads now use frontend environment variables instead of hardcoded Cloudinary values.
        </p>

        <div className="mt-8 flex items-center gap-5">
          <img
            src={preview || 'https://i.pravatar.cc/160'}
            alt="Profile preview"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-sky-100"
          />
          <label className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {uploadingImage ? 'Uploading...' : 'Change photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              rows="5"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="w-full rounded-[24px] border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-[24px] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
