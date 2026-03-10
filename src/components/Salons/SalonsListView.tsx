import React, { useEffect, useState, useCallback } from 'react'
import { Box, Container, Grid2, Button, CircularProgress, Typography } from '@mui/material'
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import SalonCard from '../common/SalonCard/SalonCard'
import { getSalonsCursorApi, getSalonsByCategoryApi, normalizeSalonList } from '@/services/api/salonService'
import { MainLayout } from '../common/layouts/MainLayout';
import { useLayout } from '../common/layouts/layoutContext'

const parseQuery = (search: string) => new URLSearchParams(search)

const SalonsListView: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { favorites, toggleFavorite, handleOpenBooking } = useLayout()

  const q = parseQuery(location.search)
  const category = q.get('category') || undefined

  const [items, setItems] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const fetchPage = useCallback(async (nextCursor?: string | null, nextPage?: number, append = false) => {
    try {
      if (append) setLoadingMore(true)
      else { setLoading(true); setError(null); setItems([]) }

      if (category && category !== 'All') {
        const pageNum = nextPage ?? 1
        const resp: any = await getSalonsByCategoryApi(category, pageNum, 20)
        const payload = resp?.data ?? {}
        const dataArr = payload.data ?? payload.items ?? payload.salons ?? []
        const pagination = payload.pagination ?? {}
        const total = pagination.totalPages ?? pagination.pages ?? 0
        const normalized = normalizeSalonList(Array.isArray(dataArr) ? dataArr : [])
        if (append) setItems(prev => [...prev, ...normalized])
        else setItems(normalized)
        setPage(pageNum)
        setTotalPages(total)
        setHasMore(pageNum < total)
      } else {
        const resp: any = await getSalonsCursorApi(undefined, nextCursor || null, 20)
        const payload = resp?.data ?? {}
        const dataArr = payload.data ?? payload.items ?? payload.salons ?? []
        const next = payload.nextCursor ?? payload.cursor ?? payload.next ?? null
        const normalized = normalizeSalonList(Array.isArray(dataArr) ? dataArr : [])
        if (append) setItems(prev => [...prev, ...normalized])
        else setItems(normalized)
        setCursor(next ?? null)
        setHasMore(!!next && normalized.length > 0)
      }
    } catch (e) {
      console.error('Failed to fetch salons', e)
      setError('Failed to load salons')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category])

  useEffect(() => {
    setItems([])
    setCursor(null)
    setPage(1)
    setHasMore(true)
    fetchPage(null, 1, false)
  }, [category, fetchPage])

  const loadMore = () => {
    if (!hasMore || loadingMore) return
    if (category && category !== 'All') {
      fetchPage(null, page + 1, true)
    } else {
      fetchPage(cursor, undefined, true)
    }
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{category ? `${category}` : 'All Salons'}</Typography>
          <Button
            onClick={() => navigate('/home')}
            startIcon={<ChevronLeft size={14} />}
            sx={{ fontSize: '10px', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}
          >
            BACK
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error">{error}</Typography>
            <Button onClick={() => fetchPage(null, 1, false)}>Retry</Button>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : (
          <Grid2 container spacing={3}>
            {items.map(salon => (
              <Grid2 key={salon.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <SalonCard salon={salon} onBook={(s) => handleOpenBooking(s as any)} onViewProfile={() => navigate(`/salon/${salon.id}`)} isFavorite={favorites.includes(salon.id)} onToggleFavorite={toggleFavorite} />
              </Grid2>
            ))}
          </Grid2>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          {loadingMore ? (
            <CircularProgress />
          ) : hasMore ? (
            <Button variant="contained" onClick={loadMore}>Load more</Button>
          ) : (
            <Typography color="text.secondary">No more salons</Typography>
          )}
        </Box>
      </Container>
    </MainLayout>
  )
}

export default SalonsListView
