import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authMiddleware, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product management APIs
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a product (Admin or Farmer)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *               owner_id:
 *                 type: integer
 *               region_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', getAllProducts);
router.post('/', authMiddleware, authorize('admin', 'farmer'), createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
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
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *               owner_id:
 *                 type: integer
 *               region_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
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
 *         description: Deleted
 */
router.get('/:id', getProductById);
router.put('/:id', authMiddleware, authorize('admin', 'farmer'), updateProduct);
router.delete('/:id', authMiddleware, authorize('admin', 'farmer'), deleteProduct);

export default router;
