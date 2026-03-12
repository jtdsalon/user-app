import React, { useEffect, useRef } from 'react';
import { Box, Typography, Stack, Avatar } from '@mui/material';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@mui/material/styles';
import { getFullImageUrl } from '@/lib/util/imageUrl';

export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface MentionSuggestionDropdownProps {
  users: MentionUser[];
  open: boolean;
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Position: 'above' | 'below' */
  position?: 'above' | 'below';
}

export const MentionSuggestionDropdown: React.FC<MentionSuggestionDropdownProps> = ({
  users,
  open,
  selectedIndex,
  onSelect,
  onClose,
  anchorRef,
  position = 'below',
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideDropdown = containerRef.current && !containerRef.current.contains(target);
      const outsideAnchor = !anchorRef?.current || !anchorRef.current.contains(target);
      if (outsideDropdown && outsideAnchor) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || users.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: position === 'below' ? -10 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'below' ? -10 : 10 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          ...(position === 'above'
            ? { bottom: '100%' }
            : { top: '100%' }),
          zIndex: 10,
          background: isDarkMode ? '#1e293b' : '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: `1px solid ${theme.palette.divider}`,
          maxHeight: '200px',
          overflowY: 'auto',
          ...(position === 'below'
            ? { marginTop: 8 }
            : { marginBottom: 8 }),
        }}
      >
        <Stack spacing={0.5} sx={{ p: 1 }}>
          {users.map((user, i) => (
            <Box
              key={user.id}
              onClick={() => onSelect(user)}
              sx={{
                p: 1,
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: i === selectedIndex ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                src={getFullImageUrl(user.avatar) || user.avatar || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: !(getFullImageUrl(user.avatar) || user.avatar) ? 'action.hover' : undefined,
                }}
              >
                {!(getFullImageUrl(user.avatar) || user.avatar) && <User size={16} strokeWidth={1.5} />}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 800 }}>
                  {user.name}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                  @{user.username}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </motion.div>
    </AnimatePresence>
  );
};
