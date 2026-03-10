import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import { AUTH_STRINGS } from './properties'

interface Props {
  open: boolean
  onClose: () => void
}

const LegalDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}>
      <DialogTitle>{AUTH_STRINGS.legal.termsTitle}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{AUTH_STRINGS.legal.terms}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{AUTH_STRINGS.legal.termsContent}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{AUTH_STRINGS.legal.privacy}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{AUTH_STRINGS.legal.privacyContent}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">{AUTH_STRINGS.legal.close}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default LegalDialog
