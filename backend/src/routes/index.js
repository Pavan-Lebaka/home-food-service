import { Router } from 'express';
import authRoutes from './auth.routes.js';
import ordersRoutes from './orders.routes.js';
import shiprocketRoutes from './shiprocket.routes.js';
import healthRoutes from './health.routes.js';
import productsRoutes from './products.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/shipping', shiprocketRoutes);
router.use('/health', healthRoutes);
router.use('/products', productsRoutes);
router.use('/upload', uploadRoutes);

export default router;
