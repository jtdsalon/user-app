import React, { useState, useRef, useCallback } from 'react';
import { Box, Typography, Avatar, Stack, IconButton, InputBase } from '@mui/material';
import { getFeedStrings } from '../properties';
import { Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { searchUsersApi } from '@/services/api/userService';
import { MentionSuggestionDropdown, type MentionUser } from '../components/MentionSuggestionDropdown';

const SEARCH_DEBOUNCE_MS = 250;

interface CommentInputProps {
  currentUser: { id?: string; avatar?: string };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  currentUser,
  value,
  onChange,
  onSubmit,
  placeholder,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const s = getFeedStrings();
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart ?? 0;
      onChange(newValue);
      const textBeforeCursor = newValue.substring(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');
      if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')) {
        const query = textBeforeCursor.substring(lastAt + 1);
        if (!query.includes(' ')) {
          setShowSuggestions(true);
          setSelectedIndex(0);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
            try {
              const res = await searchUsersApi(query);
              const data = res?.data?.data ?? [];
              setSuggestions(
                Array.isArray(data)
                  ? data.map((u: any) => ({
                      id: u.id,
                      name: u.name || 'User',
                      username: u.username || u.id,
                      avatar: u.avatar,
                    }))
                  : []
              );
            } catch {
              setSuggestions([]);
            }
            debounceRef.current = null;
          }, SEARCH_DEBOUNCE_MS);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    },
    [onChange]
  );

  const handleSelectMention = useCallback(
    (user: MentionUser) => {
      const input = inputRef.current;
      const cursorPosition = input ? (input as HTMLTextAreaElement).selectionStart ?? value.length : value.length;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');
      const newValue = value.substring(0, lastAt) + `@${user.username} ` + value.substring(cursorPosition);
      onChange(newValue);
      setShowSuggestions(false);
      setTimeout(() => {
        input?.focus();
        const nextPos = lastAt + user.username.length + 2;
        try {
          (input as HTMLTextAreaElement).setSelectionRange(nextPos, nextPos);
        } catch {}
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (showSuggestions && suggestions.length > 0) {
          handleSelectMention(suggestions[selectedIndex]);
          return;
        }
        onSubmit();
        return;
      }
      if (!showSuggestions || suggestions.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
      }
    },
    [showSuggestions, suggestions, selectedIndex, onSubmit, handleSelectMention]
  );

  return (
    <Box sx={{ mt: 2, pt: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ pb: 1 }}>
        <Avatar
          src={getFullImageUrl(currentUser.avatar) || currentUser.avatar || undefined}
          onClick={() => navigate('/profile')}
          sx={{
            width: 32,
            height: 32,
            mb: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            cursor: 'pointer',
            bgcolor: !(getFullImageUrl(currentUser.avatar) || currentUser.avatar) ? 'action.hover' : undefined,
          }}
        >
          {!(getFullImageUrl(currentUser.avatar) || currentUser.avatar) && <User size={16} strokeWidth={1.5} />}
        </Avatar>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MentionSuggestionDropdown
            users={suggestions}
            open={showSuggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSelectMention}
            onClose={() => setShowSuggestions(false)}
            position="above"
          />
          <InputBase
            placeholder={placeholder ?? s.comments.contributePlaceholder}
            fullWidth
            multiline
            inputRef={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{
              fontSize: '13px',
              py: 0.5,
              fontWeight: 300,
              color: 'text.primary',
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:focus-within': {
                borderBottom: `2px solid ${theme.palette.secondary.main}`,
              },
            }}
          />
          <IconButton
            size="small"
            onClick={onSubmit}
            disabled={!value.trim()}
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 4,
              color: 'secondary.main',
              p: 0,
              opacity: value.trim() ? 1 : 0,
              transition: 'all 0.3s',
              transform: value.trim() ? 'scale(1)' : 'scale(0.8)',
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            <Send size={18} strokeWidth={2.5} />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};
