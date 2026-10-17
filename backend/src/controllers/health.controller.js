import { checkSupabaseHealth } from '../config/supabase.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const getHealthStatus = asyncHandler(async (req, res) => {
  const dbHealth = await checkSupabaseHealth();

  const healthData = {
    status: 'online',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbHealth,
    shiprocketConfigured: Boolean(env.SHIPROCKET_EMAIL && env.SHIPROCKET_PASSWORD),
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
  };

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, healthData, 'Bramarambika Home Foods API is healthy')
  );
});
