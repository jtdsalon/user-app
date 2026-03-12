import { useState, useRef, useCallback, useEffect } from 'react';
import { getFeedStrings } from '../../properties';
import { optimizeImage, getPreviewUrl } from '@/lib/util/imageProcessor';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import { searchUsersApi } from '@/services/api/userService';
import type { MentionUser } from '../../components/MentionSuggestionDropdown';
import type { FeedPost } from '../../types';

const SEARCH_DEBOUNCE_MS = 250;

export interface UseFeedComposerActionProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: FeedPost) => void;
  currentUser: any;
  initialPost?: FeedPost | null;
}

export function useFeedComposerAction({
  open,
  onClose,
  onSave,
  currentUser,
  initialPost,
}: UseFeedComposerActionProps) {
  const s = getFeedStrings();
  const [caption, setCaption] = useState('');
  const [imageAfter, setImageAfter] = useState<string | null>(null);
  const [imageBefore, setImageBefore] = useState<string | null>(null);
  const [previewUrlAfter, setPreviewUrlAfter] = useState<string | null>(null);
  const [previewUrlBefore, setPreviewUrlBefore] = useState<string | null>(null);
  const [isTransformation, setIsTransformation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({ open: false, message: '', severity: 'error' });
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionSearchLoading, setMentionSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && initialPost) {
      setCaption(initialPost.caption || '');
      setImageAfter(initialPost.image || null);
      setImageBefore(initialPost.imageBefore || null);
      setPreviewUrlAfter(null);
      setPreviewUrlBefore(null);
      setIsTransformation(initialPost.isTransformation || false);
    } else if (open && !initialPost) {
      setCaption('');
      setImageAfter(null);
      setImageBefore(null);
      setPreviewUrlAfter(null);
      setPreviewUrlBefore(null);
      setIsTransformation(false);
    }
  }, [open, initialPost]);

  const previewUrlsRef = useRef<{ after: string | null; before: string | null }>({ after: null, before: null });
  previewUrlsRef.current = { after: previewUrlAfter, before: previewUrlBefore };
  useEffect(() => () => {
    const { after, before } = previewUrlsRef.current;
    if (after) URL.revokeObjectURL(after);
    if (before) URL.revokeObjectURL(before);
  }, []);

  const handleCaptionChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPosition = e.target.selectionStart ?? 0;
      setCaption(value);
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');
      if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')) {
        const query = textBeforeCursor.substring(lastAt + 1);
        if (!query.includes(' ')) {
          setShowSuggestions(true);
          setSelectedIndex(0);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
            setMentionSearchLoading(true);
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
            } finally {
              setMentionSearchLoading(false);
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

  const handleSelectMention = useCallback((user: MentionUser) => {
    const cursorPosition = textFieldRef.current?.selectionStart ?? caption.length;
    const textBeforeCursor = caption.substring(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const newCaption =
      caption.substring(0, lastAt) +
      `@${user.username} ` +
      caption.substring(cursorPosition);
    setCaption(newCaption);
    setShowSuggestions(false);
    setTimeout(() => textFieldRef.current?.focus(), 0);
  }, [caption]);

  const handleUpload = useCallback((type: 'before' | 'after') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const prevImage = type === 'before' ? imageBefore : imageAfter;
    const previewUrl = getPreviewUrl(file);
    if (type === 'before') {
      setPreviewUrlBefore(previewUrl);
      setImageBefore(null);
    } else {
      setPreviewUrlAfter(previewUrl);
      setImageAfter(null);
    }
    setIsProcessing(true);
    try {
      const optimized = await optimizeImage(file, { maxWidth: 1600, quality: 0.85 });
      if (type === 'before') {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlBefore(null);
        setImageBefore(optimized);
      } else {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlAfter(null);
        setImageAfter(optimized);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image optimization failed';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      if (type === 'before') {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlBefore(null);
        setImageBefore(prevImage);
      } else {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrlAfter(null);
        setImageAfter(prevImage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [imageBefore, imageAfter]);

  const removeImage = useCallback((type: 'before' | 'after') => {
    const revoke = (url: string | null) => url && URL.revokeObjectURL(url);
    if (type === 'after') {
      revoke(previewUrlAfter);
      setPreviewUrlAfter(null);
      setImageAfter(null);
    } else {
      revoke(previewUrlBefore);
      setPreviewUrlBefore(null);
      setImageBefore(null);
    }
  }, [previewUrlAfter, previewUrlBefore]);

  const handleSaveInternal = useCallback(() => {
    if (!caption.trim() && !imageAfter) return;
    onSave({
      id: initialPost?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || initialPost?.userId || 'me',
      userName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : s.common.anonymous,
      userAvatar: getFullImageUrl(currentUser?.avatar) || undefined,
      userType: 'customer',
      caption: caption.trim(),
      image: imageAfter || undefined,
      imageBefore: isTransformation ? imageBefore || undefined : undefined,
      isTransformation: isTransformation && !!imageAfter && !!imageBefore,
      likes: 0,
      timeAgo: s.common.justNow,
      comments: [],
    });
    setCaption('');
    setImageAfter(null);
    setImageBefore(null);
    onClose();
  }, [caption, imageAfter, imageBefore, isTransformation, initialPost, currentUser, s, onSave, onClose]);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const displayImg = useCallback((t: 'before' | 'after') => (t === 'after' ? (imageAfter || previewUrlAfter) : (imageBefore || previewUrlBefore)), [imageAfter, imageBefore, previewUrlAfter, previewUrlBefore]);

  return {
    s,
    caption,
    setCaption,
    imageAfter,
    imageBefore,
    previewUrlAfter,
    previewUrlBefore,
    isTransformation,
    setIsTransformation,
    isProcessing,
    snackbar,
    closeSnackbar,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    mentionSearchLoading,
    selectedIndex,
    setSelectedIndex,
    textFieldRef,
    afterInputRef,
    beforeInputRef,
    handleCaptionChange,
    handleSelectMention,
    handleUpload,
    removeImage,
    handleSaveInternal,
    displayImg,
  };
}
