import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { AUTH_STRINGS } from '../properties'

export type GenderOption = 'ladies' | 'men' | 'all'

export interface FormData {
  firstName: string
  lastName: string
  contact: string
  password: string
  gender: GenderOption
}

type AuthScreen = 'auth' | 'forgot-password' | 'reset-sent'

export const useAuthAction = (tab: number, setScreen: (s: AuthScreen) => void) => {
  const { login, register, loginWithGoogle, loginWithApple } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    contact: '',
    password: '',
    gender: 'ladies',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  const isPhone = (val: string) => /^\+?[\d\s-]{10,}$/.test(val)

  const mapBackendCode = (code?: string | null) => {
    if (!code) return null
    const map = AUTH_STRINGS.errors.codeMap as Record<string, string>
    return map[code] || null
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (tab === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = AUTH_STRINGS.errors.firstNameRequired
      if (!formData.lastName.trim()) newErrors.lastName = AUTH_STRINGS.errors.lastNameRequired
    }
    if (!formData.contact.trim()) {
      newErrors.contact = AUTH_STRINGS.errors.contactRequired
    } else if (!isEmail(formData.contact) && !isPhone(formData.contact)) {
      newErrors.contact = AUTH_STRINGS.errors.contactInvalid
    }
    if (!formData.password) {
      newErrors.password = AUTH_STRINGS.errors.passwordRequired
    } else if (formData.password.length < 6) {
      newErrors.password = AUTH_STRINGS.errors.passwordShort
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name] || errors.form) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        delete next.form
        return next
      })
    }
  }

  const getFriendlyError = (err: any) => {
    // Prefer structured backend message
    if (err?.errorMessage) return err.errorMessage
    // Map machine-readable code to friendly message
    const code = err?.externalErrorMessage || err?.code || (err?.response?.data?.code)
    const mapped = mapBackendCode(code)
    if (mapped) return mapped
    return err?.message || AUTH_STRINGS.errors.generic
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (tab === 0) {
        await login(formData.contact, formData.password)
      } else {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: isEmail(formData.contact) ? formData.contact : undefined,
          phone: isPhone(formData.contact) ? formData.contact : undefined,
          isElite: true,
          gender: formData.gender,
        }, formData.password)
      }
      setErrors({})
    } catch (err: any) {
      const msg = getFriendlyError(err)
      setErrors({ form: msg })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      setErrors({})
    } catch (err: any) {
      const msg = getFriendlyError(err)
      setErrors({ form: msg })
      throw err
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleAppleAuth = async () => {
    setAppleLoading(true)
    try {
      await loginWithApple()
      setErrors({})
    } catch (err: any) {
      const msg = getFriendlyError(err)
      setErrors({ form: msg })
      throw err
    } finally {
      setAppleLoading(false)
    }
  }

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formData.contact.trim() || (!isEmail(formData.contact) && !isPhone(formData.contact))) {
      setErrors({ contact: AUTH_STRINGS.errors.contactValidRequired })
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setScreen('reset-sent')
  }

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    googleLoading,
    appleLoading,
    showPassword,
    setShowPassword,
    handleInputChange,
    handleSubmit,
    handleGoogleAuth,
    handleAppleAuth,
    handleForgotPassword,
  }
}
