import { useEffect, useMemo, useState } from 'react';
import { FiBookmark, FiEdit2, FiGrid, FiLogOut, FiPlayCircle, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PostModal from '../components/PostModal';
import UserConnectionsModal from '../components/UserConnectionsModal';
import { useToast } from '../context/ToastContext';
import { clearAuthData, getStoredUser, setAuthData } from '../lib/auth';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

const tabs = [
  { key: 'posts', label: 'Posts', icon: FiGrid },
  { key: 'reels', label: 'Reels', icon: FiPlayCircle },
  { key: 'saved', label: 'Saved', icon: FiBookmark }
];

function Profile() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [connectionsModal, setConnectionsModal] = useState({ open: false, type: 'followers' });
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [userResponse, postResponse, savedResponse] = await Promise.all([
        api.get('/api/users/me'),
        api.get(`/api/users/posts/${currentUser._id}`),
        api.get(`/api/users/${currentUser._id}/saved`)
      ]);

      setUser(userResponse.data.user);
      setAuthData({
        user: userResponse.data.user,
        token: localStorage.getItem('token')
      });
      setPosts(postResponse.data.posts || []);
      setSavedPosts(savedResponse.data.posts || []);
      setError('');
    } catch (requestError) {
      const message = extractErrorMessage(requestError);
      setError(message);
      showToast({
        message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePost = (updatedPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
    setSavedPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const deletePost = (postId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
    setSavedPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
  };

  const loadConnections = async (type) => {
    try {
      setConnectionsModal({ open: true, type });
      setConnectionsLoading(true);
      const response = await api.get(`/api/users/${currentUser._id}/${type}`);
      setConnections(response.data.users || []);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const renderGrid = (items) => {
    if (!items.length) {
      return (
        <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-900">Nothing to show here yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Share your first post or start saving the ones you love.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((post) => (
          <button
            key={post._id}
            type="button"
            className="group relative overflow-hidden rounded-[28px]"
            onClick={() => setSelectedPostId(post._id)}
          >
            {post.mediaType === 'video' ? (
              <div className="relative">
                <img
                  src={post.thumbnailUrl || post.image}
                  alt={post.caption}
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 text-white">
                  <FiPlayCircle className="text-4xl" />
                </div>
              </div>
            ) : (
              <img
                src={post.image}
                alt={post.caption}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_30%),linear-gradient(180deg,#f8fafc,#f1f5f9)] pb-28">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <LoadingSkeleton variant="grid" count={6} />
        ) : error ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <section className="rounded-[36px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/200'}
                  alt={user?.username}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-pink-100"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900">{user?.username}</h1>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => navigate('/edit-profile')}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiEdit2 />
                        Edit Profile
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => showToast({ type: 'info', message: 'Settings panel can be expanded from here.' })}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiSettings />
                        Settings
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                      onClick={handleLogout}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiLogOut />
                        Logout
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-5">
                    <button type="button" className="text-left" onClick={() => setActiveTab('posts')}>
                      <p className="text-2xl font-black text-slate-900">{posts.length}</p>
                      <p className="text-sm text-slate-500">Posts</p>
                    </button>
                    <button type="button" className="text-left" onClick={() => loadConnections('followers')}>
                      <p className="text-2xl font-black text-slate-900">{user?.followers?.length || 0}</p>
                      <p className="text-sm text-slate-500">Followers</p>
                    </button>
                    <button type="button" className="text-left" onClick={() => loadConnections('following')}>
                      <p className="text-2xl font-black text-slate-900">{user?.following?.length || 0}</p>
                      <p className="text-sm text-slate-500">Following</p>
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-semibold text-slate-900">{user?.fullName}</p>
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">{user?.bio || 'No bio yet.'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[36px] bg-white p-4 shadow-sm">
              <div className="flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        activeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                {activeTab === 'posts' ? renderGrid(posts) : null}
                {activeTab === 'saved' ? renderGrid(savedPosts) : null}
                {activeTab === 'reels' ? (
                  <div className="rounded-[32px] bg-slate-50 p-10 text-center">
                    <p className="text-xl font-black text-slate-900">Reels tab is ready for video-heavy profiles.</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Upload a video post to start building this section.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>

      <PostModal
        postId={selectedPostId}
        isOpen={Boolean(selectedPostId)}
        onClose={() => setSelectedPostId(null)}
        onPostUpdated={updatePost}
        onPostDeleted={deletePost}
      />

      <UserConnectionsModal
        open={connectionsModal.open}
        title={connectionsModal.type === 'followers' ? 'Followers' : 'Following'}
        users={connections}
        loading={connectionsLoading}
        onClose={() => setConnectionsModal({ open: false, type: 'followers' })}
      />
    </div>
  );
}

export default Profile;
