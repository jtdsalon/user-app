import React from 'react';
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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandableText,
  PostActionsBar,
  CommentSection,
  FeedPostHeader,
  FeedPostImage,
} from '../components';
import { LikesDialog } from '../LikesDialog';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { useFeedItemAction } from './hooks/useFeedItemAction';
import type { FeedPost } from '../types';

interface FeedItemProps {
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

export const FeedItem: React.FC<FeedItemProps> = (props) => {
  const theme = useTheme();
  const { post } = props;
  if (!post) return null;
  const {
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
    followLoading,
    followError,
    clearFollowError,
  } = useFeedItemAction(props);

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
        onEdit={() => props.onEdit(post)}
        onDelete={() => props.onDelete(post.id)}
        onRepost={handleRepost}
        followLoading={followLoading}
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
          onViewLikes={post.likes > 0 ? openLikesDialog : undefined}
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
        onClose={closeLikesDialog}
        postId={post.id}
        commentId={commentLikesDialogCommentId}
        currentUserId={props.currentUser?.id || (user as any)?.sub}
      />

      <Snackbar open={!!followError} autoHideDuration={6000} onClose={clearFollowError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={clearFollowError} severity="error" sx={{ width: '100%' }}>
          {followError}
        </Alert>
      </Snackbar>

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
          currentUser={props.currentUser}
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
          onViewCommentLikes={openCommentLikesDialog}
        />
      </Collapse>

      <Dialog
        open={repostConfirmOpen}
        onClose={() => setRepostConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: '24px', backgroundImage: 'none', maxWidth: '400px' },
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
            sx={{ fontSize: '12px', fontWeight: 800, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            {s.common.cancel.toUpperCase()}
          </Button>
          <Button
            onClick={confirmRepost}
            variant="contained"
            color="secondary"
            sx={{ fontSize: '12px', fontWeight: 900, borderRadius: '12px', px: 3, boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.39)' }}
          >
            {s.common.repost.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
