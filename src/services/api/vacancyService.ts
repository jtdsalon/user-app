import { AxiosResponse } from 'axios'
import networkClient from './networkClient'
import { HTTP_METHOD } from '../../lib/enums/httpData'
import { GET_VACANCIES_URL, GET_VACANCIES_BY_SALON_URL, SUBMIT_VACANCY_APPLICATION_URL } from './endPoints'

export interface VacancyRaw {
  id: string
  title: string
  type: string
  description: string
  requirements: string[]
  experience: string
  salaryRange: string | null
  status: string
  postedDate: string | null
  contactEmail: string
  contactPhone: string | null
  address: string | null
  salonId: string
  salonName?: string
  salonAddress?: string
  salonCategory?: string
}

export interface VacanciesPaginatedResponse {
  data: VacancyRaw[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export function getVacanciesApi(
  page = 1,
  limit = 20,
  search?: string | null,
  status?: string
): Promise<AxiosResponse<VacanciesPaginatedResponse>> {
  const params: Record<string, string | number> = { page, limit }
  if (search) params.search = search
  if (status) params.status = status
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_VACANCIES_URL,
    params,
  })
}

export function getVacanciesBySalonApi(salonId: string): Promise<AxiosResponse<{ data: VacancyRaw[] }>> {
  return networkClient().request({
    method: HTTP_METHOD.GET,
    url: GET_VACANCIES_BY_SALON_URL.replace('{salonId}', salonId),
  })
}

export interface SubmitApplicationPayload {
  name: string
  email: string
  portfolio: string
  resume?: string
  message?: string
}

export function submitVacancyApplicationApi(
  vacancyId: string,
  payload: SubmitApplicationPayload
): Promise<AxiosResponse<{ data: { id: string; vacancyId: string; status: string; createdAt: string } }>> {
  return networkClient().request({
    method: HTTP_METHOD.POST,
    url: SUBMIT_VACANCY_APPLICATION_URL.replace('{vacancyId}', vacancyId),
    data: payload,
  })
}

/** Format postedDate to "X days ago" style */
function formatPostedAt(dateStr: string | null): string {
  if (!dateStr) return 'Recently'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return d.toLocaleDateString()
}

/** Map API vacancy to JobListing shape for JobsView */
export function mapVacancyToJobListing(v: VacancyRaw): {
  id: string
  title: string
  salonName: string
  salonId?: string
  location: string
  salary: string
  type: 'Full-time' | 'Part-time' | 'Contract'
  postedAt: string
  description: string
  tags: string[]
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
} {
  const reqs = Array.isArray(v.requirements) ? v.requirements.map(String) : []
  const mid = Math.ceil(reqs.length / 2)
  const typeMap: Record<string, 'Full-time' | 'Part-time' | 'Contract'> = {
    fulltime: 'Full-time',
    'full-time': 'Full-time',
    parttime: 'Part-time',
    'part-time': 'Part-time',
    contract: 'Contract',
  }
  const typeKey = (v.type || '').toLowerCase().replace(/\s/g, '')
  const jobType = typeMap[typeKey] || 'Full-time'
  return {
    id: v.id,
    title: v.title || 'Position',
    salonName: v.salonName || 'Salon',
    salonId: v.salonId,
    location: v.salonAddress || v.address || 'Location TBD',
    salary: v.salaryRange || 'Competitive',
    type: jobType,
    postedAt: formatPostedAt(v.postedDate),
    description: v.description || '',
    tags: [v.type, v.experience, v.salonCategory].filter(Boolean) as string[],
    responsibilities: reqs.slice(0, mid).length ? reqs.slice(0, mid) : ['See description for details'],
    qualifications: reqs.slice(mid).length ? reqs.slice(mid) : [v.experience || 'See description for requirements'],
    benefits: ['Competitive compensation', 'Growth opportunities'],
  }
}
