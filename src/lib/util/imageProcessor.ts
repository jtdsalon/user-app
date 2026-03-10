/**
 * High-performance automatic image optimization system.
 * Handles large file uploads (up to 50MB) with intelligent client-side processing.
 * Resizes, compresses, and converts to base64 for storage or API transmission.
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  /** Max file size in MB (default 50). Rejects larger files with clear error. */
  maxFileSizeMB?: number;
}

const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/heic-sequence'];
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.heics'];
const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence'];

function isHeicFile(file: File): boolean {
  return HEIC_TYPES.includes(file.type) || /\.(heic|heif|heics)$/i.test(file.name || '');
}

/** Convert HEIC/HEIF to JPEG using heic2any (for iOS Photos). */
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  const b = Array.isArray(blob) ? blob[0] : blob;
  return new File([b], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
}

/**
 * Intelligent Image Optimization System
 * - No file size blocking up to 50MB (safety limit)
 * - Smart resizing: max 1600px (width or height), maintains aspect ratio
 * - High-quality compression: JPEG 85% for minimal visual loss
 * - Format conversion: standardizes to optimized JPEG
 * - HEIC/HEIF: converted to JPEG via heic2any (iOS Photos)
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string> => {
  let workFile = file;
  if (isHeicFile(file)) {
    workFile = await convertHeicToJpeg(file);
  }
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    format = 'jpeg',
    maxFileSizeMB = 50,
  } = options;

  // 1. Safety check: excessive file size
  const fileSizeMB = workFile.size / (1024 * 1024);
  if (fileSizeMB > maxFileSizeMB) {
    throw new Error(
      `File is extremely large (${fileSizeMB.toFixed(1)}MB). Please use an image under ${maxFileSizeMB}MB.`
    );
  }

  // 2. Validate file type (allow by MIME or extension; some browsers report empty type)
  const ext = workFile.name ? '.' + workFile.name.split('.').pop()?.toLowerCase() : '';
  const validType = VALID_TYPES.includes(workFile.type) || VALID_EXTENSIONS.includes(ext) || (workFile.type && workFile.type.startsWith('image/'));
  if (!validType) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WEBP, GIF, or HEIC.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(workFile);

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 3. Intelligent resizing (maintain aspect ratio)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = `image/${format}`;
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);

        resolve(optimizedDataUrl);
      };

      img.onerror = () =>
        reject(new Error('Failed to load image for processing.'));
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
};

/**
 * Creates an instant preview URL for a file. Must be revoked when done to prevent memory leaks.
 * Use with URL.revokeObjectURL when replacing with optimized result.
 */
export const getPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Validates if a file is a supported image format.
 * @param maxSizeBytes - Max file size in bytes (default 50MB)
 */
export const isValidImageFile = (
  file: File,
  maxSizeBytes = 50 * 1024 * 1024
): boolean => {
  return VALID_TYPES.includes(file.type) && file.size <= maxSizeBytes;
};

/**
 * Compresses image without resizing.
 */
export const compressImage = (file: File, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
