import React, { useState, useEffect } from 'react';
import { Avatar, AvatarProps, Box, SxProps, Theme } from '@mui/material';
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

/** Sanitize and resolve image URL, with fallback to placeholder if null/empty */
export function getImageUrl(
  raw: string | undefined | null,
  type: ImagePlaceholderType = 'avatar'
): string {
  const resolved = getFullImageUrl(raw) || raw;
  if (!resolved || typeof resolved !== 'string') return PLACEHOLDERS[type];
  return resolved;
}

/** Avatar with onError fallback to default placeholder */
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
  const [imgSrc, setImgSrc] = useState<string>(() =>
    getImageUrl(src, placeholderType)
  );
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const url = getImageUrl(src, placeholderType);
    setImgSrc(url);
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
    <Avatar
      {...avatarProps}
      src={imgSrc}
      imgProps={{
        alt: alt || 'Avatar',
        loading: 'lazy',
        onError: handleError,
      }}
    >
      {children}
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
