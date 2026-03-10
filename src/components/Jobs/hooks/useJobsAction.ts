import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import type { JobListing } from '../constants';
import type { RootState } from '@/state/store';
import { getVacancies } from '@/state/vacancy';

const JOBS_PER_PAGE = 6;

export function useJobsAction() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vacancy = useSelector((s: RootState) => s.vacancy);

  const [expanded, setExpanded] = useState<string | false>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('luxe_applied_jobs');
    if (saved) {
      try {
        setAppliedJobIds(JSON.parse(saved));
      } catch {
        setAppliedJobIds([]);
      }
    }
  }, []);

  const handleApplySuccess = useCallback((jobId: string) => {
    setAppliedJobIds(prev => {
      const updated = [...prev, jobId];
      localStorage.setItem('luxe_applied_jobs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleOpenApply = useCallback((job: JobListing) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  }, []);

  const handleCloseApply = useCallback(() => {
    setIsApplyDialogOpen(false);
  }, []);

  const fetchJobs = useCallback((page = 1) => {
    dispatch(getVacancies({ page, search: searchQuery || undefined }));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    setVisibleCount(JOBS_PER_PAGE);
    fetchJobs(1);
  }, [searchQuery, fetchJobs]);

  const filteredJobs = useMemo(() => {
    const jobs = vacancy.jobs;
    if (jobs.length === 0) return [];
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.salonName.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      (job.tags || []).some(t => String(t).toLowerCase().includes(query))
    );
  }, [vacancy.jobs, searchQuery]);

  useEffect(() => {
    setVisibleCount(JOBS_PER_PAGE);
  }, [searchQuery]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;
  const hasMoreApi = vacancy.pagination.page < vacancy.pagination.totalPages;

  const handleLoadMore = useCallback(() => {
    if (visibleCount < filteredJobs.length) {
      setIsMoreLoading(true);
      setTimeout(() => {
        setVisibleCount(prev => prev + JOBS_PER_PAGE);
        setIsMoreLoading(false);
      }, 600);
    } else if (hasMoreApi && !vacancy.loadMoreLoading) {
      fetchJobs(vacancy.pagination.page + 1);
    }
  }, [visibleCount, filteredJobs.length, hasMoreApi, vacancy.loadMoreLoading, vacancy.pagination.page, fetchJobs]);

  const handleChange = useCallback((panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  }, []);

  const handleNavigateToSalon = useCallback((salonId: string) => {
    navigate(`/salon/${salonId}`);
  }, [navigate]);

  const setSearchQueryHandler = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return {
    theme,
    navigate,
    searchQuery,
    setSearchQuery: setSearchQueryHandler,
    expanded,
    visibleCount,
    isMoreLoading,
    jobs: vacancy.jobs,
    loading: vacancy.loading,
    apiLoadingMore: vacancy.loadMoreLoading,
    apiPage: vacancy.pagination.page,
    hasMoreApi,
    selectedJob,
    isApplyDialogOpen,
    appliedJobIds,
    filteredJobs,
    visibleJobs,
    hasMore,
    JOBS_PER_PAGE,
    handleApplySuccess,
    handleOpenApply,
    handleCloseApply,
    handleLoadMore,
    handleChange,
    handleNavigateToSalon,
  };
}
