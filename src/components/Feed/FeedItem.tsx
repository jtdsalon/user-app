import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { FeedPost, Comment } from './types';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../common/layouts/layoutContext';
import { useAuth } from '../Auth/AuthContext';
import { createPost } from '@/state/feed';
import { followUserApi, unfollowUserApi } from '@/services/api/userService';
import { followPageApi, unfollowPageApi } from '@/services/api/salonService';
import {
  ExpandableText,
  PostActionsBar,
  CommentSection,
  FeedPostHeader,
  FeedPostImage,
} from './components';
import { LikesDialog } from './LikesDialog';
import { getFeedStrings } from './properties';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface FeedItemProps {
  post: FeedPost;
  currentUser: any;
  onDelete: (id: string) => void;
  onEdit: (post: FeedPost) => void;
  onUpdate: (post: FeedPost) => void;
  onViewSalon?: (id: string) => void;
  /** API-backed: when provided, uses API instead of local onUpdate */
  onToggleLike?: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onAddComment?: (postId: string, comment: string) => void;
  onUpdateComment?: (postId: string, commentId: string, comment: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onToggleCommentLike?: (postId: string, commentId: string) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({
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
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
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

  // Source of truth: post.isLiked from API/Redux (never local-only state)
  const isLiked = post.isLiked ?? false;
  const [showComments, setShowComments] = useState(false);
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [commentLikesDialogCommentId, setCommentLikesDialogCommentId] = useState<string | null>(null);
  const [repostConfirmOpen, setRepostConfirmOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleToggleGlow = () => {
    if (onToggleLike) {
      onToggleLike(post.id);
      return;
    }
    onUpdate({
      ...post,
      isLiked: !isLiked,
      likes: post.likes + (isLiked ? -1 : 1),
    });
  };

  const handleHeaderClick = () => {
    if (isSalonOrPage && onViewSalon && authorSalonId) {
      onViewSalon(authorSalonId);
    } else if (!isPage) {
      navigate(`/profile/${post.userId}`);
    }
  };

  const handleToggleFollow = async () => {
    if (isSalonOrPage && authorSalonId) {
      toggleFavorite(authorSalonId);
      return;
    }
    // Page post without authorSalonId (e.g. only page_id available) - use page follow API
    if (isPage && post.userId) {
      try {
        const res = isFavourited
          ? await unfollowPageApi(post.userId)
          : await followPageApi(post.userId);
        const salonId = res?.data?.data?.salonId;
        if (salonId) toggleFavorite(salonId);
      } catch (err) {
        console.error('Follow page failed', err);
      }
      return;
    }
    // User follow flow
    const targetUserId = post.userId;
    const currentUserId = user?.id || (user as any)?.sub;
    if (!currentUserId || currentUserId === targetUserId) return;
    try {
      if (isFavourited) {
        await unfollowUserApi(targetUserId);
      } else {
        await followUserApi(targetUserId);
      }
      toggleFollowedUser(targetUserId);
    } catch (err: any) {
      // Fallback: if user not found, may be page_id - try page follow API
      const code = err?.response?.data?.code;
      const status = err?.response?.status;
      if ((code === 'USER_NOT_FOUND' || status === 404) && targetUserId && !isFavourited) {
        try {
          const res = await followPageApi(targetUserId);
          const salonId = res?.data?.data?.salonId;
          if (salonId) toggleFavorite(salonId);
        } catch (pageErr) {
          console.error('Follow page fallback failed', pageErr);
        }
      } else {
        console.error('Follow toggle failed', err);
      }
    }
  };

  const handleToggleSave = () => {
    if (onToggleSave) {
      onToggleSave(post.id);
      return;
    }
    toggleSavePost(post.id);
  };

  const handleRepost = () => {
    if (!currentUser) return;
    setRepostConfirmOpen(true);
  };

  const confirmRepost = () => {
    setRepostConfirmOpen(false);

    const captionParts = [`Reposted from ${post.userName}`, post.caption?.trim()].filter(Boolean);

    dispatch(
      createPost({
        content: captionParts.join('\n\n'),
        image: post.image,
        image_before: post.imageBefore,
        is_transformation: post.isTransformation,
        parent_post_id: post.id,
      })
    );

    onUpdate({
      ...post,
      repostsCount: (post.repostsCount ?? 0) + 1,
    });
  };

  const handleAddComment = () => {
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
        (currentUser.firstName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : s.common.anonymous),
      userAvatar: getFullImageUrl(currentUser?.avatar) || undefined,
      userType: currentUser.type || 'user',
      text: newComment.trim(),
      timeAgo: s.common.justNow,
      likes: 0,
      isLiked: false,
    };

    onUpdate({
      ...post,
      comments: [comment, ...post.comments],
    });
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    if (onToggleCommentLike) {
      onToggleCommentLike(post.id, commentId);
      return;
    }
    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        const isCurrentlyLiked = c.isLiked || false;
        return {
          ...c,
          isLiked: !isCurrentlyLiked,
          likes: c.likes + (isCurrentlyLiked ? -1 : 1),
        };
      }
      return c;
    });
    onUpdate({ ...post, comments: updatedComments });
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(post.id, commentId);
      return;
    }
    const updatedComments = post.comments.filter((c) => c.id !== commentId);
    onUpdate({ ...post, comments: updatedComments });
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const saveEdit = (commentId: string) => {
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
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 0,
        bgcolor: 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 3,
        maxWidth: 520,
        mx: 'auto',
        transition: 'all 0.3s ease',
      }}
    >
      <FeedPostHeader
        post={post}
        isFavourited={isFavourited}
        isOwnPost={!!isOwnPost}
        onHeaderClick={handleHeaderClick}
        onToggleFollow={handleToggleFollow}
        onEdit={() => onEdit(post)}
        onDelete={() => onDelete(post.id)}
        onRepost={handleRepost}
      />

      <FeedPostImage
        image={post.image}
        imageBefore={post.imageBefore}
        isTransformation={post.isTransformation}
        onClick={() => navigate(`/post/${post.id}`)}
      />

      <CardActions sx={{ px: 0, pt: 1, pb: 0, justifyContent: 'space-between' }}>
        <PostActionsBar
          likes={post.likes}
          isLiked={isLiked}
          onToggleGlow={handleToggleGlow}
          onViewLikes={post.likes > 0 ? () => { setCommentLikesDialogCommentId(null); setLikesDialogOpen(true); } : undefined}
          commentsCount={post.comments.length}
          showComments={showComments}
          onToggleComments={() => setShowComments(!showComments)}
          repostsCount={post.repostsCount}
          onRepost={handleRepost}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
        />
      </CardActions>

      <LikesDialog
        open={likesDialogOpen}
        onClose={() => {
          setLikesDialogOpen(false);
          setCommentLikesDialogCommentId(null);
        }}
        postId={post.id}
        commentId={commentLikesDialogCommentId}
        currentUserId={currentUser?.id || (user as any)?.sub}
      />

      <CardContent sx={{ px: 0, py: 1 }}>
        <ExpandableText text={post.caption || ''} limit={120} />

        {post.parentPost && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '24px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              },
            }}
            onClick={() => navigate(`/post/${post.parentPost?.id}`)}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 800 }}>
                {post.parentPost.userName}
              </Typography>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary', opacity: 0.6 }}>
                {post.parentPost.timeAgo}
              </Typography>
            </Stack>
            {post.parentPost.caption && (
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: post.parentPost.image ? 1 : 0 }}>
                {post.parentPost.caption}
              </Typography>
            )}
            {post.parentPost.image && (
              <Box
                component="img"
                src={getFullImageUrl(post.parentPost.image) || post.parentPost.image}
                alt=""
                sx={{ width: '100%', borderRadius: '16px', maxHeight: 200, objectFit: 'cover' }}
              />
            )}
          </Box>
        )}
      </CardContent>

      <Collapse in={showComments} timeout="auto">
        <CommentSection
          comments={post.comments}
          currentUser={currentUser}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onAddComment={handleAddComment}
          editingCommentId={editingCommentId}
          editingText={editingText}
          onEditingTextChange={setEditingText}
          onStartEdit={startEditing}
          onCancelEdit={cancelEditing}
          onSaveEdit={saveEdit}
          onLikeComment={handleLikeComment}
          onDeleteComment={handleDeleteComment}
          onViewCommentLikes={(commentId) => {
            setCommentLikesDialogCommentId(commentId);
            setLikesDialogOpen(true);
          }}
        />
      </Collapse>

      <Dialog
        open={repostConfirmOpen}
        onClose={() => setRepostConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            backgroundImage: 'none',
            maxWidth: '400px',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 800, pb: 1 }}>
          {s.repost.confirmTitle}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 300 }}>
            {s.repost.confirmDescription}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setRepostConfirmOpen(false)}
            sx={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {s.common.cancel.toUpperCase()}
          </Button>
          <Button
            onClick={confirmRepost}
            variant="contained"
            color="secondary"
            sx={{
              fontSize: '12px',
              fontWeight: 900,
              borderRadius: '12px',
              px: 3,
              boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.39)',
            }}
          >
            {s.common.repost.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
