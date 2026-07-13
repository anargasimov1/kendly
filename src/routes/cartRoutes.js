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
 */
router.get('/', cartController.getCart.bind(cartController));

/**
 * @openapi
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 */
router.post('/add', cartController.addToCart.bind(cartController));

/**
 * @openapi
 * /api/cart/update/{id}:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/update/:id', cartController.updateItemQuantity.bind(cartController));

/**
 * @openapi
 * /api/cart/remove/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/remove/:id', cartController.removeFromCart.bind(cartController));

/**
 * @openapi
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 */
router.delete('/clear', cartController.clearCart.bind(cartController));

/**
 * @openapi
 * /api/cart/preview:
 *   post:
 *     summary: Checkout preview
 *     tags: [Cart]
 */
router.post('/preview', cartController.checkoutPreview.bind(cartController));

export default router;
