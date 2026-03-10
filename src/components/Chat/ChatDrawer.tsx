import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Stack,
  Avatar,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Fade
} from '@mui/material';
import {
  X,
  Search,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Video,
  Info,
  MoreVertical,
  Minimize2,
  Maximize2,
  Paperclip,
  Smile,
  Plus
} from 'lucide-react';
import { Conversation, Message, UserProfile } from './types';
import { useLayout } from '../common/layouts/layoutContext';
import { optimizeImage } from '@/lib/util/imageProcessor';

const CURRENT_USER: UserProfile = {
  id: 'me',
  name: 'You',
  handle: '@you',
  avatar: undefined,
  bio: '',
  followers: 0,
  following: 0,
  postsCount: 0,
  type: 'customer'
};

const isMockAvatar = (value?: string) => Boolean(value?.includes('i.pravatar.cc'));

const sanitizeChats = (chats: Conversation[]): Conversation[] =>
  chats.map((chat) => ({
    ...chat,
    participants: chat.participants.map((participant) => ({
      ...participant,
      avatar: isMockAvatar(participant.avatar) ? undefined : participant.avatar,
    })),
    messages: chat.messages.map((message) => ({
      ...message,
      senderAvatar: isMockAvatar(message.senderAvatar) ? undefined : message.senderAvatar,
    })),
  }));

const ChatDrawer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isChatOpen, setIsChatOpen, isChatMinimized, setIsChatMinimized } = useLayout();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aurora_chats');
    if (saved) {
      try {
        const sanitized = sanitizeChats(JSON.parse(saved));
        setConversations(sanitized);
        localStorage.setItem('aurora_chats', JSON.stringify(sanitized));
      } catch {
        setConversations([]);
        localStorage.removeItem('aurora_chats');
      }
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (selectedChatId) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Clear unread count for selected chat
      const updated = conversations.map(c =>
        c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
      );
      if (JSON.stringify(updated) !== JSON.stringify(conversations)) {
        setConversations(updated);
        localStorage.setItem('aurora_chats', JSON.stringify(updated));
      }
    }
  }, [selectedChatId, conversations]);

  const activeChat = conversations.find(c => c.id === selectedChatId);
  const otherParticipant = activeChat?.participants.find(p => p.id !== CURRENT_USER.id);

  const handleSendMessage = (text?: string, image?: string) => {
    if ((!inputText.trim() && !image) || !selectedChatId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      text: text || inputText,
      image: image,
      timestamp: Date.now(),
      status: 'sent'
    };

    const updated = conversations.map(c => {
      if (c.id === selectedChatId) {
        return { ...c, messages: [...c.messages, newMessage], lastMessageAt: Date.now() };
      }
      return c;
    });

    setConversations(updated);
    localStorage.setItem('aurora_chats', JSON.stringify(updated));
    setInputText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedChatId) {
      setIsUploading(true);
      try {
        const optimized = await optimizeImage(file, { maxWidth: 800, quality: 0.7 });
        handleSendMessage("Visual Masterpiece Attached", optimized);
      } catch (err) {
        console.error("Chat image processing failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Minimized floating bar
  if (isChatOpen && isChatMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Paper
          elevation={12}
          onClick={() => setIsChatMinimized?.(false)}
          sx={{
            p: 1.5,
            px: 3,
            borderRadius: '100px',
            bgcolor: 'secondary.main',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 12px 40px rgba(212, 175, 55, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 48px rgba(212, 175, 55, 0.5)',
            }
          }}
        >
          <MessageSquare size={20} />
          <Typography sx={{ fontWeight: 900, fontSize: '12px', letterSpacing: '0.05em' }}>
            {selectedChatId ? (activeChat?.type === 'group' ? activeChat.groupName : otherParticipant?.name) : 'JOURNALS'}
          </Typography>
          <Maximize2 size={16} />
        </Paper>

        <IconButton
          onClick={() => {
            setIsChatOpen?.(false);
            setIsChatMinimized?.(false);
          }}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={isChatOpen && !isChatMinimized}
      onClose={() => setIsChatOpen?.(false)}
      variant="temporary"
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 100 // Ensure it's above the navbar and other elements
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          height: { xs: '90vh', sm: '100%' },
          borderRadius: { xs: '32px 32px 0 0', sm: '32px 0 0 32px' },
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.1)',
          borderLeft: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {selectedChatId && (
            <IconButton onClick={() => setSelectedChatId(null)} size="small" sx={{ color: 'text.secondary' }}>
              <ArrowLeft size={20} />
            </IconButton>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary', lineHeight: 1.2 }}>
              {selectedChatId ? (activeChat?.type === 'group' ? activeChat.groupName : otherParticipant?.name) : 'Journals'}
            </Typography>
            {selectedChatId && (
              <Typography sx={{ fontSize: '10px', color: 'secondary.main', fontWeight: 800, letterSpacing: '0.05em' }}>
                {activeChat?.type === 'group' ? `${activeChat.participants.length} CURATORS` : 'ARTISAN COLLABORATION'}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Minimize">
            <IconButton onClick={() => setIsChatMinimized?.(true)} size="small" sx={{ color: 'text.secondary' }}>
              <Minimize2 size={18} />
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setIsChatOpen?.(false)} size="small" sx={{ color: 'text.secondary' }}>
            <X size={20} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#F8FAFC' }}>
        {!selectedChatId ? (
          <>
            <Box sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search your aesthetic journals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={16} color={theme.palette.text.secondary} /></InputAdornment>,
                  sx: {
                    borderRadius: '100px',
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    '& fieldset': { border: 'none' },
                    fontSize: '13px'
                  }
                }}
              />
            </Box>
            <List sx={{ p: 1.5, pt: 0 }}>
              {conversations.filter(c => {
                const name = c.type === 'group' ? c.groupName : c.participants.find(p => p.id !== CURRENT_USER.id)?.name;
                return name?.toLowerCase().includes(searchQuery.toLowerCase());
              }).map((chat) => {
                const otherP = chat.participants.find(p => p.id !== CURRENT_USER.id);
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <ListItem key={chat.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => setSelectedChatId(chat.id)}
                      sx={{
                        borderRadius: '20px',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        p: 2,
                        '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' },
                        transition: 'all 0.2s'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success">
                          <Avatar src={otherP?.avatar} sx={{ width: 48, height: 48, border: `2px solid ${theme.palette.background.paper}` }} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 900, fontSize: '14px', color: 'text.primary' }}>{chat.type === 'group' ? chat.groupName : otherP?.name}</Typography>}
                        secondary={
                          <Typography noWrap sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5, opacity: 0.8 }}>
                            {lastMsg ? lastMsg.text : 'Start a masterpiece conversation...'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5, gap: 1.5 }}>
            {activeChat?.messages.map((msg) => {
              const isMe = msg.senderId === CURRENT_USER.id;
              return (
                <Box key={msg.id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      px: 2.5,
                      borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                      bgcolor: isMe ? 'secondary.main' : 'background.paper',
                      color: isMe ? '#fff' : 'text.primary',
                      border: isMe ? 'none' : `1px solid ${theme.palette.divider}`,
                      boxShadow: isMe ? '0 8px 24px rgba(212, 175, 55, 0.25)' : '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                  >
                    {msg.image && (
                      <Box
                        component="img"
                        src={msg.image}
                        sx={{
                          width: '100%',
                          borderRadius: '16px',
                          mb: msg.text ? 1.5 : 0,
                          display: 'block'
                        }}
                      />
                    )}
                    <Typography sx={{ fontSize: '14px', lineHeight: 1.6, fontWeight: 500 }}>{msg.text}</Typography>
                  </Paper>
                  <Typography sx={{ fontSize: '9px', color: 'text.secondary', mt: 0.5, textAlign: isMe ? 'right' : 'left', fontWeight: 800, opacity: 0.5 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              );
            })}
            <div ref={scrollRef} />
          </Box>
        )}
      </Box>

      {/* Footer (Aesthetic Input UI) */}
      {selectedChatId && (
        <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          {isUploading && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, px: 1 }}>
              <CircularProgress size={12} sx={{ color: 'secondary.main' }} />
              <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.05em' }}>CURATING VISUAL...</Typography>
            </Stack>
          )}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: '28px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Draft an aesthetic message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              InputProps={{
                sx: {
                  fontSize: '14px',
                  p: 1.5,
                  '& fieldset': { border: 'none' },
                  color: 'text.primary'
                }
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, pb: 0.5 }}>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Attach Masterpiece">
                  <IconButton onClick={() => imageInputRef.current?.click()} disabled={isUploading} size="small" sx={{ color: 'text.secondary' }}>
                    <Paperclip size={18} />
                  </IconButton>
                </Tooltip>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Smile size={18} />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Plus size={18} />
                </IconButton>
              </Stack>
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !isUploading)}
                sx={{
                  bgcolor: 'secondary.main',
                  color: '#fff',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: 'secondary.dark' },
                  '&.Mui-disabled': { opacity: 0.3, bgcolor: 'action.disabledBackground' }
                }}
              >
                <Send size={18} fill="currentColor" />
              </IconButton>
            </Stack>
          </Paper>
          <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleImageUpload} />
        </Box>
      )}
    </Drawer>
  );
};

export default ChatDrawer;
