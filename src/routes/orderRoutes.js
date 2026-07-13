import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/:id', getOrderById);

// Admin endpoints
router.get('/', isAdmin, getAllOrders);
router.patch('/:id/status', isAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
