import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PostModal from '../components/PostModal';
import { useToast } from '../context/ToastContext';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function HashtagPage() {
  const { tag } = useParams();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/posts/hashtag/${tag}`);

        if (active) {
          setPosts(response.data.posts || []);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          const message = extractErrorMessage(requestError);
          setError(message);
          showToast({
            message
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      active = false;
    };
  }, [showToast, tag]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 pb-28">
      <div className="mx-auto max-w-6xl rounded-[36px] bg-white p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Hashtag</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">#{tag}</h1>
        <p className="mt-2 text-sm text-slate-500">Posts using this hashtag are indexed automatically.</p>

        <div className="mt-6">
          {loading ? (
            <LoadingSkeleton variant="grid" count={9} />
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
          ) : posts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {posts.map((post) => (
                <button
                  key={post._id}
                  type="button"
                  className="overflow-hidden rounded-[28px]"
                  onClick={() => setSelectedPostId(post._id)}
                >
                  <img
                    src={post.thumbnailUrl || post.image || post.videoUrl}
                    alt={post.caption}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No posts found for this hashtag yet.</p>
          )}
        </div>
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
    </div>
  );
}

export default HashtagPage;
