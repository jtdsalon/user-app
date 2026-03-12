import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { FeedPost } from '../../types';
import type { RootState } from '@/state/store';
import { useRealtime } from '@/contexts/RealtimeContext';
import {
  getFavouritesFeedPosts,
  getPublicFeedPosts,
  createPost,
  updatePost,
  deletePost,
  updateFeedPost,
  togglePostLike,
  togglePostSave,
  addPostComment,
  updatePostComment,
  deletePostComment,
  togglePostCommentLike,
} from '@/state/feed';
import { getFilteredPosts, getBaseSuggestions } from '../../feedSelectors';
import type { FeedFilters } from '../../FeedSearch';

const FEED_PAGE_LIMIT = 20;

export function useFeedViewAction() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const feed = useSelector((s: RootState) => s.feed);

  const [viewTab, setViewTab] = useState(0);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FeedFilters>({
    categories: [],
    sortBy: 'newest',
    contentType: 'all',
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const initialFetchSentRef = useRef<{ favourites: boolean; public: boolean }>({ favourites: false, public: false });

  const activeSlice = viewTab === 0 ? feed.favourites : feed.public;
  const hasMore = activeSlice.page * FEED_PAGE_LIMIT < activeSlice.total;
  const isLoadingMore = activeSlice.loadingMore;

  const tabFilterAll = useCallback((_p: FeedPost) => true, []);

  const getFilteredBase = useCallback(() => {
    return getFilteredPosts(activeSlice.posts, searchQuery, activeFilters, tabFilterAll);
  }, [activeSlice.posts, searchQuery, activeFilters, tabFilterAll]);

  const displayedPosts = useMemo(() => getFilteredBase(), [getFilteredBase]);

  const searchSuggestions = useMemo(() => {
    return getBaseSuggestions(activeSlice.posts);
  }, [activeSlice.posts]);

  // Single effect: fetch initial page for current tab when needed. Ref prevents duplicate API calls (e.g. React Strict Mode double-invoke).
  useEffect(() => {
    if (viewTab === 0) {
      const shouldFetch =
        !initialFetchSentRef.current.favourites &&
        feed.favourites.posts.length === 0 &&
        !feed.favourites.loading &&
        !feed.favourites.requestedOnce;
      if (shouldFetch) {
        initialFetchSentRef.current.favourites = true;
        dispatch(getFavouritesFeedPosts({ page: 1 }));
      }
    } else {
      const shouldFetch =
        !initialFetchSentRef.current.public &&
        feed.public.posts.length === 0 &&
        !feed.public.loading &&
        !feed.public.requestedOnce;
      if (shouldFetch) {
        initialFetchSentRef.current.public = true;
        dispatch(getPublicFeedPosts({ page: 1 }));
      }
    }
  }, [
    dispatch,
    viewTab,
    feed.favourites.posts.length,
    feed.favourites.loading,
    feed.favourites.requestedOnce,
    feed.public.posts.length,
    feed.public.loading,
    feed.public.requestedOnce,
  ]);

  const realtime = useRealtime();
  useEffect(() => {
    if (!realtime) return;
    realtime.joinFeed();
    return () => {
      realtime.leaveFeed();
    };
  }, [realtime]);

  useEffect(() => {
    if (!realtime) return;
    return realtime.subscribe('feed_updated', () => {
      if (viewTab === 0) dispatch(getFavouritesFeedPosts({ page: 1, silent: true }));
      else dispatch(getPublicFeedPosts({ page: 1, silent: true }));
    });
  }, [realtime, dispatch, viewTab]);

  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    if (viewTab === 0) {
      dispatch(getFavouritesFeedPosts({ page: activeSlice.page + 1 }));
    } else {
      dispatch(getPublicFeedPosts({ page: activeSlice.page + 1 }));
    }
  }, [viewTab, activeSlice.page, isLoadingMore, hasMore, dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) loadMoreItems(); },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMoreItems]);

  const handleUpdatePost = useCallback((updated: FeedPost) => {
    dispatch(updateFeedPost(updated));
  }, [dispatch]);

  const handleDeletePost = useCallback((id: string) => {
    dispatch(deletePost(id));
  }, [dispatch]);

  const handleSavePost = useCallback((newPost: FeedPost) => {
    if (editingPost) {
      dispatch(updatePost(editingPost.id, {
        content: newPost.caption,
        image: newPost.image,
        image_before: newPost.imageBefore,
        is_transformation: newPost.isTransformation,
      }));
      setEditingPost(null);
    } else {
      dispatch(createPost({
        content: newPost.caption,
        image: newPost.image,
        image_before: newPost.imageBefore,
        is_transformation: newPost.isTransformation,
      }));
    }
    setIsComposerOpen(false);
  }, [dispatch, editingPost]);

  const handleToggleLike = useCallback((postId: string) => {
    dispatch(togglePostLike(postId));
  }, [dispatch]);

  const handleToggleSave = useCallback((postId: string) => {
    dispatch(togglePostSave(postId));
  }, [dispatch]);

  const handleAddComment = useCallback((postId: string, comment: string) => {
    dispatch(addPostComment(postId, comment));
  }, [dispatch]);

  const handleUpdateComment = useCallback((postId: string, commentId: string, comment: string) => {
    dispatch(updatePostComment(postId, commentId, comment));
  }, [dispatch]);

  const handleDeleteComment = useCallback((postId: string, commentId: string) => {
    dispatch(deletePostComment(postId, commentId));
  }, [dispatch]);

  const handleToggleCommentLike = useCallback((postId: string, commentId: string) => {
    dispatch(togglePostCommentLike(postId, commentId));
  }, [dispatch]);

  const handleOpenComposer = useCallback(() => {
    setEditingPost(null);
    setIsComposerOpen(true);
  }, []);
  const handleEditPost = useCallback((post: FeedPost) => {
    setEditingPost(post);
    setIsComposerOpen(true);
  }, []);
  const handleCloseComposer = useCallback(() => {
    setEditingPost(null);
    setIsComposerOpen(false);
  }, []);

  return {
    navigate,
    viewTab,
    setViewTab,
    displayedPosts,
    feed,
    loading: activeSlice.loading,
    error: activeSlice.error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    searchSuggestions,
    isLoadingMore,
    hasMore,
    isComposerOpen,
    editingPost,
    handleOpenComposer,
    handleEditPost,
    handleCloseComposer,
    handleUpdatePost,
    handleDeletePost,
    handleSavePost,
    handleToggleLike,
    handleToggleSave,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleToggleCommentLike,
    observerTarget,
  };
}
