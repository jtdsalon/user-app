import React, { useState } from 'react'
import { Box, Container, Paper, Fade, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Select, MenuItem, FormControl } from '@mui/material'
import LeftPanel from './LeftPanel'
import AuthForm from './AuthForm'
import ForgotPasswordPanel from './ForgotPasswordPanel'
import ResetSentPanel from './ResetSentPanel'
import LegalDialog from './LegalDialog'
import { useAuthAction } from './hooks/useAuthAction'
import { AUTH_STRINGS, setAuthLocale, AUTH_LOCALES } from './properties'

const AuthView: React.FC = () => {
  const theme = useTheme()
  // detect mobile so we can hide the heavy left panel on small devices
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Screen/tab state
  const [screen, setScreen] = useState<'auth' | 'forgot-password' | 'reset-sent'>('auth')
  const [tab, setTab] = useState(0)
  const [legalOpen, setLegalOpen] = useState(false)

  // Locale state to trigger rerender when changed
  const [locale, setLocale] = useState<string>('en')
  const handleLocaleChange = (next: string) => {
    setAuthLocale(next)
    setLocale(next)
  }

  // Use action hook for behavior
  const action = useAuthAction(tab, setScreen)

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left branding/image - hidden on mobile to keep the form focused and avoid layout issues on small screens */}
      {!isMobile && <LeftPanel />}

      {/* Right form area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 6 }, mt: { xs: -6, md: 0 }, zIndex: 3 }}>
        <Container maxWidth="xs" sx={{ p: 0 }}>

          {/* Locale selector */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl size="small">
              <Select value={locale} onChange={(e) => handleLocaleChange(e.target.value as string)}>
                {Object.keys(AUTH_LOCALES).map((k) => (
                  <MenuItem key={k} value={k}>{k.toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Fade in timeout={1200}>
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '32px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
              {screen === 'auth' && (
                <AuthForm
                  tab={tab}
                  setTab={setTab}
                  setScreen={setScreen}
                  {...action}
                />
              )}

              {screen === 'forgot-password' && (
                <ForgotPasswordPanel
                  formData={action.formData}
                  errors={action.errors}
                  loading={action.loading}
                  handleInputChange={action.handleInputChange}
                  handleForgotPassword={action.handleForgotPassword}
                  setScreen={setScreen}
                />
              )}

              {screen === 'reset-sent' && (
                <ResetSentPanel formData={action.formData} setScreen={setScreen} />
              )}
            </Paper>
          </Fade>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.secondary', fontWeight: 600, px: 4 }}>By continuing, you agree to our <Box component="span" onClick={() => setLegalOpen(true)} sx={{ textDecoration: 'underline', cursor: 'pointer', '&:hover': { color: 'secondary.main' } }}>{AUTH_STRINGS.legal.terms}</Box> and <Box component="span" onClick={() => setLegalOpen(true)} sx={{ textDecoration: 'underline', cursor: 'pointer', '&:hover': { color: 'secondary.main' } }}>{AUTH_STRINGS.legal.privacy}</Box>.</Typography>

          <LegalDialog open={legalOpen} onClose={() => setLegalOpen(false)} />
        </Container>
      </Box>
    </Box>
  )
}

export default AuthView
