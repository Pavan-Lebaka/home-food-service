import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  getOrderStats
} from '../controllers/orders.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

// Public checkout endpoint for customers
router.post(
  '/',
  validateBody(['phone', 'pincode', 'items', 'grand_total']),
  createOrder
);

// Admin-protected endpoints
router.get('/stats', requireAdmin, getOrderStats);
router.get('/', requireAdmin, getAllOrders);
router.get('/:id', requireAdmin, getOrderById);
router.patch('/:id', requireAdmin, updateOrder);

export default router;
