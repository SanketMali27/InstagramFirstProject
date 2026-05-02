import { useMemo, useRef, useState } from 'react';
import { FiBookmark, FiHeart, FiMapPin, FiMessageCircle, FiMoreHorizontal, FiSend } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import { renderTextContent } from '../utils/renderTextContent';
import PostModal from './PostModal';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { showToast } = useToast();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartBurst, setHeartBurst] = useState(null);
  const imageContainerRef = useRef(null);
  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);

  const author = post.user || {};
  const isOwner = author._id === currentUser?._id;
  const isLiked = post.likes?.some((likeUser) => {
    if (typeof likeUser === 'string') {
      return likeUser === currentUser?._id;
    }

    return likeUser?._id === currentUser?._id;
  });

  const handleLike = async () => {
    try {
      const response = await api.put(`/api/posts/${post._id}/like`);
      onPostUpdated?.(response.data.post);
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/posts/${post._id}/save`);
      showToast({
        type: 'success',
        message: 'Saved posts updated'
      });
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) {
      return;
    }

    try {
      await api.delete(`/api/posts/${post._id}`);
      showToast({
        type: 'success',
        message: 'Post deleted successfully'
      });
      onPostDeleted?.(post._id);
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    } finally {
      setMenuOpen(false);
    }
  };

  const handleEdit = async () => {
    const nextCaption = window.prompt('Edit caption', post.caption || '');

    if (nextCaption === null) {
      return;
    }

    try {
      const response = await api.put(`/api/posts/${post._id}`, {
        caption: nextCaption,
        location: post.location || ''
      });

      onPostUpdated?.(response.data.post);
      showToast({
        type: 'success',
        message: 'Post updated successfully'
      });
    } catch (error) {
      showToast({
        message: extractErrorMessage(error)
      });
    } finally {
      setMenuOpen(false);
    }
  };

  const handleMediaTap = async (event) => {
    const now = Date.now();

    if (now - lastTapRef.current < 280) {
      if (!isLiked) {
        await handleLike();
      }

      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();

        setHeartBurst({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });

        window.setTimeout(() => setHeartBurst(null), 650);
      }

      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
      }
    } else {
      tapTimeoutRef.current = window.setTimeout(() => {
        setIsModalOpen(true);
      }, 220);
    }

    lastTapRef.current = now;
  };

  return (
    <>
      <article className="overflow-hidden rounded-[30px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3">
          <Link to={`/userprofile/${author._id || author.username}/${author.username}`} className="flex items-center gap-3">
            <img
              src={author.avatar || 'https://i.pravatar.cc/120'}
              alt={author.username}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900">{author.username}</p>
              <p className="text-xs text-slate-500">{post.location || 'Instagram Clone'}</p>
            </div>
          </Link>
          <div className="relative ml-auto">
            <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen((current) => !current)}>
              <FiMoreHorizontal />
            </button>
            {menuOpen && isOwner ? (
              <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={handleEdit}>
                  Edit caption
                </button>
                <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={handleDelete}>
                  Delete post
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={imageContainerRef}
          className="relative mt-4 overflow-hidden rounded-[26px] bg-slate-100"
          onClick={handleMediaTap}
        >
          {post.mediaType === 'video' ? (
            <video src={post.videoUrl} controls className="aspect-[4/5] w-full object-cover" />
          ) : (
            <img src={post.image} alt={post.caption || 'Post'} className="aspect-[4/5] w-full object-cover" />
          )}
          {heartBurst ? (
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-ping text-6xl text-white drop-shadow-2xl"
              style={{ left: heartBurst.x, top: heartBurst.y }}
            >
              <FaHeart />
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-2xl text-slate-700">
            <button type="button" onClick={handleLike}>
              {isLiked ? <FaHeart className="text-rose-500" /> : <FiHeart />}
            </button>
            <button type="button" onClick={() => setIsModalOpen(true)}>
              <FiMessageCircle />
            </button>
            <button type="button">
              <FiSend />
            </button>
          </div>
          <button type="button" className="text-2xl text-slate-700" onClick={handleSave}>
            <FiBookmark />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-900">{post.likes?.length || 0} likes</p>
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{author.username}</span>{' '}
          {renderTextContent(post.caption || '')}
        </p>

        {post.comments?.length ? (
          <button
            type="button"
            className="mt-3 text-sm text-slate-500"
            onClick={() => setIsModalOpen(true)}
          >
            View all {post.comments.length} comments
          </button>
        ) : null}

        {post.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-sky-700">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-sky-50 px-3 py-1 font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <FiMapPin />
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </article>

      <PostModal
        postId={post._id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostUpdated={onPostUpdated}
        onPostDeleted={onPostDeleted}
      />
    </>
  );
}

export default PostCard;
