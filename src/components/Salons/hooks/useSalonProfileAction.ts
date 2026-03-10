import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { getSalonDetail } from '@/state/salon'
import type { RootState } from '@/state/store'
import type { Salon } from '@/components/Home/types'

export function useSalonProfileAction(salonId: string) {
  const dispatch = useDispatch()
  const { salonDetail, salonDetailLoading, salonDetailError } = useSelector(
    (state: RootState) => ({
      salonDetail: (state as any).salon?.salonDetail ?? null,
      salonDetailLoading: (state as any).salon?.salonDetailLoading ?? false,
      salonDetailError: (state as any).salon?.salonDetailError ?? null,
    }),
    shallowEqual
  )

  useEffect(() => {
    if (!salonId) return
    dispatch(getSalonDetail(salonId) as any)
  }, [salonId, dispatch])

  const refetchReviews = useCallback(() => {
    if (salonId) dispatch(getSalonDetail(salonId) as any)
  }, [salonId, dispatch])

  const salon = salonDetail as Salon | null
  const loading = salonDetailLoading
  const error = salonDetailError
  const reviews = salon?.reviews ?? []

  return { salon, loading, error, reviews, refetchReviews }
}
