
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  AvatarGroup,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Fade,
  useTheme,
  useMediaQuery,
  keyframes,
  Tooltip,
  Collapse,
  Grid2,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Send,
  Plus,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Users,
  MessageSquare,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  Bell,
  BellOff,
  User,
  ShieldAlert,
  ChevronRight,
  FileText,
  Palette,
  EyeOff,
  X,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff
} from 'lucide-react';
import { Conversation, Message, UserProfile } from './types';
import { optimizeImage } from '@/lib/util/imageProcessor';
import { MainLayout } from '../common/layouts/MainLayout';
const typingDots = keyframes`
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`;

const CONTACTS: UserProfile[] = [];

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

const CallDialog = ({ open, onClose, participant, type }: { open: boolean, onClose: () => void, participant?: UserProfile, type: 'voice' | 'video' }) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
      PaperProps={{ sx: { bgcolor: '#0F172A', color: '#fff', borderRadius: { sm: '32px' }, minWidth: { sm: 400 } } }}
    >
      <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '2px solid rgba(212, 175, 55, 0.3)', animation: `${ripple} 3s infinite` }} />
          <Avatar src={participant?.avatar} sx={{ width: 120, height: 120, border: '4px solid rgba(255,255,255,0.1)' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{participant?.name}</Typography>
        <Typography sx={{ opacity: 0.6, mb: 8, letterSpacing: '0.1em' }}>{type === 'video' ? 'VIDEO CALLING...' : 'VOICE CALLING...'}</Typography>

        <Stack direction="row" spacing={4}>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', p: 2 }}>{type === 'video' ? <CameraOff /> : <MicOff />}</IconButton>
          <IconButton onClick={onClose} sx={{ bgcolor: '#EF4444', color: '#fff', p: 3, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}><PhoneOff /></IconButton>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', p: 2 }}><Users /></IconButton>
        </Stack>
      </Box>
    </Dialog>
  );
};

const ChatView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(true);

  // States for enhanced functionality
  const [isUploading, setIsUploading] = useState(false);
  const [callConfig, setCallConfig] = useState<{ open: boolean, type: 'voice' | 'video' }>({ open: false, type: 'voice' });
  const [mutedChats, setMutedChats] = useState<Set<string>>(new Set());
  const [typingStatus, setTypingStatus] = useState<Record<string, string | null>>({});

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
    } else {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      const updated = conversations.map(c => c.id === selectedChatId ? { ...c, unreadCount: 0 } : c);
      setConversations(updated);
      localStorage.setItem('aurora_chats', JSON.stringify(updated));
    }
  }, [selectedChatId]);

  const activeChat = conversations.find(c => c.id === selectedChatId);
  const otherParticipant = activeChat?.participants.find(p => p.id !== CURRENT_USER.id);

  const toggleMute = () => {
    if (!selectedChatId) return;
    const next = new Set(mutedChats);
    if (next.has(selectedChatId)) next.delete(selectedChatId);
    else next.add(selectedChatId);
    setMutedChats(next);
  };

  const simulateTypingResponse = (chatId: string) => {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;
    const responder = chat.participants.find(p => p.id !== CURRENT_USER.id);
    if (!responder) return;

    setTimeout(() => {
      setTypingStatus(prev => ({ ...prev, [chatId]: responder.name }));
      setTimeout(() => {
        setTypingStatus(prev => ({ ...prev, [chatId]: null }));
        // Automatic response simulation
        const responseMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: responder.id,
          senderName: responder.name,
          senderAvatar: responder.avatar,
          text: "That sounds like a wonderful aesthetic choice. I'll prepare the workspace for you. ✨",
          timestamp: Date.now(),
          status: 'delivered'
        };
        setConversations(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, responseMsg], lastMessageAt: Date.now() } : c));
      }, 3000);
    }, 1000);
  };

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
    const currentId = selectedChatId;
    setInputText('');
    simulateTypingResponse(currentId);
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

  const createGroup = () => {
    if (selectedContacts.length < 1) return;
    const participants = [CURRENT_USER, ...CONTACTS.filter(c => selectedContacts.includes(c.id))];
    const newChat: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedContacts.length > 1 ? 'group' : 'direct',
      participants,
      groupName: selectedContacts.length > 1 ? (groupName || 'Collective Chat') : undefined,
      messages: [],
      lastMessageAt: Date.now(),
      unreadCount: 0
    };
    const updated = [newChat, ...conversations];
    setConversations(updated);
    localStorage.setItem('aurora_chats', JSON.stringify(updated));
    setSelectedChatId(newChat.id);
    setIsGroupModalOpen(false);
    setSelectedContacts([]);
    setGroupName('');
  };

  const currentlyTypingName = selectedChatId ? typingStatus[selectedChatId] : null;
  const isCurrentChatMuted = selectedChatId ? mutedChats.has(selectedChatId) : false;

  return (
    <MainLayout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', pb: { xs: 9, md: 0 }, position: 'relative' }}>
          <Box sx={{ height: 'calc(100vh - 72px)', bgcolor: 'background.default', display: 'flex', overflow: 'hidden' }}>

            {/* Pane 1: Inbox (Left) */}
            <Box sx={{
              width: { xs: selectedChatId ? 0 : '100%', md: 340, lg: 360 },
              borderRight: `1px solid ${theme.palette.divider}`,
              display: { xs: selectedChatId ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              bgcolor: 'background.paper',
              zIndex: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
                    Messages
                  </Typography>
                  <IconButton
                    onClick={() => setIsGroupModalOpen(true)}
                    sx={{ bgcolor: 'action.hover', color: 'text.primary', '&:hover': { bgcolor: 'divider' } }}
                  >
                    <Plus size={20} />
                  </IconButton>
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search journal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search size={16} color={theme.palette.text.secondary} /></InputAdornment>,
                    sx: { borderRadius: '100px', bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                  }}
                />
              </Box>

              <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                {conversations.filter(c => {
                  const name = c.type === 'group' ? c.groupName : c.participants.find(p => p.id !== CURRENT_USER.id)?.name;
                  return name?.toLowerCase().includes(searchQuery.toLowerCase());
                }).sort((a, b) => b.lastMessageAt - a.lastMessageAt).map((chat) => {
                  const isSelected = chat.id === selectedChatId;
                  const otherP = chat.participants.find(p => p.id !== CURRENT_USER.id);
                  const lastMsg = chat.messages[chat.messages.length - 1];
                  const isTyping = !!typingStatus[chat.id];
                  const isMuted = mutedChats.has(chat.id);

                  return (
                    <ListItem key={chat.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => setSelectedChatId(chat.id)}
                        sx={{
                          borderRadius: '16px',
                          bgcolor: isSelected ? 'rgba(0, 132, 255, 0.1)' : 'transparent',
                          mx: 1,
                          py: 1.5,
                          '&:hover': { bgcolor: isSelected ? 'rgba(0, 132, 255, 0.15)' : 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success" invisible={chat.type === 'group'}>
                            {chat.type === 'group' ? (
                              <AvatarGroup max={2} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '9px', border: `1px solid ${theme.palette.background.paper}` } }}>
                                {chat.participants.map(p => <Avatar key={p.id} src={p.avatar} />)}
                              </AvatarGroup>
                            ) : (
                              <Avatar src={otherP?.avatar} />
                            )}
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography sx={{ fontWeight: 800, fontSize: '13px', color: 'text.primary' }} noWrap>
                                {chat.type === 'group' ? chat.groupName : otherP?.name}
                              </Typography>
                              <Typography sx={{ fontSize: '10px', color: 'text.secondary', ml: 1 }}>
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {isMuted && <BellOff size={10} color={theme.palette.text.secondary} />}
                              <Typography noWrap sx={{
                                fontSize: '11px',
                                color: isTyping ? '#0084FF' : (chat.unreadCount > 0 ? 'text.primary' : 'text.secondary'),
                                fontWeight: (isTyping || chat.unreadCount > 0) ? 900 : 500,
                                flex: 1
                              }}>
                                {isTyping ? 'typing...' : (lastMsg ? lastMsg.text : 'No messages yet')}
                              </Typography>
                            </Stack>
                          }
                        />
                        {chat.unreadCount > 0 && !isTyping && (
                          <Box sx={{ ml: 1, width: 8, height: 8, bgcolor: '#0084FF', borderRadius: '50%' }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            {/* Pane 2: Thread (Center) */}
            <Box sx={{
              flex: 1,
              display: { xs: selectedChatId ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              bgcolor: 'background.paper',
              position: 'relative',
              zIndex: 1
            }}>
              {activeChat ? (
                <>
                  {/* Header */}
                  <Paper elevation={0} sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {isMobile && <IconButton onClick={() => setSelectedChatId(null)} sx={{ color: 'text.primary' }}><ArrowLeft size={20} /></IconButton>}
                      <Avatar src={activeChat.type === 'group' ? undefined : otherParticipant?.avatar} sx={{ width: 40, height: 40, border: `1px solid ${theme.palette.divider}` }}>
                        {activeChat.type === 'group' && <Users size={18} />}
                      </Avatar>
                      <Box sx={{ cursor: 'pointer' }} onClick={() => !isMobile && setShowDetails(!showDetails)}>
                        <Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '15px', lineHeight: 1.2 }}>
                          {activeChat.type === 'group' ? activeChat.groupName : otherParticipant?.name}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: currentlyTypingName ? '#0084FF' : 'text.secondary', fontWeight: 700 }}>
                          {currentlyTypingName ? 'is typing...' : 'Active in gallery'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => setCallConfig({ open: true, type: 'voice' })} sx={{ color: '#0084FF' }}><Phone size={20} /></IconButton>
                      <IconButton size="small" onClick={() => setCallConfig({ open: true, type: 'video' })} sx={{ color: '#0084FF' }}><Video size={20} /></IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: showDetails ? '#0084FF' : 'text.secondary' }}
                        onClick={() => setShowDetails(!showDetails)}
                      >
                        <Info size={20} />
                      </IconButton>
                    </Stack>
                  </Paper>

                  {/* Messages */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.8, bgcolor: isDarkMode ? 'background.default' : 'rgba(0,0,0,0.01)' }}>
                    {activeChat.messages.map((msg, idx) => {
                      const isMe = msg.senderId === CURRENT_USER.id;
                      const prevMsg = activeChat.messages[idx - 1];
                      const nextMsg = activeChat.messages[idx + 1];
                      const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                      const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: { xs: '85%', sm: '70%' },
                            mt: isFirstInGroup ? 2 : 0,
                            mb: isLastInGroup ? 0.5 : 0
                          }}
                        >
                          <Stack direction={isMe ? 'row-reverse' : 'row'} spacing={1} alignItems="flex-end">
                            {!isMe && isLastInGroup && <Avatar src={msg.senderAvatar} sx={{ width: 28, height: 28, border: `1px solid ${theme.palette.divider}` }} />}
                            {!isMe && !isLastInGroup && <Box sx={{ width: 28 }} />}

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: msg.image ? 0.5 : 1.5,
                                  px: msg.image ? 0.5 : 2,
                                  borderRadius: isMe
                                    ? `${isFirstInGroup ? '22px' : '6px'} 22px 22px ${isLastInGroup ? '22px' : '6px'}`
                                    : `22px ${isFirstInGroup ? '22px' : '6px'} ${isLastInGroup ? '22px' : '6px'} 22px`,
                                  bgcolor: isMe ? '#0084FF' : (isDarkMode ? 'background.paper' : '#E4E6EB'),
                                  color: isMe ? '#fff' : 'text.primary',
                                  border: !isMe && isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
                                  position: 'relative',
                                  transition: 'background-color 0.2s',
                                  overflow: 'hidden'
                                }}
                              >
                                {msg.image && (
                                  <Box
                                    component="img"
                                    src={msg.image}
                                    sx={{
                                      width: '100%',
                                      display: 'block',
                                      borderRadius: isMe
                                        ? `${isFirstInGroup ? '18px' : '4px'} 18px 18px ${isLastInGroup ? '18px' : '4px'}`
                                        : `18px ${isFirstInGroup ? '18px' : '4px'} ${isLastInGroup ? '18px' : '4px'} 18px`,
                                      mb: msg.text ? 1 : 0
                                    }}
                                  />
                                )}
                                {msg.text && (
                                  <Typography sx={{
                                    fontSize: '14px',
                                    lineHeight: 1.5,
                                    fontWeight: 400,
                                    px: msg.image ? 1.5 : 0,
                                    py: msg.image ? 1 : 0
                                  }}>
                                    {msg.text}
                                  </Typography>
                                )}
                              </Paper>
                              {isLastInGroup && isMe && (
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, mr: 0.5 }}>
                                  <Typography sx={{ fontSize: '9px', fontWeight: 800, color: 'text.secondary', opacity: 0.6 }}>
                                    {msg.status === 'read' ? 'READ' : 'SENT'}
                                  </Typography>
                                  {msg.status === 'read' ? <CheckCheck size={10} color="#0084FF" /> : <Check size={10} color={theme.palette.text.secondary} />}
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}

                    {currentlyTypingName && (
                      <Box sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={otherParticipant?.avatar} sx={{ width: 24, height: 24 }} />
                          <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: '20px', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 0.5 }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary', animation: `${typingDots} 1s infinite` }} />
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary', animation: `${typingDots} 1s infinite 0.2s` }} />
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary', animation: `${typingDots} 1s infinite 0.4s` }} />
                          </Paper>
                        </Stack>
                      </Box>
                    )}
                    <div ref={scrollRef} />
                  </Box>

                  {/* Footer */}
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
                    {isUploading && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, px: 1 }}>
                        <CircularProgress size={12} sx={{ color: '#0084FF' }} />
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'text.secondary' }}>OPTIMIZING ATTACHMENT...</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton onClick={() => imageInputRef.current?.click()} disabled={isUploading} size="small" sx={{ color: '#0084FF' }}>
                        <ImageIcon size={20} />
                      </IconButton>
                      <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleImageUpload} />

                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Draft an aesthetic message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        InputProps={{
                          sx: { borderRadius: '24px', px: 2, bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
                        }}
                      />
                      <IconButton onClick={() => handleSendMessage()} disabled={!inputText.trim() && !isUploading} sx={{ color: '#0084FF', '&.Mui-disabled': { opacity: 0.3 } }}>
                        <Send size={22} fill={inputText.trim() ? "currentColor" : "none"} />
                      </IconButton>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                  <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }}>
                    <MessageSquare size={48} color="#0084FF" strokeWidth={1} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>Select a Journal</Typography>
                  <Typography sx={{ color: 'text.secondary', maxWidth: 320, fontSize: '15px', lineHeight: 1.6 }}>
                    Revisit your artistic collaborations or start a new conversation with an artisan.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Pane 3: Details (Right) */}
            <Collapse in={showDetails && !isMobile && !!selectedChatId} orientation="horizontal" sx={{ height: '100%' }}>
              <Box sx={{
                width: 320,
                height: '100%',
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                overflowY: 'auto'
              }}>
                {activeChat && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 4 }}>
                      <Avatar
                        src={activeChat.type === 'group' ? undefined : otherParticipant?.avatar}
                        sx={{ width: 88, height: 88, mx: 'auto', mb: 2, border: `2px solid ${theme.palette.divider}` }}
                      >
                        <Users size={32} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2 }}>
                        {activeChat.type === 'group' ? activeChat.groupName : otherParticipant?.name}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: theme.palette.secondary.main, fontWeight: 700, mt: 0.5 }}>
                        {activeChat.type === 'group' ? `${activeChat.participants.length} Curators` : otherParticipant?.handle}
                      </Typography>
                    </Box>

                    <Grid2 container spacing={2} sx={{ mb: 4 }}>
                      <Grid2 size={4}>
                        <Stack spacing={0.5} alignItems="center">
                          <IconButton sx={{ bgcolor: 'action.hover', color: 'text.primary', width: 44, height: 44 }}><User size={18} /></IconButton>
                          <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary' }}>PROFILE</Typography>
                        </Stack>
                      </Grid2>
                      <Grid2 size={4}>
                        <Stack spacing={0.5} alignItems="center">
                          <IconButton
                            onClick={toggleMute}
                            sx={{
                              bgcolor: isCurrentChatMuted ? 'rgba(239, 68, 68, 0.1)' : 'action.hover',
                              color: isCurrentChatMuted ? '#ef4444' : 'text.primary',
                              width: 44, height: 44
                            }}
                          >
                            {isCurrentChatMuted ? <BellOff size={18} /> : <Bell size={18} />}
                          </IconButton>
                          <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary' }}>{isCurrentChatMuted ? 'UNMUTE' : 'MUTE'}</Typography>
                        </Stack>
                      </Grid2>
                      <Grid2 size={4}>
                        <Stack spacing={0.5} alignItems="center">
                          <IconButton sx={{ bgcolor: 'action.hover', color: 'text.primary', width: 44, height: 44 }}><Search size={18} /></IconButton>
                          <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary' }}>SEARCH</Typography>
                        </Stack>
                      </Grid2>
                    </Grid2>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={0.5} sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', mb: 1, letterSpacing: '0.1em' }}>ARCHIVE SETTINGS</Typography>
                      <Button fullWidth sx={{ justifyContent: 'space-between', color: 'text.primary', py: 1.5, fontSize: '13px', fontWeight: 700, textTransform: 'none', borderRadius: '12px' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Palette size={18} color="#0084FF" />
                          <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>Aesthetic Theme</Typography>
                        </Stack>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#0084FF' }} />
                      </Button>
                      <Button fullWidth sx={{ justifyContent: 'space-between', color: 'text.primary', py: 1.5, fontSize: '13px', fontWeight: 700, textTransform: 'none', borderRadius: '12px' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ImageIcon size={18} color="#A855F7" />
                          <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>Media & Masterpieces</Typography>
                        </Stack>
                        <ChevronRight size={14} color={theme.palette.divider} />
                      </Button>
                    </Stack>

                    <Box sx={{ mt: 4, textAlign: 'left' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>VISUAL ARCHIVE</Typography>
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#0084FF', cursor: 'pointer' }}>SEE ALL</Typography>
                      </Stack>
                      <Grid2 container spacing={0.5}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <Grid2 size={4} key={i}>
                            <Box sx={{
                              width: '100%', pt: '100%', bgcolor: 'action.hover', borderRadius: '8px',
                              backgroundImage: `url(https://picsum.photos/seed/${i + (activeChat.id === 'c1' ? 100 : 200)}/200)`,
                              backgroundSize: 'cover', transition: 'all 0.3s', cursor: 'pointer',
                              border: `1px solid ${theme.palette.divider}`,
                              '&:hover': { transform: 'scale(0.95)', opacity: 0.8 }
                            }} />
                          </Grid2>
                        ))}
                      </Grid2>
                    </Box>

                    <Button
                      fullWidth
                      startIcon={<EyeOff size={18} />}
                      sx={{ mt: 6, color: '#ef4444', fontWeight: 900, fontSize: '12px', textTransform: 'none', justifyContent: 'flex-start', py: 2, borderRadius: '12px', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                    >
                      Block and report access
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>

            {/* Modals */}
            <Dialog open={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}>
              <DialogTitle sx={{ textAlign: 'center', fontWeight: 900, color: 'text.primary', fontSize: '1.25rem' }}>Create Collective</DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField fullWidth placeholder="Collective Name (Optional)" value={groupName} onChange={(e) => setGroupName(e.target.value)} variant="standard" InputProps={{ sx: { fontSize: '14px', py: 1 } }} />
                  <Typography sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>SELECT ARTISANS & CLIENTS</Typography>
                  <List sx={{ pt: 0, maxHeight: 300, overflowY: 'auto' }}>
                    {CONTACTS.map((contact) => (
                      <ListItem key={contact.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton onClick={() => setSelectedContacts(p => p.includes(contact.id) ? p.filter(id => id !== contact.id) : [...p, contact.id])} sx={{ borderRadius: '12px' }}>
                          <ListItemAvatar><Avatar src={contact.avatar} sx={{ border: `1px solid ${theme.palette.divider}` }} /></ListItemAvatar>
                          <ListItemText primary={<Typography sx={{ fontSize: '14px', fontWeight: 800 }}>{contact.name}</Typography>} secondary={<Typography sx={{ fontSize: '11px', color: theme.palette.secondary.main, fontWeight: 600 }}>{contact.handle}</Typography>} />
                          <Checkbox checked={selectedContacts.includes(contact.id)} sx={{ color: theme.palette.divider, '&.Mui-checked': { color: '#0084FF' } }} disableRipple />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                <Button onClick={() => setIsGroupModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '13px' }}>CANCEL</Button>
                <Button variant="contained" disableElevation disabled={selectedContacts.length === 0} onClick={createGroup} sx={{ bgcolor: '#0084FF', color: '#fff', borderRadius: '100px', px: 4, py: 1.2, fontWeight: 900, fontSize: '13px' }}>START CHAT</Button>
              </DialogActions>
            </Dialog>

            <CallDialog
              open={callConfig.open}
              onClose={() => setCallConfig({ ...callConfig, open: false })}
              participant={otherParticipant}
              type={callConfig.type}
            />
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ChatView;
