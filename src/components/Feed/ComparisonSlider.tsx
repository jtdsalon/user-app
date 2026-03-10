
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowLeftRight } from 'lucide-react';

const COLORS = {
  primary: '#0F172A',
  accentGold: '#D4AF37',
};

export const ComparisonSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderPos(percentage);
  };

  const startDragging = () => { isDragging.current = true; };
  const stopDragging = () => { isDragging.current = false; };

  useEffect(() => {
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, []);

  return (
    <Box 
      ref={containerRef}
      onMouseDown={startDragging}
      onTouchStart={startDragging}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        cursor: 'ew-resize',
        userSelect: 'none'
      }}
    >
      <Box 
        component="img" 
        src={after} 
        alt="After"
        sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          zIndex: 2
        }}
      >
        <Box 
          component="img" 
          src={before} 
          alt="Before"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </Box>

      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 5, pointerEvents: 'none', opacity: sliderPos > 20 ? 1 : 0, transition: 'opacity 0.3s' }}>
        <Typography sx={{ fontSize: '8px', fontWeight: 900, color: '#fff', letterSpacing: '0.2em', textShadow: '0 2px 4px rgba(0,0,0,0.5)', bgcolor: 'rgba(0,0,0,0.2)', px: 1, py: 0.5, borderRadius: '4px' }}>ORIGIN</Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 5, pointerEvents: 'none', opacity: sliderPos < 80 ? 1 : 0, transition: 'opacity 0.3s' }}>
        <Typography sx={{ fontSize: '8px', fontWeight: 900, color: COLORS.accentGold, letterSpacing: '0.2em', textShadow: '0 2px 4px rgba(0,0,0,0.5)', bgcolor: 'rgba(0,0,0,0.2)', px: 1, py: 0.5, borderRadius: '4px' }}>MASTERPIECE</Typography>
      </Box>

      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: `${sliderPos}%`, 
          width: '2px', 
          bgcolor: COLORS.accentGold,
          zIndex: 10,
          transform: 'translateX(-50%)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            bgcolor: COLORS.primary,
            border: `2px solid ${COLORS.accentGold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            color: COLORS.accentGold,
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': { transform: 'translate(-50%, -50%) scale(1.1)' }
          }}
        >
          <ArrowLeftRight size={16} strokeWidth={3} />
        </Box>
      </Box>
    </Box>
  );
};
