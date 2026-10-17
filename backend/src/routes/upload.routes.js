import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Directories to persist uploaded images
const FRONTEND_IMG_DIR = path.resolve(__dirname, '../../../frontend/public/images');
const ADMIN_IMG_DIR = path.resolve(__dirname, '../../../admin/public/images');
const BACKEND_IMG_DIR = path.resolve(__dirname, '../../public/images');

// Ensure image directories exist
[FRONTEND_IMG_DIR, ADMIN_IMG_DIR, BACKEND_IMG_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * POST /api/upload
 * Handles base64 or dataURL image uploads from admin panel
 * Saves authentic high-res image files to public/images and returns public URL
 */
router.post('/', asyncHandler(async (req, res) => {
  const { image, name } = req.body;

  if (!image) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No image data provided for upload');
  }

  // If it's already an existing clean path (e.g. /images/avakaya.jpg), just return it
  if (typeof image === 'string' && image.startsWith('/images/')) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { url: image }, 'Image path verified')
    );
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
  const publicUrl = `/images/${filename}`;

  // Write to all client public image folders
  const targetDirs = [FRONTEND_IMG_DIR, ADMIN_IMG_DIR, BACKEND_IMG_DIR];
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
