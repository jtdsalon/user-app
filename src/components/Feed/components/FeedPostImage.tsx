import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ComparisonSlider } from '../ComparisonSlider';
import { getFullImageUrl } from '@/lib/util/imageUrl';

interface FeedPostImageProps {
  image?: string;
  imageBefore?: string;
  isTransformation?: boolean;
  onClick?: () => void;
}

export const FeedPostImage: React.FC<FeedPostImageProps> = ({
  image,
  imageBefore,
  isTransformation,
  onClick,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (!image) return null;

  const fullImage = getFullImageUrl(image) || image;
  const fullImageBefore = imageBefore ? (getFullImageUrl(imageBefore) || imageBefore) : undefined;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '40px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        aspectRatio: '1/1',
        boxShadow: isDarkMode
          ? '0 20px 50px rgba(0,0,0,0.4)'
          : '0 15px 35px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {isTransformation && fullImageBefore ? (
        <ComparisonSlider before={fullImageBefore} after={fullImage} />
      ) : (
        <Box
          component="img"
          src={fullImage}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Box>
  );
};
