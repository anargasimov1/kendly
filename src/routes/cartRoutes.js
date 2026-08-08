import express from 'express';
import cartController from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: Shopping cart APIs
 */

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/', cartController.getCart.bind(cartController));

/**
 * @openapi
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.post('/add', cartController.addToCart.bind(cartController));

/**
 * @openapi
 * /api/cart/update/{id}:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item quantity updated
 */
router.put('/update/:id', cartController.updateItemQuantity.bind(cartController));

/**
 * @openapi
 * /api/cart/remove/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
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
 *         description: Item removed from cart
 */
router.delete('/remove/:id', cartController.removeFromCart.bind(cartController));

/**
 * @openapi
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/clear', cartController.clearCart.bind(cartController));

/**
 * @openapi
 * /api/cart/preview:
 *   post:
 *     summary: Checkout preview
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delivery_zone_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Preview generated successfully
 */
router.post('/preview', cartController.checkoutPreview.bind(cartController));

export default router;
