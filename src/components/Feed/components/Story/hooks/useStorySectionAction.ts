import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../../Auth/AuthContext';
import { searchUsersApi } from '@/services/api/userService';
import { optimizeImage, getPreviewUrl } from '@/lib/util/imageProcessor';
import type { MentionUser } from '../../MentionSuggestionDropdown';
import type { Story } from '@/services/api/storyService';
import type { RootState } from '@/state/store';
import { getStories, createStory, deleteStory } from '@/state/story';

const SEARCH_DEBOUNCE_MS = 250;

export function useStorySectionAction() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { stories, loading: isLoading, createLoading: isSubmitting, createError, deleteError } = useSelector((s: RootState) => s.story);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const previousCreateLoadingRef = useRef(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState<{ title: string; images: string[] }>({ title: '', images: [] });
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    dispatch(getStories() as any);
  }, [dispatch]);

  useEffect(() => {
    if (previousCreateLoadingRef.current && !isSubmitting && !createError) {
      setIsDialogOpen(false);
      setNewStory({ title: '', images: [] });
    }
    previousCreateLoadingRef.current = isSubmitting;
  }, [isSubmitting, createError]);

  useEffect(() => {
    if (createError) {
      const msg = (createError as any)?.errorMessage ?? (createError as Error)?.message ?? 'Failed to create story';
      setSnackbar({ open: true, message: msg });
    }
  }, [createError]);

  useEffect(() => {
    if (deleteError) {
      setSnackbar({ open: true, message: (deleteError as any)?.message ?? 'Failed to delete story' });
    }
  }, [deleteError]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    event.target.value = '';

    setIsProcessingImages(true);
    try {
      for (const file of filesArray) {
        const previewUrl = getPreviewUrl(file);
        setNewStory(prev => ({ ...prev, images: [...prev.images, previewUrl] }));
        try {
          const optimized = await optimizeImage(file, { maxWidth: 1200, maxHeight: 1600, quality: 0.85 });
          setNewStory(prev => {
            const arr = [...prev.images];
            const idx = arr.length - 1;
            if (typeof arr[idx] === 'string' && arr[idx].startsWith('blob:')) {
              URL.revokeObjectURL(arr[idx]);
            }
            arr[idx] = optimized;
            return { ...prev, images: arr };
          });
        } catch (err) {
          setNewStory(prev => {
            const arr = prev.images.filter((_, i) => i !== prev.images.length - 1);
            if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewUrl);
            }
            return { ...prev, images: arr };
          });
          const msg = err instanceof Error ? err.message : (err as any)?.errorMessage ?? 'Image optimization failed';
          setSnackbar({ open: true, message: msg });
        }
      }
    } finally {
      setIsProcessingImages(false);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setNewStory(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const handleTitleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPosition = (e.target as HTMLInputElement).selectionStart ?? 0;
      setNewStory(prev => ({ ...prev, title: value }));

      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');

      if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')) {
        const query = textBeforeCursor.substring(lastAt + 1);
        if (!query.includes(' ')) {
          setShowSuggestions(true);
          setSelectedIndex(0);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
            try {
              const res = await searchUsersApi(query);
              const data = res?.data?.data ?? [];
              setSuggestions(
                Array.isArray(data)
                  ? data.map((u: any) => ({
                      id: u.id,
                      name: u.name || 'User',
                      username: u.username || u.id,
                      avatar: u.avatar,
                    }))
                  : []
              );
            } catch {
              setSuggestions([]);
            }
            debounceRef.current = null;
          }, SEARCH_DEBOUNCE_MS);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    },
    []
  );

  const handleSelectMention = useCallback((mentionUser: MentionUser) => {
    const input = storyInputRef.current;
    const cursorPosition = (input as HTMLTextAreaElement)?.selectionStart ?? newStory.title.length;
    const textBeforeCursor = newStory.title.substring(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    const updatedTitle =
      newStory.title.substring(0, lastAt) +
      `@${mentionUser.username} ` +
      newStory.title.substring(cursorPosition);

    setNewStory(prev => ({ ...prev, title: updatedTitle }));
    setShowSuggestions(false);
    storyInputRef.current?.focus();
  }, [newStory.title]);

  const handleAddStory = useCallback(() => {
    if (!newStory.title || newStory.images.length === 0) return;
    dispatch(createStory({ title: newStory.title, images: newStory.images }) as any);
  }, [newStory.title, newStory.images, dispatch]);

  const handleDeleteStory = useCallback((e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    setStoryToDelete(storyId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!storyToDelete) return;
    setSelectedStory(prev => (prev?.id === storyToDelete ? null : prev));
    dispatch(deleteStory(storyToDelete) as any);
    setStoryToDelete(null);
  }, [storyToDelete, dispatch]);

  const openStory = useCallback((story: Story) => {
    setSelectedStory(story);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    if (!selectedStory) return;
    if (currentImageIndex < selectedStory.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setSelectedStory(null);
    }
  }, [selectedStory, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (!selectedStory) return;
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [selectedStory, currentImageIndex]);

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  return {
    user,
    fileInputRef,
    storyInputRef,
    inputContainerRef,
    stories,
    isLoading,
    isSubmitting,
    isDialogOpen,
    setIsDialogOpen,
    newStory,
    storyToDelete,
    setStoryToDelete,
    snackbar,
    closeSnackbar,
    isProcessingImages,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    selectedStory,
    setSelectedStory,
    currentImageIndex,
    handleFileSelect,
    removeImage,
    handleTitleChange,
    handleSelectMention,
    handleAddStory,
    handleDeleteStory,
    confirmDelete,
    openStory,
    nextImage,
    prevImage,
  };
}
