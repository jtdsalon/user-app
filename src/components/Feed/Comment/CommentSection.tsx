import React from 'react';
import { Box, Stack, Divider, Typography, Fade } from '@mui/material';
import { getFeedStrings } from '../properties';
import { Comment } from '../types';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: { id?: string; avatar?: string; name?: string; firstName?: string; lastName?: string; type?: string } | null;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
  editingCommentId: string | null;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onViewCommentLikes?: (commentId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUser,
  newComment,
  onNewCommentChange,
  onAddComment,
  editingCommentId,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onLikeComment,
  onDeleteComment,
  onViewCommentLikes,
}) => {
  const s = getFeedStrings();
  return (
    <Box sx={{ mt: 1, px: 0 }}>
      <Divider sx={{ mb: 2, opacity: 0.5 }} />

      <Stack spacing={2} sx={{ mb: 2, maxHeight: 450, overflowY: 'auto', pr: 1 }}>
        {comments.map((comment) => (
          <Fade in key={comment.id} appear={false}>
            <Box sx={{ display: 'block' }}>
              <CommentItem
                comment={comment}
                currentUserId={currentUser?.id || 'me'}
                isEditing={editingCommentId === comment.id}
                editingText={editingText}
                onEditingTextChange={onEditingTextChange}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onLike={onLikeComment}
                onDelete={onDeleteComment}
                onViewLikes={onViewCommentLikes}
              />
            </Box>
          </Fade>
        ))}
      </Stack>

      {currentUser ? (
        <CommentInput
          currentUser={currentUser}
          value={newComment}
          onChange={onNewCommentChange}
          onSubmit={onAddComment}
        />
      ) : (
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '10px',
            color: 'text.secondary',
            fontStyle: 'italic',
            py: 2,
            letterSpacing: '0.05em',
          }}
        >
          {s.comments.joinToContribute}
        </Typography>
      )}
    </Box>
  );
};
