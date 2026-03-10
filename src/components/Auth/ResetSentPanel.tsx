import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { CheckCircle2 } from 'lucide-react'
import { AUTH_STRINGS } from './properties'

interface Props {
  formData: any
  setScreen: (s: 'auth' | 'forgot-password' | 'reset-sent') => void
}

const ResetSentPanel: React.FC<Props> = ({ formData, setScreen }) => {
  const description = AUTH_STRINGS.forgot.linkSentDescription.replace('{contact}', formData.contact || '')
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ color: 'success.main', mb: 3 }}><CheckCircle2 size={72} strokeWidth={1} /></Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5 }}>{AUTH_STRINGS.forgot.linkSentTitle}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5, px: 2, fontWeight: 500, lineHeight: 1.6 }}>{description}</Typography>
      <Button fullWidth variant="outlined" onClick={() => setScreen('auth')} sx={{ borderRadius: '100px', py: 1.8, fontWeight: 800 }}>{AUTH_STRINGS.form.backToLogin}</Button>
    </Box>
  )
}

export default ResetSentPanel
