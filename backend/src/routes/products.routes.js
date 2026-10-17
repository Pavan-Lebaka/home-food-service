import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
} from '../controllers/products.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

// Public routes for storefront
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only management routes
router.post('/', requireAdmin, validateBody(['name', 'pricePerKg']), createProduct);
router.patch('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);
router.post('/seed', requireAdmin, seedProducts);

export default router;
