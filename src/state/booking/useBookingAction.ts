import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as T from './types'
import type { RootState } from '../store'
import type { Salon, Artist } from '../../components/Home/types'
import type { SubmitBookingActionPayload } from './submitBooking'

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export function useBookingAction() {
  const dispatch = useDispatch()
  const state = useSelector((s: RootState) => (s as any).booking as T.BookingState)

  const loadAvailability = useCallback(
    (staffId: string, dateStr: string, options?: { durationMinutes?: number; bufferMinutes?: number; serviceId?: string }) => {
      if (!staffId || !dateStr) return
      const iso = dateStr.includes('-') ? dateStr : new Date(dateStr).toISOString().slice(0, 10)
      dispatch({ type: T.LOAD_AVAILABILITY, payload: { staffId, date: iso, ...options } })
    },
    [dispatch]
  )

  const submitBooking = useCallback(
    (params: {
      salonId: string
      serviceIds: string[]
      services: Array<{ id: string; price: number; duration: number }>
      staffId?: string
      selectedDate: string
      selectedTime: string
      notes?: string
      styleImages: Record<string, string>
      slot_hold_id?: string
    }) => {
      const totalMins = params.services.reduce((s, x) => s + x.duration, 0)
      const bookingDate = params.selectedDate.includes('-')
        ? params.selectedDate
        : new Date(params.selectedDate).toISOString().slice(0, 10)
      const raw = params.selectedTime.trim()
      const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
      let startTime24: string
      if (match) {
        let h = parseInt(match[1], 10)
        const m = parseInt(match[2], 10)
        if (match[3]?.toUpperCase() === 'PM' && h !== 12) h += 12
        else if (match[3]?.toUpperCase() === 'AM' && h === 12) h = 0
        startTime24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      } else {
        startTime24 = raw
      }
      const endTime24 = addMinutes(startTime24, totalMins)

      const payload: SubmitBookingActionPayload = {
        salonId: params.salonId,
        serviceIds: params.serviceIds,
        services: params.services,
        staffId: params.staffId,
        bookingDate,
        startTime: startTime24,
        endTime: endTime24,
        notes: params.notes,
        styleImages: params.styleImages,
        ...(params.slot_hold_id && { slot_hold_id: params.slot_hold_id }),
      }
      dispatch({ type: T.SUBMIT_BOOKING, payload })
    },
    [dispatch]
  )

  // Defer to next frame so click handler is minimal (INP: processing stays <50ms)
  const openBooking = useCallback(
    (s: Salon, preselectedServiceId?: string | null) => {
      requestAnimationFrame(() => {
        dispatch({ type: T.OPEN_BOOKING, payload: { salon: s, artist: null, preselectedServiceId: preselectedServiceId ?? null } })
        setTimeout(() => {
          dispatch({ type: T.LOAD_BOOKING_DATA, payload: { salon: s, artist: null, preselectedServiceId: preselectedServiceId ?? null } })
        }, 0)
      })
    },
    [dispatch]
  )
  const openArtistBooking = useCallback(
    (a: Artist) => {
      requestAnimationFrame(() => {
        dispatch({ type: T.OPEN_BOOKING, payload: { salon: null, artist: a } })
        setTimeout(() => {
          dispatch({ type: T.LOAD_BOOKING_DATA, payload: { salon: null, artist: a } })
        }, 0)
      })
    },
    [dispatch]
  )
  const closeBooking = useCallback(() => dispatch({ type: T.CLOSE_BOOKING }), [dispatch])

  const loadLastBooked = useCallback(() => dispatch({ type: T.LOAD_LAST_BOOKED }), [dispatch])

  /** Refetch booking data (e.g. staff list) when salon-app adds new staff — call on window focus when modal is open. */
  const refetchBookingData = useCallback(() => {
    if (state.salon) {
      dispatch({ type: T.LOAD_BOOKING_DATA, payload: { salon: state.salon, artist: null } })
    } else if (state.artist) {
      dispatch({ type: T.LOAD_BOOKING_DATA, payload: { salon: null, artist: state.artist } })
    }
  }, [dispatch, state.salon, state.artist])

  return {
    ...state,
    loadAvailability,
    submitBooking,
    openBooking,
    openArtistBooking,
    closeBooking,
    loadLastBooked,
    refetchBookingData,
  }
}
