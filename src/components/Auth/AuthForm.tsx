import React from 'react'
import { Stack, Tabs, Tab, Button, Divider, Typography, TextField, InputAdornment, IconButton, CircularProgress, Alert, Box } from '@mui/material'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import GoogleIcon from './GoogleIcon'
import AppleIcon from './AppleIcon'
import { AUTH_STRINGS } from './properties'
import type { FormData, GenderOption } from './hooks/useAuthAction'

interface Props {
  tab: number
  setTab: (v: number) => void
  setScreen: (s: 'auth' | 'forgot-password' | 'reset-sent') => void
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  errors: Record<string, string>
  loading: boolean
  googleLoading: boolean
  appleLoading: boolean
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  handleGoogleAuth: () => Promise<void>
  handleAppleAuth: () => Promise<void>
}

const AuthForm: React.FC<Props> = ({ tab, setTab, setScreen, formData, setFormData, errors, loading, googleLoading, appleLoading, showPassword, setShowPassword, handleInputChange, handleSubmit, handleGoogleAuth, handleAppleAuth }) => {
  return (
    <>
      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => { setTab(v); }} centered sx={{ mb: 4, '& .MuiTabs-indicator': { bgcolor: 'secondary.main', height: 3, borderRadius: '4px' }, '& .MuiTab-root': { fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' } }}>
        <Tab label={AUTH_STRINGS.form.loginTab} />
        <Tab label={AUTH_STRINGS.form.signupTab} />
      </Tabs>

      <Stack spacing={2.5}>
        {/* Google login button */}
        <Button fullWidth variant="outlined" onClick={handleGoogleAuth} disabled={googleLoading || appleLoading || loading} startIcon={googleLoading ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />} sx={{ borderRadius: '14px', py: 1.5, borderColor: 'divider', color: 'text.primary', fontWeight: 700, textTransform: 'none', fontSize: '14px', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}>
          {AUTH_STRINGS.form.googleLogin}
        </Button>

        {/* Apple login button */}
        <Button fullWidth variant="contained" onClick={handleAppleAuth} disabled={googleLoading || appleLoading || loading} startIcon={appleLoading ? <CircularProgress size={18} color="inherit" /> : <AppleIcon />} sx={{ borderRadius: '14px', py: 1.5, bgcolor: 'text.primary', color: 'background.paper', fontWeight: 700, textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: 'text.secondary' } }}>
          {AUTH_STRINGS.form.appleLogin}
        </Button>

        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, px: 2 }}>{AUTH_STRINGS.form.orUse}</Typography>
        </Divider>

        {/* Error alert */}
        {errors.form && (
          <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ borderRadius: '14px', mb: 2 }}>
            {errors.form}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e)}>
          <Stack spacing={2.5}>
            {/* Signup name fields */}
            {tab === 1 && (
              <>
                <Stack direction="row" spacing={2}>
                  <TextField fullWidth name="firstName" label={AUTH_STRINGS.form.firstName} value={formData.firstName} onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName} FormHelperTextProps={{ sx: { color: 'error.main', fontWeight: 600 } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
                  <TextField fullWidth name="lastName" label={AUTH_STRINGS.form.lastName} value={formData.lastName} onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName} FormHelperTextProps={{ sx: { color: 'error.main', fontWeight: 600 } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
                </Stack>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block', letterSpacing: '0.05em' }}>
                    WHAT IS YOUR GENDER?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { id: 'ladies' as const, label: 'LADIES' },
                      { id: 'men' as const, label: 'MEN' },
                      { id: 'all' as const, label: 'BOTH / ALL' }
                    ].map((g) => (
                      <Button
                        key={g.id}
                        fullWidth
                        variant={formData.gender === g.id ? 'contained' : 'outlined'}
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g.id }))}
                        sx={{
                          borderRadius: '12px',
                          py: 1.2,
                          fontSize: '10px',
                          fontWeight: 800,
                          borderColor: formData.gender === g.id ? 'text.primary' : 'divider',
                          bgcolor: formData.gender === g.id ? 'text.primary' : 'transparent',
                          color: formData.gender === g.id ? 'background.paper' : 'text.secondary',
                          '&:hover': {
                            bgcolor: formData.gender === g.id ? 'text.secondary' : 'action.hover',
                            borderColor: 'text.primary'
                          }
                        }}
                      >
                        {g.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Contact field */}
            <TextField fullWidth name="contact" label={AUTH_STRINGS.form.contactLabel} value={formData.contact} onChange={handleInputChange} error={!!errors.contact} helperText={errors.contact} FormHelperTextProps={{ sx: { color: 'error.main', fontWeight: 600 } }} InputProps={{ startAdornment: (<InputAdornment position="start"><User size={18} /></InputAdornment>), sx: { borderRadius: '14px' } }} />

            {/* Password field */}
            <TextField fullWidth name="password" type={showPassword ? 'text' : 'password'} label={AUTH_STRINGS.form.password} value={formData.password} onChange={handleInputChange} error={!!errors.password} helperText={errors.password} FormHelperTextProps={{ sx: { color: 'error.main', fontWeight: 600 } }} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock size={18} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} size="small">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton></InputAdornment>), sx: { borderRadius: '14px' } }} />

            {/* Forgot password link */}
            {tab === 0 && (
              <Typography align="right" onClick={() => { setScreen('forgot-password'); }} sx={{ color: 'secondary.main', fontSize: '13px', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{AUTH_STRINGS.form.forgotPassword}</Typography>
            )}

            {/* Submit */}
            <Button fullWidth variant="contained" type="submit" disabled={loading || googleLoading || appleLoading} sx={{ borderRadius: '100px', py: 2, bgcolor: 'text.primary', color: 'background.paper', fontWeight: 900, letterSpacing: '0.1em', '&:hover': { bgcolor: 'text.secondary' } }}>{loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? AUTH_STRINGS.form.login : AUTH_STRINGS.form.createAccount)}</Button>
          </Stack>
        </form>
      </Stack>
    </>
  )
}

export default AuthForm
