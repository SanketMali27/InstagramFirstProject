import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBell, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PostCard from '../components/PostCard';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import Stories from './Stories';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function Home() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const loadMoreRef = useRef(null);
  const touchStartY = useRef(null);

  const upsertPost = (updatedPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  const removePost = (postId) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
  };

  const fetchPosts = async (nextPage = 1, replace = false) => {
    try {
      if (replace) {
        setLoading(nextPage === 1);
        setRefreshing(nextPage === 1 && !loading);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(`/api/posts/feed/${currentUser._id}`, {
        params: {
          page: nextPage,
          limit: 6
        }
      });

      const nextPosts = response.data.posts || [];

      setPosts((currentPosts) => {
        if (replace) {
          return nextPosts;
        }

        const existingIds = new Set(currentPosts.map((post) => post._id));
        return [...currentPosts, ...nextPosts.filter((post) => !existingIds.has(post._id))];
      });
      setHasMore(response.data.hasMore);
      setPage(nextPage);
      setError('');
    } catch (requestError) {
      const message = extractErrorMessage(requestError);
      setError(message);
      showToast({
        message
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMore || loadingMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts(page + 1, false);
        }
      },
      {
        threshold: 0.4
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, page]);

  const handleTouchStart = (event) => {
    if (window.scrollY === 0) {
      touchStartY.current = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event) => {
    if (touchStartY.current === null) {
      return;
    }

    const distance = Math.max(event.touches[0].clientY - touchStartY.current, 0);
    setPullDistance(Math.min(distance, 120));
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 85) {
      await fetchPosts(1, true);
    }

    touchStartY.current = null;
    setPullDistance(0);
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,#fdf2f8,transparent_22%),linear-gradient(180deg,#f8fafc,#f1f5f9)] pb-28"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">Instagram Clone</p>
            <h1 className="text-2xl font-black text-slate-900">Your feed</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-slate-100 p-3 text-slate-700"
              onClick={() => fetchPosts(1, true)}
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            </button>
            <Link to="/notification" className="rounded-full bg-slate-100 p-3 text-slate-700">
              <FiBell />
            </Link>
            <Link to="/messages" className="rounded-full bg-slate-900 p-3 text-white">
              <FiMessageCircle />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance ? `${pullDistance / 2}px` : 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {pullDistance > 85 ? 'Release to refresh' : 'Pull to refresh'}
          </p>
        </div>

        <Stories embedded />

        {loading ? (
          <LoadingSkeleton variant="feed" count={3} />
        ) : error ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">Your feed is quiet right now.</p>
            <p className="mt-2 text-sm text-slate-500">
              Follow more creators or upload a post to get things moving.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={upsertPost}
                  onPostDeleted={removePost}
                />
              ))}
              <div ref={loadMoreRef} className="h-10" />
              {loadingMore ? <LoadingSkeleton variant="feed" count={1} /> : null}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4 rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser?.avatar || 'https://i.pravatar.cc/160'}
                    alt={currentUser?.username}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{currentUser?.username}</p>
                    <p className="text-sm text-slate-500">{currentUser?.fullName}</p>
                  </div>
                </div>
                <div className="rounded-[28px] bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Feed improvements enabled</p>
                  <ul className="mt-3 space-y-2">
                    <li>Infinite scroll with observer loading</li>
                    <li>Double-tap to like on post media</li>
                    <li>Pull-to-refresh support on mobile</li>
                    <li>Stories, comments, saved posts, and realtime chat</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
