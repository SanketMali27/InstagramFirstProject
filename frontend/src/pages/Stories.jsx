import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import LoadingSkeleton from '../components/LoadingSkeleton';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function Stories({ embedded = false }) {
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadStories = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/stories/feed');

        if (active) {
          setStoryGroups(response.data.storyGroups || []);
        }
      } catch (requestError) {
        if (active) {
          const message = extractErrorMessage(requestError);
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStories();

    return () => {
      active = false;
    };
  }, []);

  const activeGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const activeStory = activeGroup?.stories?.[activeStoryIndex] || null;
  const currentUserStoryGroup = storyGroups.find((group) => group.user._id === currentUser?._id);

  useEffect(() => {
    if (!activeStory) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      if (activeGroupIndex === null) {
        return;
      }

      const currentGroup = storyGroups[activeGroupIndex];

      if (activeStoryIndex < currentGroup.stories.length - 1) {
        setActiveStoryIndex((current) => current + 1);
      } else if (activeGroupIndex < storyGroups.length - 1) {
        setActiveGroupIndex((current) => current + 1);
        setActiveStoryIndex(0);
      } else {
        setActiveGroupIndex(null);
        setActiveStoryIndex(0);
      }
    }, 5000);

    const storyOwnerId = activeStory.user?._id || activeStory.user;

    if (String(storyOwnerId) !== String(currentUser?._id) && activeStory._id) {
      api.post(`/api/stories/${activeStory._id}/view`).catch(() => {});
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeGroupIndex, activeStory, activeStoryIndex, currentUser?._id, storyGroups]);

  const openStoryGroup = (index) => {
    setActiveGroupIndex(index);
    setActiveStoryIndex(0);
  };

  const handleUploadSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const uploadStory = async () => {
    if (!uploadFile) {
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', uploadFile);

      await api.post('/api/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast({
        type: 'success',
        message: 'Story uploaded successfully'
      });

      setUploadFile(null);
      setUploadPreview(null);

      const response = await api.get('/api/stories/feed');
      setStoryGroups(response.data.storyGroups || []);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className={embedded ? '' : 'min-h-screen bg-slate-100 px-4 py-10'}>
        <div className={embedded ? 'rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70' : 'mx-auto max-w-6xl rounded-[32px] bg-white p-6 shadow-xl'}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">Stories</p>
              <h2 className="text-xl font-black text-slate-900">Fresh moments from your network</h2>
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              Add story
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUploadSelect} />
          </div>

          {loading ? (
            <LoadingSkeleton variant="list" count={1} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                type="button"
                className="flex min-w-[86px] flex-col items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-200">
                  <img
                    src={currentUser?.avatar || 'https://i.pravatar.cc/120'}
                    alt={currentUser?.username}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                  {!currentUserStoryGroup ? (
                    <span className="absolute bottom-0 right-0 rounded-full bg-sky-500 p-1 text-white">
                      <FiPlus />
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-slate-600">Your story</span>
              </button>

              {storyGroups.map((group, index) => (
                <button
                  key={group.user._id}
                  type="button"
                  className="flex min-w-[86px] flex-col items-center gap-2"
                  onClick={() => openStoryGroup(index)}
                >
                  <div className="rounded-full bg-[linear-gradient(135deg,#ec4899,#f97316)] p-[3px]">
                    <img
                      src={group.user.avatar || 'https://i.pravatar.cc/120'}
                      alt={group.user.username}
                      className="h-20 w-20 rounded-full border-[3px] border-white object-cover"
                    />
                  </div>
                  <span className="max-w-[86px] truncate text-xs font-semibold text-slate-600">{group.user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {uploadPreview ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/75 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="text-lg font-bold text-slate-900">Preview story</h3>
              <button type="button" className="rounded-full p-2 text-slate-600" onClick={() => setUploadPreview(null)}>
                <FiX />
              </button>
            </div>
            <div className="bg-slate-950 p-4">
              {uploadFile?.type.startsWith('video/') ? (
                <video src={uploadPreview} controls className="max-h-[70vh] w-full rounded-[24px]" />
              ) : (
                <img src={uploadPreview} alt="Story preview" className="max-h-[70vh] w-full rounded-[24px] object-cover" />
              )}
            </div>
            <div className="flex justify-end gap-3 p-4">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => {
                  setUploadPreview(null);
                  setUploadFile(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={uploadStory}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Share story'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeStory ? (
        <div className="fixed inset-0 z-[95] bg-slate-950 text-white">
          <div className="mx-auto flex h-full max-w-3xl flex-col">
            <div className="grid grid-cols-1 gap-2 p-4">
              <div className="flex gap-1">
                {activeGroup.stories.map((story, index) => (
                  <span key={story._id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                    <span
                      className={`block h-full rounded-full bg-white transition-all ${
                        index < activeStoryIndex ? 'w-full' : index === activeStoryIndex ? 'w-1/2' : 'w-0'
                      }`}
                    />
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeGroup.user.avatar || 'https://i.pravatar.cc/120'}
                    alt={activeGroup.user.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{activeGroup.user.username}</p>
                    <p className="text-xs text-white/60">{new Date(activeStory.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button type="button" className="rounded-full bg-white/10 p-2" onClick={() => setActiveGroupIndex(null)}>
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="relative flex-1" onClick={(event) => {
              const { clientX } = event;
              const midpoint = window.innerWidth / 2;

              if (clientX < midpoint) {
                if (activeStoryIndex > 0) {
                  setActiveStoryIndex((current) => current - 1);
                } else if (activeGroupIndex > 0) {
                  const previousGroupIndex = activeGroupIndex - 1;
                  setActiveGroupIndex(previousGroupIndex);
                  setActiveStoryIndex(storyGroups[previousGroupIndex].stories.length - 1);
                }
                return;
              }

              if (activeStoryIndex < activeGroup.stories.length - 1) {
                setActiveStoryIndex((current) => current + 1);
              } else if (activeGroupIndex < storyGroups.length - 1) {
                setActiveGroupIndex((current) => current + 1);
                setActiveStoryIndex(0);
              } else {
                setActiveGroupIndex(null);
                setActiveStoryIndex(0);
              }
            }}>
              {activeStory.mediaType === 'video' ? (
                <video autoPlay muted controls className="h-full w-full object-contain" src={activeStory.mediaUrl} />
              ) : (
                <img src={activeStory.mediaUrl} alt="Story" className="h-full w-full object-contain" />
              )}

              {activeGroup.user._id === currentUser?._id ? (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm">
                  {activeStory.viewers?.length || 0} viewers
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Stories;
