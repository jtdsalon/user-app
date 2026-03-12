import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthContext';
import { useLayout } from '@/components/common/layouts/layoutContext';
import { createPost } from '@/state/feed';
import { followUserApi, unfollowUserApi } from '@/services/api/userService';
import { followPageApi, unfollowPageApi } from '@/services/api/salonService';
import { getFeedStrings } from '../../properties';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import type { FeedPost, Comment } from '../../types';

export interface UseFeedItemActionProps {
  post: FeedPost;
  currentUser: any;
  onDelete: (id: string) => void;
  onEdit: (post: FeedPost) => void;
  onUpdate: (post: FeedPost) => void;
  onViewSalon?: (id: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onAddComment?: (postId: string, comment: string) => void;
  onUpdateComment?: (postId: string, commentId: string, comment: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onToggleCommentLike?: (postId: string, commentId: string) => void;
}

export function useFeedItemAction({
  post,
  currentUser,
  onDelete,
  onEdit,
  onUpdate,
  onViewSalon,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onToggleCommentLike,
}: UseFeedItemActionProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const s = getFeedStrings();
  const { favorites, toggleFavorite, followedUsers, toggleFollowedUser, savedPosts, toggleSavePost } = useLayout();

  const isSalon = post.userType === 'salon';
  const isPage = post.userType === 'page';
  const isSalonOrPage = isSalon || isPage;
  const authorSalonId = post.authorSalonId || (isSalon ? post.userId : null);
  const isFavourited = isSalonOrPage
    ? authorSalonId ? favorites.includes(authorSalonId) : false
    : followedUsers.includes(post.userId);
  const isOwnPost = currentUser && post.userId === (currentUser.id || 'u_me');
  const isSaved = post.isSaved ?? savedPosts.includes(post.id);
  const isLiked = post.isLiked ?? false;

  const [showComments, setShowComments] = useState(false);
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [commentLikesDialogCommentId, setCommentLikesDialogCommentId] = useState<string | null>(null);
  const [repostConfirmOpen, setRepostConfirmOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [repostLoading, setRepostLoading] = useState(false);

  const handleToggleGlow = useCallback(() => {
    if (onToggleLike) {
      onToggleLike(post.id);
      return;
    }
    onUpdate({
      ...post,
      isLiked: !isLiked,
      likes: post.likes + (isLiked ? -1 : 1),
    });
  }, [onToggleLike, onUpdate, post, isLiked]);

  const handleHeaderClick = useCallback(() => {
    if (isSalonOrPage && onViewSalon && authorSalonId) {
      onViewSalon(authorSalonId);
    } else if (!isPage) {
      navigate(`/profile/${post.userId}`);
    }
  }, [isSalonOrPage, onViewSalon, authorSalonId, isPage, navigate, post.userId]);

  const clearFollowError = useCallback(() => setFollowError(null), []);

  const handleToggleFollow = useCallback(async () => {
    setFollowError(null);
    if (isSalonOrPage && authorSalonId) {
      toggleFavorite(authorSalonId);
      return;
    }
    if (isPage && post.userId) {
      setFollowLoading(true);
      try {
        const res = isFavourited
          ? await unfollowPageApi(post.userId)
          : await followPageApi(post.userId);
        const salonId = res?.data?.data?.salonId;
        if (salonId) toggleFavorite(salonId);
      } catch (err) {
        const message = (err as any)?.response?.data?.message ?? (err as Error)?.message ?? 'Follow action failed';
        setFollowError(message);
        console.error('Follow page failed', err);
      } finally {
        setFollowLoading(false);
      }
      return;
    }
    const targetUserId = post.userId;
    const currentUserId = user?.id || (user as any)?.sub;
    if (!currentUserId || currentUserId === targetUserId) return;
    setFollowLoading(true);
    try {
      if (isFavourited) {
        await unfollowUserApi(targetUserId);
      } else {
        await followUserApi(targetUserId);
      }
      toggleFollowedUser(targetUserId);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const status = err?.response?.status;
      if ((code === 'USER_NOT_FOUND' || status === 404) && targetUserId && !isFavourited) {
        try {
          const res = await followPageApi(targetUserId);
          const salonId = res?.data?.data?.salonId;
          if (salonId) toggleFavorite(salonId);
        } catch (pageErr) {
          const message = (pageErr as any)?.response?.data?.message ?? (pageErr as Error)?.message ?? 'Follow failed';
          setFollowError(message);
          console.error('Follow page fallback failed', pageErr);
        }
      } else {
        const message = err?.response?.data?.message ?? err?.message ?? 'Follow toggle failed';
        setFollowError(message);
        console.error('Follow toggle failed', err);
      }
    } finally {
      setFollowLoading(false);
    }
  }, [isSalonOrPage, isPage, authorSalonId, post.userId, isFavourited, user, toggleFavorite, toggleFollowedUser]);

  const handleToggleSave = useCallback(() => {
    if (onToggleSave) {
      onToggleSave(post.id);
      return;
    }
    toggleSavePost(post.id);
  }, [onToggleSave, post.id, toggleSavePost]);

  const handleRepost = useCallback(() => {
    if (!currentUser) return;
    setRepostConfirmOpen(true);
  }, [currentUser]);

  const confirmRepost = useCallback(() => {
    setRepostConfirmOpen(false);
    setRepostLoading(true);
    const captionParts = [`Reposted from ${post.userName}`, post.caption?.trim()].filter(Boolean);
    dispatch(
      createPost({
        content: captionParts.join('\n\n'),
        image: post.image,
        image_before: post.imageBefore,
        is_transformation: post.isTransformation,
        parent_post_id: post.id,
      }) as any
    );
    onUpdate({ ...post, repostsCount: (post.repostsCount ?? 0) + 1 });
    setRepostLoading(false);
  }, [post, dispatch, onUpdate]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !currentUser) return;
    if (onAddComment) {
      onAddComment(post.id, newComment.trim());
      setNewComment('');
      return;
    }
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id || 'me',
      userName:
        currentUser.name ||
        (currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : s.common.anonymous),
      userAvatar: getFullImageUrl(currentUser?.avatar) || undefined,
      userType: currentUser.type || 'user',
      text: newComment.trim(),
      timeAgo: s.common.justNow,
      likes: 0,
      isLiked: false,
    };
    onUpdate({ ...post, comments: [comment, ...post.comments] });
    setNewComment('');
  }, [newComment, currentUser, onAddComment, post, onUpdate, s.common.anonymous, s.common.justNow]);

  const handleLikeComment = useCallback((commentId: string) => {
    if (onToggleCommentLike) {
      onToggleCommentLike(post.id, commentId);
      return;
    }
    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        const isCurrentlyLiked = c.isLiked || false;
        return { ...c, isLiked: !isCurrentlyLiked, likes: c.likes + (isCurrentlyLiked ? -1 : 1) };
      }
      return c;
    });
    onUpdate({ ...post, comments: updatedComments });
  }, [onToggleCommentLike, post, onUpdate]);

  const handleDeleteComment = useCallback((commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(post.id, commentId);
      return;
    }
    onUpdate({ ...post, comments: post.comments.filter((c) => c.id !== commentId) });
  }, [onDeleteComment, post, onUpdate]);

  const startEditing = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setEditingText('');
  }, []);

  const saveEdit = useCallback((commentId: string) => {
    if (!editingText.trim()) return;
    if (onUpdateComment) {
      onUpdateComment(post.id, commentId, editingText.trim());
      setEditingCommentId(null);
      setEditingText('');
      return;
    }
    const updatedComments = post.comments.map((c) =>
      c.id === commentId ? { ...c, text: editingText.trim() } : c
    );
    onUpdate({ ...post, comments: updatedComments });
    setEditingCommentId(null);
    setEditingText('');
  }, [editingText, onUpdateComment, post, onUpdate]);

  const openLikesDialog = useCallback(() => {
    setCommentLikesDialogCommentId(null);
    setLikesDialogOpen(true);
  }, []);

  const openCommentLikesDialog = useCallback((commentId: string) => {
    setCommentLikesDialogCommentId(commentId);
    setLikesDialogOpen(true);
  }, []);

  const closeLikesDialog = useCallback(() => {
    setLikesDialogOpen(false);
    setCommentLikesDialogCommentId(null);
  }, []);

  return {
    s,
    navigate,
    user,
    isFavourited,
    isOwnPost,
    isSaved,
    isLiked,
    showComments,
    setShowComments,
    likesDialogOpen,
    commentLikesDialogCommentId,
    repostConfirmOpen,
    setRepostConfirmOpen,
    newComment,
    setNewComment,
    editingCommentId,
    editingText,
    setEditingText,
    followLoading,
    followError,
    clearFollowError,
    repostLoading,
    handleToggleGlow,
    handleHeaderClick,
    handleToggleFollow,
    handleToggleSave,
    handleRepost,
    confirmRepost,
    handleAddComment,
    handleLikeComment,
    handleDeleteComment,
    startEditing,
    cancelEditing,
    saveEdit,
    openLikesDialog,
    openCommentLikesDialog,
    closeLikesDialog,
  };
}
