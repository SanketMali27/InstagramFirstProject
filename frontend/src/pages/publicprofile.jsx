import { useEffect, useMemo, useState } from 'react';
import { FiMessageCircle, FiPlayCircle, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import { Link, Navigate, useParams } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PostModal from '../components/PostModal';
import UserConnectionsModal from '../components/UserConnectionsModal';
import { useToast } from '../context/ToastContext';
import { getStoredUser, setAuthData } from '../lib/auth';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function PublicProfile() {
  const { userId, username } = useParams();
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [connectionsModal, setConnectionsModal] = useState({ open: false, type: 'followers' });
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  const identifier = username || userId;

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get(`/api/users/${identifier}`);
        const resolvedUser = userResponse.data.user;
        const postsResponse = await api.get(`/api/users/posts/${resolvedUser._id}`);

        if (active) {
          setUser(resolvedUser);
          setPosts(postsResponse.data.posts || []);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(extractErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [identifier]);

  if (currentUser?.username === username || currentUser?._id === userId) {
    return <Navigate to="/profile" replace />;
  }

  const isFollowing = user?.followers?.some((follower) => follower._id === currentUser?._id);

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await api.put(`/api/users/${user._id}/${endpoint}`);

      const meResponse = await api.get('/api/users/me');
      setAuthData({
        token: localStorage.getItem('token'),
        user: meResponse.data.user
      });

      setUser((current) => ({
        ...current,
        followers: isFollowing
          ? current.followers.filter((follower) => follower._id !== currentUser._id)
          : [...current.followers, { _id: currentUser._id, username: currentUser.username, fullName: currentUser.fullName, avatar: currentUser.avatar }]
      }));
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const loadConnections = async (type) => {
    try {
      setConnectionsModal({ open: true, type });
      setConnectionsLoading(true);
      const response = await api.get(`/api/users/${user._id}/${type}`);
      setConnections(response.data.users || []);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    } finally {
      setConnectionsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_30%),linear-gradient(180deg,#f8fafc,#f1f5f9)] pb-28">
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
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100"
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900">{user?.username}</h1>
                    <button
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        isFollowing ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white'
                      }`}
                      onClick={handleFollowToggle}
                    >
                      <span className="inline-flex items-center gap-2">
                        {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </span>
                    </button>
                    <Link
                      to={`/messages/${user?._id}/${user?.username}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiMessageCircle />
                        Message
                      </span>
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-5">
                    <button type="button" className="text-left">
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
              {posts.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {posts.map((post) => (
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
              ) : (
                <div className="rounded-[32px] bg-slate-50 p-10 text-center">
                  <p className="text-xl font-black text-slate-900">No posts yet.</p>
                  <p className="mt-2 text-sm text-slate-500">Once they post, their grid will show up here.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <PostModal
        postId={selectedPostId}
        isOpen={Boolean(selectedPostId)}
        onClose={() => setSelectedPostId(null)}
        onPostUpdated={(updatedPost) =>
          setPosts((currentPosts) => currentPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)))
        }
        onPostDeleted={(postId) => setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId))}
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

export default PublicProfile;
