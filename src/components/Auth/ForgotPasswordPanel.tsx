import React from 'react'
import { Box, IconButton, Typography, Stack, TextField, Button, CircularProgress } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { AUTH_STRINGS } from './properties'

interface Props {
  formData: any
  errors: Record<string, string>
  loading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleForgotPassword: (e?: React.FormEvent) => Promise<void>
  setScreen: (s: 'auth' | 'forgot-password' | 'reset-sent') => void
}

const ForgotPasswordPanel: React.FC<Props> = ({ formData, errors, loading, handleInputChange, handleForgotPassword, setScreen }) => {
  return (
    <Box>
      <IconButton onClick={() => setScreen('auth')} sx={{ mb: 2, ml: -1 }}><ArrowLeft size={20} /></IconButton>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>{AUTH_STRINGS.forgot.resetTitle}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500, lineHeight: 1.6 }}>{AUTH_STRINGS.forgot.resetDescription}</Typography>

      <form onSubmit={(e) => handleForgotPassword(e)}>
        <Stack spacing={3}>
          <TextField fullWidth name="contact" label={AUTH_STRINGS.form.contactLabel} value={formData.contact} onChange={handleInputChange} error={!!errors.contact} helperText={errors.contact} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ borderRadius: '100px', py: 2, bgcolor: 'text.primary', color: 'background.paper', fontWeight: 900 }}>{loading ? <CircularProgress size={24} color="inherit" /> : AUTH_STRINGS.form.sendLink}</Button>
        </Stack>
      </form>
    </Box>
  )
}

export default ForgotPasswordPanel
