import express from 'express';
import {
  createOrder,
  getAllOrders,
  getAdminOrders,
  exportAdminOrders,
  getOrderById,
  updateOrderStatus,
  reorder,
  getReceipt,
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
 * /api/orders/admin:
 *   get:
 *     summary: Admin order table with search, filters and pagination
 *     description: Sifarişlər ekranı üçün status tablarının sayları, sifariş ID/müştəri axtarışı və səhifələnmiş cədvəl məlumatı.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, delivered, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Sifariş ID-si, müştəri adı, e-poçtu və ya telefonu
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Sifariş cədvəli, pagination və status_counts
 *       400:
 *         description: Yanlış filtr parametri
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/admin', isAdmin, getAdminOrders);

/**
 * @openapi
 * /api/orders/admin/export:
 *   get:
 *     summary: Export filtered admin orders as an Excel file
 *     description: Sifarişlər ekranındakı “Excel yüklə” düyməsi üçün real .xlsx faylı qaytarır.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, delivered, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: XLSX file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/admin/export', isAdmin, exportAdminOrders);

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
 *         description: Order details with line items, product info, and farmer data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 customer_name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 address_id:
 *                   type: integer
 *                 cart_id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 notes:
 *                   type: string
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 total_amount:
 *                   type: number
 *                 farmer_name:
 *                   type: string
 *                   nullable: true
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         nullable: true
 *                       images:
 *                         type: array
 *                         nullable: true
 *                       owner_id:
 *                         type: integer
 *                         nullable: true
 *                       farmer_name:
 *                         type: string
 *                         nullable: true
 *                       farmer:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           farmer_profile:
 *                             type: object
 *                             nullable: true
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       total:
 *                         type: number
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get('/:id', getOrderById);

/**
 * @openapi
 * /api/orders/{id}/reorder:
 *   post:
 *     summary: Reorder previous order
 *     description: Sifarişin içindəki məhsulları yenidən səbətə əlavə edir.
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
 *         description: Məhsullar səbətə əlavə olundu
 *       403:
 *         description: İcazəniz yoxdur
 *       404:
 *         description: Sifariş tapılmadı
 */
router.post('/:id/reorder', reorder);

/**
 * @openapi
 * /api/orders/{id}/receipt:
 *   get:
 *     summary: Get order receipt data
 *     description: Faktura/Qəbz formatında hazırlamaq üçün məlumatları qaytarır.
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
 *         description: Qəbz məlumatları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipt_no:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 customer_name:
 *                   type: string
 *                 customer_phone:
 *                   type: string
 *                 delivery_address:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total_amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       403:
 *         description: İcazəniz yoxdur
 *       404:
 *         description: Sifariş tapılmadı
 */
router.get('/:id/receipt', getReceipt);

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
