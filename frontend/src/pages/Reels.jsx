import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMessageCircle, FiVolume2, FiVolumeX } from 'react-icons/fi';

import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { renderTextContent } from '../utils/renderTextContent';

function Reels() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutedMap, setMutedMap] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    let active = true;

    const loadReels = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/posts/reels', {
          params: { page: 1, limit: 10 }
        });

        if (active) {
          setPosts(response.data.posts || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load reels');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReels();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!posts.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.75
      }
    );

    const videos = Object.values(videoRefs.current);
    videos.forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  const toggleMute = (postId) => {
    setMutedMap((current) => ({
      ...current,
      [postId]: !current[postId]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {loading ? (
        <div className="p-6">
          <LoadingSkeleton variant="feed" count={2} />
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-300">{error}</div>
      ) : posts.length ? (
        <div className="h-screen snap-y snap-mandatory overflow-y-auto">
          {posts.map((post) => (
            <section key={post._id} className="relative h-screen snap-start">
              <video
                ref={(element) => {
                  videoRefs.current[post._id] = element;
                }}
                src={post.videoUrl}
                muted={mutedMap[post._id] ?? true}
                loop
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

              <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between gap-6">
                <div className="max-w-xl">
                  <p className="text-lg font-bold">@{post.user?.username}</p>
                  <p className="mt-2 text-sm text-white/85">{renderTextContent(post.caption || '')}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60">Original audio</p>
                </div>

                <div className="flex flex-col items-center gap-5 text-2xl">
                  <button type="button" className="flex flex-col items-center gap-1">
                    <FiHeart />
                    <span className="text-xs">{post.likes?.length || 0}</span>
                  </button>
                  <button type="button" className="flex flex-col items-center gap-1">
                    <FiMessageCircle />
                    <span className="text-xs">{post.comments?.length || 0}</span>
                  </button>
                  <button type="button" onClick={() => toggleMute(post._id)}>
                    {mutedMap[post._id] ?? true ? <FiVolumeX /> : <FiVolume2 />}
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex h-screen items-center justify-center text-sm text-white/70">
          Upload a video post to populate your reels feed.
        </div>
      )}
    </div>
  );
}

export default Reels;
