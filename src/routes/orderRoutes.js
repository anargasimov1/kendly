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

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Order management APIs
 */

router.use(authMiddleware);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create an order from Cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_id
 *             properties:
 *               address_id:
 *                 type: integer
 *               delivery_zone_id:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *                 enum: [card, cash]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad Request (Cart empty or validation failed)
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', validate(createOrderSchema), createOrder);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', getOrderById);

// Admin endpoints
router.get('/', isAdmin, getAllOrders);

/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */

router.patch('/:id/status', isAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
