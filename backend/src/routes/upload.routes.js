import { Router } from 'express';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const router = Router();

/**
 * POST /api/upload
 * Handles base64 or dataURL image uploads from admin panel
 * Uploads directly to Cloudinary CDN for persistent public HTTPS URLs
 */
router.post('/', asyncHandler(async (req, res) => {
  const { image, name } = req.body;

  if (!image) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No image data provided for upload');
  }

  // If already a valid public HTTPS/HTTP URL, return as-is
  if (typeof image === 'string' && (image.startsWith('https://') || image.startsWith('http://'))) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { url: image }, 'Image URL verified')
    );
  }

  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Cloudinary image service is not configured. Please check environment variables.'
    );
  }

  // Match data URL format
  const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid image data format. Please upload JPG, PNG, or WebP.');
  }

  const safePublicId = (name || 'dish')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 30) || 'dish';

  try {
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
  } catch (err) {
    console.error('[Upload] Cloudinary upload failure:', err.message);
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to upload image to Cloudinary: ${err.message}`);
  }
}));

export default router;
