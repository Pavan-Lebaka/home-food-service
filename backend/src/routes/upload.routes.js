import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Directories to persist uploaded images
const BACKEND_IMG_DIR = path.resolve(__dirname, '../../public/images');
const FRONTEND_IMG_DIR = path.resolve(__dirname, '../../../frontend/public/images');
const ADMIN_IMG_DIR = path.resolve(__dirname, '../../../admin/public/images');

// Safely ensure backend image directory exists without crashing on containerized environments
try {
  if (!fs.existsSync(BACKEND_IMG_DIR)) {
    fs.mkdirSync(BACKEND_IMG_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Upload] Note: Backend images directory not initialized at startup:', err.message);
}

/**
 * POST /api/upload
 * Handles base64 or dataURL image uploads from admin panel
 * Uploads to Cloudinary CDN for persistent public HTTPS URLs, or falls back to local storage
 */
router.post('/', asyncHandler(async (req, res) => {
  const { image, name } = req.body;

  if (!image) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No image data provided for upload');
  }

  // If it's already an existing clean path (e.g. /images/avakaya.jpg) or full URL, return it
  if (typeof image === 'string' && (image.startsWith('/images/') || image.startsWith('http://') || image.startsWith('https://'))) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { url: image }, 'Image path verified')
    );
  }

  // 1. If Cloudinary is configured, upload directly to Cloudinary CDN
  if (isCloudinaryConfigured()) {
    try {
      const safePublicId = (name || 'dish')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 30) || 'dish';

      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: 'bramarambika_foods',
        public_id: `${safePublicId}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      console.log(`[Upload] Cloudinary upload successful: ${uploadResult.secure_url}`);

      return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes
          },
          'Photo uploaded successfully to Cloudinary CDN'
        )
      );
    } catch (cloudErr) {
      console.error('[Upload] Cloudinary upload error:', cloudErr.message);
      // Fall through to local storage if Cloudinary upload fails
    }
  }

  // Match data URL format
  const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid image data format. Please upload JPG, PNG, or WebP.');
  }

  let ext = matches[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext === 'svg+xml') ext = 'svg';

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Max 8MB
  if (buffer.length > 8 * 1024 * 1024) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image file exceeds 8MB limit.');
  }

  // Generate safe filename from name or timestamp
  const safeBase = (name || 'dish')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 30) || 'dish';

  const filename = `${safeBase}_${Date.now()}.${ext}`;

  // Build public URL - use full URL if host available so Netlify storefront can load Render backend images directly
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const publicUrl = host ? `${protocol}://${host}/images/${filename}` : `/images/${filename}`;

  // Write to backend public folder first
  const targetDirs = [BACKEND_IMG_DIR];

  // In local monorepo development, also save to frontend and admin if directories exist
  try {
    if (fs.existsSync(FRONTEND_IMG_DIR)) targetDirs.push(FRONTEND_IMG_DIR);
    if (fs.existsSync(ADMIN_IMG_DIR)) targetDirs.push(ADMIN_IMG_DIR);
  } catch (err) {
    // Ignore errors checking external directories in containerized environments
  }

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, filename), buffer);
    } catch (err) {
      console.warn(`[Upload] Failed to save image to ${dir}:`, err.message);
    }
  }

  console.log(`[Upload] New image saved: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      {
        url: publicUrl,
        filename,
        size: buffer.length
      },
      'Photo uploaded successfully'
    )
  );
}));

export default router;
