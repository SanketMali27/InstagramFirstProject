import { useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PostModal from '../components/PostModal';
import { useToast } from '../context/ToastContext';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function Explore() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setUserResults([]);
        return;
      }

      try {
        const response = await api.get('/api/users/search', {
          params: { q: query }
        });

        if (active) {
          setUserResults(response.data.users || []);
        }
      } catch (error) {
        if (active) {
          showToast({
            message: extractErrorMessage(error)
          });
        }
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, showToast]);

  const fetchExplore = async (nextPage = 1, replace = false) => {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get('/api/posts/explore', {
        params: {
          page: nextPage,
          limit: 12
        }
      });

      setPosts((currentPosts) => {
        if (replace) {
          return response.data.posts || [];
        }

        const existingIds = new Set(currentPosts.map((post) => post._id));
        return [...currentPosts, ...(response.data.posts || []).filter((post) => !existingIds.has(post._id))];
      });
      setHasMore(response.data.hasMore);
      setPage(nextPage);
      setError('');
    } catch (error) {
      const message = extractErrorMessage(error);
      setError(message);
      showToast({
        message
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchExplore(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMore || loadingMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchExplore(page + 1, false);
        }
      },
      { threshold: 0.2 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, page]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-[36px] bg-white p-5 shadow-xl">
          <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3">
            <FiSearch className="text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users by username or name"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {query.trim() && userResults.length ? (
            <div className="absolute left-5 right-5 top-[calc(100%_-_12px)] z-20 rounded-[28px] border border-slate-100 bg-white p-3 shadow-2xl">
              {userResults.map((user) => (
                <Link
                  key={user._id}
                  to={`/userprofile/${user._id}/${user.username}`}
                  className="flex items-center gap-3 rounded-2xl p-3 hover:bg-slate-50"
                  onClick={() => setQuery('')}
                >
                  <img
                    src={user.avatar || 'https://i.pravatar.cc/120'}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{user.username}</p>
                    <p className="text-sm text-slate-500">
                      {user.fullName} · {user.followerCount} followers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <section className="mt-6 rounded-[36px] bg-white p-5 shadow-xl">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Explore</p>
            <h1 className="text-2xl font-black text-slate-900">Trending outside your network</h1>
          </div>

          {loading ? (
            <LoadingSkeleton variant="grid" count={9} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          ) : (
            <>
              <div className="columns-2 gap-3 sm:columns-3">
                {posts.map((post) => (
                  <button
                    key={post._id}
                    type="button"
                    className="mb-3 block w-full overflow-hidden rounded-[24px]"
                    onClick={() => setSelectedPostId(post._id)}
                  >
                    <img
                      src={post.thumbnailUrl || post.image || post.videoUrl}
                      alt={post.caption}
                      className="w-full rounded-[24px] object-cover"
                    />
                  </button>
                ))}
              </div>
              <div ref={loadMoreRef} className="h-8" />
              {loadingMore ? <LoadingSkeleton variant="grid" count={3} /> : null}
            </>
          )}
        </section>
      </div>

      <PostModal
        postId={selectedPostId}
        isOpen={Boolean(selectedPostId)}
        onClose={() => setSelectedPostId(null)}
        onPostUpdated={(updatedPost) =>
          setPosts((currentPosts) => currentPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)))
        }
        onPostDeleted={(postId) =>
          setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId))
        }
      />
    </div>
  );
}

export default Explore;
