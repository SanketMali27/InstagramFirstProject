import { useEffect, useMemo, useState } from 'react';
import { FiBookmark, FiHeart, FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../lib/auth';
import { renderTextContent } from '../utils/renderTextContent';

const extractErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

function PostModal({ postId, isOpen, onClose, onPostUpdated, onPostDeleted }) {
  const { showToast } = useToast();
  const currentUser = useMemo(() => getStoredUser(), []);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState({});
  const [replyOpenFor, setReplyOpenFor] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (!isOpen || !postId) {
      return undefined;
    }

    let active = true;

    const loadPost = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/api/posts/${postId}`);

        if (active) {
          setPost(response.data.post);
        }
      } catch (requestError) {
        if (active) {
          setError(extractErrorMessage(requestError));
          showToast({
            message: extractErrorMessage(requestError)
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [isOpen, postId, showToast]);

  const submitComment = async () => {
    if (!commentText.trim()) {
      return;
    }

    try {
      const response = await api.post(`/api/posts/${postId}/comment`, {
        text: commentText
      });

      setPost(response.data.post);
      setCommentText('');
      onPostUpdated?.(response.data.post);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const toggleLike = async () => {
    try {
      const response = await api.put(`/api/posts/${postId}/like`);
      setPost(response.data.post);
      onPostUpdated?.(response.data.post);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const toggleSave = async () => {
    try {
      await api.put(`/api/posts/${postId}/save`);
      showToast({
        type: 'success',
        message: 'Saved posts updated'
      });
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const submitReply = async (commentId) => {
    const text = replyText[commentId]?.trim();

    if (!text) {
      return;
    }

    try {
      const response = await api.post(`/api/posts/${postId}/comments/${commentId}/reply`, {
        text
      });

      setPost(response.data.post);
      setReplyText((current) => ({ ...current, [commentId]: '' }));
      setReplyOpenFor(null);
      setExpandedReplies((current) => ({ ...current, [commentId]: true }));
      onPostUpdated?.(response.data.post);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const toggleCommentLike = async (commentId) => {
    try {
      const response = await api.put(`/api/posts/${postId}/comments/${commentId}/like`);
      setPost(response.data.post);
      onPostUpdated?.(response.data.post);
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post permanently?')) {
      return;
    }

    try {
      await api.delete(`/api/posts/${postId}`);
      showToast({
        type: 'success',
        message: 'Post deleted successfully'
      });
      onPostDeleted?.(postId);
      onClose();
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  const updateCaption = async () => {
    const nextCaption = window.prompt('Edit caption', post?.caption || '');

    if (nextCaption === null) {
      return;
    }

    try {
      const response = await api.put(`/api/posts/${postId}`, {
        caption: nextCaption,
        location: post?.location || ''
      });

      setPost(response.data.post);
      onPostUpdated?.(response.data.post);
      showToast({
        type: 'success',
        message: 'Post updated successfully'
      });
    } catch (requestError) {
      showToast({
        message: extractErrorMessage(requestError)
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
        <div className="grid h-full w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-[minmax(0,1.15fr)_420px]">
          <div className="relative flex items-center justify-center bg-slate-950">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              onClick={onClose}
            >
              <FiX className="text-xl" />
            </button>
            {loading ? (
              <p className="text-sm text-white/70">Loading post...</p>
            ) : error ? (
              <p className="px-6 text-center text-sm text-white/70">{error}</p>
            ) : post?.mediaType === 'video' ? (
              <video controls className="max-h-full max-w-full object-contain" src={post.videoUrl} />
            ) : (
              <img
                src={post?.image}
                alt={post?.caption || 'Post media'}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>

          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={post?.user?.avatar || 'https://i.pravatar.cc/120'}
                  alt={post?.user?.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{post?.user?.username}</p>
                  <p className="text-xs text-slate-500">{post?.location || 'No location set'}</p>
                </div>
                {post?.user?._id === currentUser?._id ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                      onClick={updateCaption}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                      onClick={deletePost}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{renderTextContent(post?.caption || '')}</p>
              </div>

              <div className="mt-5 space-y-4">
                {(post?.comments || []).map((comment) => {
                  const repliesExpanded = expandedReplies[comment._id];

                  return (
                    <div key={comment._id} className="rounded-3xl border border-slate-100 p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.user?.avatar || 'https://i.pravatar.cc/120'}
                          alt={comment.user?.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-slate-900">{comment.user?.username}</span>{' '}
                            <span className="text-slate-700">{renderTextContent(comment.text)}</span>
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            <button type="button" onClick={() => toggleCommentLike(comment._id)}>
                              {comment.likes?.some((likeUser) => String(likeUser) === currentUser?._id) ? 'Unlike' : 'Like'} ({comment.likes?.length || 0})
                            </button>
                            <button type="button" onClick={() => setReplyOpenFor(replyOpenFor === comment._id ? null : comment._id)}>
                              Reply
                            </button>
                            {comment.replies?.length ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedReplies((current) => ({
                                    ...current,
                                    [comment._id]: !current[comment._id]
                                  }))
                                }
                              >
                                {repliesExpanded ? 'Hide replies' : `View ${comment.replies.length} replies`}
                              </button>
                            ) : null}
                          </div>

                          {replyOpenFor === comment._id ? (
                            <div className="mt-3 flex gap-2">
                              <input
                                value={replyText[comment._id] || ''}
                                onChange={(event) =>
                                  setReplyText((current) => ({
                                    ...current,
                                    [comment._id]: event.target.value
                                  }))
                                }
                                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm"
                                placeholder="Write a reply..."
                              />
                              <button
                                type="button"
                                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                onClick={() => submitReply(comment._id)}
                              >
                                Reply
                              </button>
                            </div>
                          ) : null}

                          {repliesExpanded ? (
                            <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply._id}>
                                  <p className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">{reply.user?.username}</span>{' '}
                                    {renderTextContent(reply.text)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" className="text-2xl text-slate-700" onClick={toggleLike}>
                    {post?.likes?.some((user) => user._id === currentUser?._id) ? (
                      <FaHeart className="text-rose-500" />
                    ) : (
                      <FiHeart />
                    )}
                  </button>
                  <button type="button" className="text-2xl text-slate-700">
                    <FiMessageCircle />
                  </button>
                  <button type="button" className="text-2xl text-slate-700">
                    <FiSend />
                  </button>
                </div>
                <button type="button" className="text-2xl text-slate-700" onClick={toggleSave}>
                  <FiBookmark />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">{post?.likes?.length || 0} likes</p>
              <div className="mt-3 flex gap-3">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm"
                />
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  onClick={submitComment}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
