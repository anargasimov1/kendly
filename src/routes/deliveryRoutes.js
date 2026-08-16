import express from 'express';
import deliveryController from '../controllers/deliveryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Delivery
 *     description: Delivery zone management APIs
 */

/**
 * @openapi
 * /api/delivery-zones:
 *   get:
 *     summary: Get all delivery zones
 *     description: Retrieve all available delivery zones.
 *     tags: [Delivery]
 *     responses:
 *       200:
 *         description: Delivery zones retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', deliveryController.getZones.bind(deliveryController));

// Admin routes
router.use(authMiddleware, isAdmin);

/**
 * @openapi
 * /api/delivery-zones:
 *   post:
 *     summary: Create a delivery zone
 *     description: Create a new delivery zone (Admin only).
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fee
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yasamal
 *               fee:
 *                 type: number
 *                 format: float
 *                 example: 3.5
 *               min_order_amount:
 *                 type: number
 *                 format: float
 *                 example: 50.0
 *     responses:
 *       201:
 *         description: Delivery zone created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', deliveryController.createZone.bind(deliveryController));

/**
 * @openapi
 * /api/delivery-zones/{id}:
 *   put:
 *     summary: Update a delivery zone
 *     description: Update an existing delivery zone (Admin only).
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nərimanov
 *               fee:
 *                 type: number
 *                 example: 4
 *               min_order_amount:
 *                 type: number
 *                 example: 60.0
 *     responses:
 *       200:
 *         description: Delivery zone updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Delivery zone not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', deliveryController.updateZone.bind(deliveryController));

/**
 * @openapi
 * /api/delivery-zones/{id}:
 *   delete:
 *     summary: Delete a delivery zone
 *     description: Delete a delivery zone by ID (Admin only).
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Delivery zone deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Delivery zone not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deliveryController.deleteZone.bind(deliveryController));

export default router;