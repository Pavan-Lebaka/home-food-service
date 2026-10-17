import { Router } from 'express';
import {
  checkServiceability,
  createShipment,
  trackShipment
} from '../controllers/shiprocket.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Serviceability check (public so customer can view delivery estimate & rates at checkout)
router.get('/serviceability', checkServiceability);
router.get('/serviceability/:pincode', checkServiceability);

// Parcel booking (Admin only)
router.post('/shipment', requireAdmin, createShipment);

// Tracking (Public / customer & admin)
router.get('/track/:awbCode', trackShipment);

export default router;
