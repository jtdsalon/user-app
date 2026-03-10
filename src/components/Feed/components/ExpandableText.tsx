import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { getFeedStrings } from '../properties';
import { splitContentWithMentions } from '../utils/parseMentions';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  isComment?: boolean;
  onMentionClick?: (username: string) => void;
}

function renderTextWithMentions(
  content: string,
  onMentionClick?: (username: string) => void
) {
  const parts = splitContentWithMentions(content);
  return parts.map((part, i) => {
    if (typeof part === 'string') return part;
    const { username } = part;
    return (
      <Box
        key={i}
        component="span"
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onMentionClick?.(username);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onMentionClick?.(username);
          }
        }}
        sx={{
          color: 'secondary.main',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          '&:hover': { textDecoration: 'underline' },
          '&:focus-visible': { textDecoration: 'underline', outline: '1px solid' },
        }}
      >
        @{username}
      </Box>
    );
  });
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  limit = 90,
  isComment = false,
  onMentionClick,
}) => {
  const s = getFeedStrings();
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = text.length > limit;
  const displayText = isExpanded
    ? text
    : `${text.slice(0, limit)}${needsExpansion ? '...' : ''}`;

  const handleMentionClick = useCallback(
    (username: string) => {
      if (onMentionClick) {
        onMentionClick(username);
      } else {
        // Ready for profile navigation; log for now
        console.log(`Mention clicked: ${username}`);
      }
    },
    [onMentionClick]
  );

  return (
    <Typography
      sx={{
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'text.secondary',
        fontWeight: isComment ? 400 : 300,
      }}
    >
      {renderTextWithMentions(displayText, handleMentionClick)}
      {needsExpansion && (
        <Typography
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          sx={{
            display: 'inline-block',
            ml: 0.5,
            fontSize: '11px',
            fontWeight: 900,
            color: 'secondary.main',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            '&:hover': { textDecoration: 'underline', opacity: 0.8 },
          }}
        >
          {isExpanded ? s.expandableText.less : s.expandableText.readMore}
        </Typography>
      )}
    </Typography>
  );
};
