
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Stack, 
  Box, 
  Avatar, 
  Typography, 
  Grid2, 
  Button 
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Phone, 
  Copy, 
  X as CloseIcon 
} from 'lucide-react';
import { useLayout } from '../common/layouts/layoutContext';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  image?: string;
  description?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, title, url, image, description }) => {
  const { showNotification } = useLayout();
  const shareText = `Check out ${title} on Glow Beauty - The ultimate salon experience!`;

  const shareOptions = [
    { name: 'Facebook', icon: <Facebook size={20} />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: <Twitter size={20} />, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}` },
    { name: 'WhatsApp', icon: <Phone size={20} />, color: '#25D366', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + url)}` },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    showNotification('Link copied to clipboard!', 'success');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{ 
        sx: { 
          borderRadius: '32px', 
          p: 1,
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        } 
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 900, fontSize: '14px', letterSpacing: '0.15em', pt: 3 }}>
        SHARE RITUAL ARCHIVE
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}>
          <CloseIcon size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {image && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Avatar src={image} sx={{ width: 80, height: 80, border: '4px solid #F1F5F9' }} />
            </Box>
          )}
          <Typography sx={{ textAlign: 'center', fontSize: '13px', color: 'text.secondary', px: 2 }}>
            {description || `Invite others to experience the artistry of ${title}.`}
          </Typography>
          
          <Grid2 container spacing={2}>
            {shareOptions.map((option) => (
              <Grid2 size={6} key={option.name}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={option.icon}
                  href={option.url}
                  target="_blank"
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'text.primary',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: option.color,
                      bgcolor: `${option.color}10`,
                      color: option.color
                    }
                  }}
                >
                  {option.name}
                </Button>
              </Grid2>
            ))}
          </Grid2>

          <Box 
            onClick={handleCopyLink}
            sx={{ 
              p: 2, 
              borderRadius: '20px', 
              bgcolor: 'action.hover', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <Typography noWrap sx={{ fontSize: '12px', color: 'text.secondary', flex: 1, mr: 2 }}>
              {url}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'primary.main' }}>
              <Copy size={16} />
              <Typography sx={{ fontSize: '10px', fontWeight: 900 }}>COPY</Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <Box sx={{ p: 3 }} />
    </Dialog>
  );
};

export default ShareDialog;
