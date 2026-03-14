import React, { useState, useEffect } from 'react';
import { Avatar, AvatarProps, Box, SxProps, Theme } from '@mui/material';
import { User } from 'lucide-react';
import { getFullImageUrl } from '@/lib/util/imageUrl';
import {
  DEFAULT_COVER_URL,
  DEFAULT_AVATAR_URL,
  DEFAULT_STAFF_AVATAR_URL,
} from '@/lib/util/imagePlaceholders';

export type ImagePlaceholderType = 'cover' | 'avatar' | 'staff';

const PLACEHOLDERS: Record<ImagePlaceholderType, string> = {
  cover: DEFAULT_COVER_URL,
  avatar: DEFAULT_AVATAR_URL,
  staff: DEFAULT_STAFF_AVATAR_URL,
};

/** Resolve image URL; for avatar/staff returns empty string when no image (caller shows icon). */
export function getImageUrl(
  raw: string | undefined | null,
  type: ImagePlaceholderType = 'avatar'
): string {
  const resolved = getFullImageUrl(raw) || raw;
  if (!resolved || typeof resolved !== 'string') {
    return type === 'cover' ? PLACEHOLDERS[type] : '';
  }
  return resolved;
}

/** Avatar: show actual image, or User icon when no image / on error (no mock placeholder URLs). */
export interface AvatarWithFallbackProps extends Omit<AvatarProps, 'src'> {
  src: string | undefined | null;
  alt?: string;
  placeholderType?: ImagePlaceholderType;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt = '',
  placeholderType = 'avatar',
  children,
  ...avatarProps
}) => {
  const resolvedUrl = getImageUrl(src, placeholderType);
  const useIconWhenEmpty = placeholderType === 'avatar' || placeholderType === 'staff';
  const [imgSrc, setImgSrc] = useState<string>(() =>
    useIconWhenEmpty && !resolvedUrl ? '' : (resolvedUrl || PLACEHOLDERS[placeholderType])
  );
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const url = getImageUrl(src, placeholderType);
    if (useIconWhenEmpty && !url) {
      setImgSrc('');
      setErrored(false);
    } else {
      setImgSrc(url || PLACEHOLDERS[placeholderType]);
      setErrored(false);
    }
  }, [src, placeholderType, useIconWhenEmpty]);

  const handleError = () => {
    if (!errored) {
      setErrored(true);
      setImgSrc(useIconWhenEmpty ? '' : PLACEHOLDERS[placeholderType]);
    }
  };

  const showIcon = (useIconWhenEmpty && (!imgSrc || errored));
  const displayChildren = showIcon ? (children ?? <User size={24} strokeWidth={1.5} />) : children;

  return (
    <Avatar
      {...avatarProps}
      src={showIcon ? undefined : imgSrc || undefined}
      imgProps={
        showIcon
          ? undefined
          : {
              alt: alt || 'Avatar',
              loading: 'lazy',
              onError: handleError,
            }
      }
    >
      {displayChildren}
    </Avatar>
  );
};

/** Cover/banner image with onError fallback and lazy loading */
export interface ImageWithFallbackProps {
  src: string | undefined | null;
  alt?: string;
  placeholderType?: ImagePlaceholderType;
  sx?: SxProps<Theme>;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  placeholderType = 'cover',
  sx,
  objectFit = 'cover',
}) => {
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(src, placeholderType));
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setImgSrc(getImageUrl(src, placeholderType));
    setErrored(false);
  }, [src, placeholderType]);

  const fallback = PLACEHOLDERS[placeholderType];

  const handleError = () => {
    if (!errored) {
      setErrored(true);
      setImgSrc(fallback);
    }
  };

  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      sx={{
        width: '100%',
        height: '100%',
        objectFit,
        ...(typeof sx === 'object' && sx),
      }}
    />
  );
};
