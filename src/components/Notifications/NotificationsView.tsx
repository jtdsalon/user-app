import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  Avatar, 
  IconButton, 
  Button, 
  Tabs, 
  Tab, 
  Fade, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  useTheme
} from '@mui/material';
import { Trash2, CheckCheck, Bell, ChevronRight, X, RefreshCw } from 'lucide-react';
import { MainLayout } from '../common/layouts/MainLayout';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { useNotificationsAction } from './hooks/useNotificationsAction';
import { getNotificationStrings } from './properties';

const NotificationsView: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const s = getNotificationStrings();
  const {
    notifications,
    loading,
    tabValue,
    setTabValue,
    filteredNotifications,
    fetchNotifications,
    fetchError,
    handleMarkAllRead,
    handleClearAll,
    handleDelete,
    handleNotificationClick,
    getNotifIcon,
  } = useNotificationsAction();

  return (
    <MainLayout>
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', pt: 6, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 400, color: 'text.primary', mb: 0.5, letterSpacing: '0.5em' }}>{s.view.activity}</Typography>
          <Typography sx={{ fontSize: '8px', fontWeight: 900, color: 'secondary.main', letterSpacing: '0.4em', textTransform: 'uppercase' }}>{s.view.subtitle}</Typography>
        </Box>

        {/* Global Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: 'text.primary' }}>
              {notifications.filter(n => !n.isRead).length} {s.view.unread}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={fetchNotifications} disabled={loading} title="Refresh" sx={{ color: 'text.secondary' }}>
              <RefreshCw size={14} />
            </IconButton>
            <Button 
              size="small" 
              startIcon={<CheckCheck size={14} />}
              onClick={handleMarkAllRead}
              disabled={notifications.every(n => n.isRead)}
              sx={{ fontSize: '10px', fontWeight: 800, color: 'text.secondary' }}
            >
              {s.view.markAllRead}
            </Button>
            <Button 
              size="small" 
              startIcon={<Trash2 size={14} />}
              onClick={handleClearAll}
              sx={{ fontSize: '10px', fontWeight: 800, color: '#ef4444' }}
            >
              {s.view.clearArchive}
            </Button>
          </Stack>
        </Stack>

        {/* Filter Tabs */}
        <Box sx={{ mb: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: 'text.primary', height: 2 },
              '& .MuiTab-root': { 
                fontSize: '10px', 
                fontWeight: 800, 
                letterSpacing: '0.1em', 
                color: 'text.secondary',
                minWidth: 'auto',
                px: 2,
                py: 2
              },
              '& .Mui-selected': { color: `text.primary !important` }
            }}
          >
            <Tab label={s.tabs.all} />
            <Tab label={s.tabs.bookings} />
            <Tab label={s.tabs.jobs} />
            <Tab label={s.tabs.reviews} />
            <Tab label={s.tabs.other} />
          </Tabs>
        </Box>

        {/* Error feedback */}
        {fetchError && (
          <Box sx={{ py: 2, px: 2, mb: 2, bgcolor: 'error.dark', color: 'error.contrastText', borderRadius: 2 }}>
            <Typography sx={{ fontSize: '12px' }}>{fetchError}</Typography>
            <Typography sx={{ fontSize: '10px', mt: 0.5, opacity: 0.9 }}>Check console for details. Try refreshing.</Typography>
          </Box>
        )}

        {/* Notifications List */}
        <Fade in timeout={600}>
          <Box>
            {loading ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{s.view.loading}</Typography>
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <Bell size={48} color={theme.palette.divider} strokeWidth={1} style={{ marginBottom: 24 }} />
                <Typography sx={{ fontSize: '13px', color: 'text.secondary', fontWeight: 300 }}>
                  {s.view.emptyMessage}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notif) => (
                  <React.Fragment key={notif.id}>
                    <ListItem 
                      disablePadding
                      secondaryAction={
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                          <X size={14} />
                        </IconButton>
                      }
                      sx={{ 
                        mb: 1, 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        bgcolor: notif.isRead ? 'transparent' : (isDarkMode ? 'rgba(226, 194, 117, 0.05)' : 'rgba(212, 175, 55, 0.03)'),
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemButton sx={{ py: 2, px: 2 }} onClick={() => handleNotificationClick(notif)}>
                        <ListItemAvatar sx={{ minWidth: 56 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={getFullImageUrl(notif.fromUserAvatar || '')} sx={{ width: 40, height: 40, border: `1px solid ${theme.palette.divider}` }} />
                            <Box sx={{ 
                              position: 'absolute', 
                              bottom: -2, 
                              right: -2, 
                              bgcolor: 'background.paper', 
                              borderRadius: '50%', 
                              p: 0.5, 
                              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {getNotifIcon(notif.type)}
                            </Box>
                          </Box>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>
                              {notif.fromUserName} <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>{notif.message}</Box>
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography sx={{ fontSize: '10px', color: 'text.secondary', opacity: 0.6, fontWeight: 700 }}>{notif.timeAgo.toUpperCase()}</Typography>
                              {!notif.isRead && <Chip label={s.view.new} size="small" sx={{ height: 16, fontSize: '8px', fontWeight: 900, bgcolor: 'secondary.main', color: isDarkMode ? 'primary.main' : '#fff' }} />}
                            </Stack>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                        <ChevronRight size={16} color={theme.palette.divider} />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
    </MainLayout>
  );
};

export default NotificationsView;
