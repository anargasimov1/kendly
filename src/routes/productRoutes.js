import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getPopularProducts,
  getWeeklyPicks,
  getMyProducts,
  uploadProductImage,
} from '../controllers/productController.js';
import { authMiddleware, authorize } from '../middleware/authMiddleware.js';
import { productImageUpload } from '../middleware/productUpload.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product management APIs
 */

/**
 * @openapi
 * /api/products/search:
 *   get:
 *     summary: Search products by name or description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (alias - search)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Alternative to q
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
 *     responses:
 *       200:
 *         description: Paginated search results
 *       400:
 *         description: Missing q or search parameter
 */

/**
 * @openapi
 * /api/products/popular:
 *   get:
 *     summary: Get popular products by sales count
 *     description: Returns active products sorted by sales_count descending.
 *     tags: [Products]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Paginated popular products with sales_count field
 */

/**
 * @openapi
 * /api/products/weekly-picks:
 *   get:
 *     summary: Get this week's featured products
 *     description: Returns products where is_weekly_choice is true.
 *     tags: [Products]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Paginated weekly pick products
 */

/**
 * @openapi
 * /api/products/mine:
 *   get:
 *     summary: Get my products (Farmer or Admin)
 *     description: Returns products owned by the authenticated user (owner_id = current user).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Paginated list of own products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Farmer or admin role required
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by name or description (case-insensitive)
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *         description: Filter by farmer user ID
 *       - in: query
 *         name: is_weekly_choice
 *         schema:
 *           type: boolean
 *         description: Filter weekly featured products
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [price, name, createdAt, sales_count, is_active]
 *         description: Sort column (use sales_count for popular)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
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
 *       - in: query
 *         name: product_type
 *         schema:
 *           type: string
 *           enum: [organic, homemade]
 *       - in: query
 *         name: is_best_seller
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: is_seasonal
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: is_natural
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated products with owner_id, owner, reviews, and rating_stats (total_reviews, average_rating, rating_distribution, rating_percentages)
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
 *               product_type:
 *                 type: string
 *                 enum: [organic, homemade]
 *               is_best_seller:
 *                 type: boolean
 *               is_seasonal:
 *                 type: boolean
 *               is_natural:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/search', searchProducts);
router.get('/popular', getPopularProducts);
router.get('/weekly-picks', getWeeklyPicks);
router.get('/mine', authMiddleware, authorize('admin', 'farmer'), getMyProducts);

/**
 * @openapi
 * /api/products/upload-image:
 *   post:
 *     summary: Upload a product image (Admin or Farmer)
 *     description: Yeni məhsul formasındakı şəkil sahəsi üçün faylı yükləyir və məhsul yaradılarkən images massivində istifadə ediləcək URL qaytarır. Yalnız şəkil faylları qəbul edilir; maksimal ölçü 5 MB-dir.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded image URL
 *       400:
 *         description: Missing, invalid or oversized image
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin or farmer only
 */
router.post('/upload-image', authMiddleware, authorize('admin', 'farmer'), productImageUpload.single('image'), uploadProductImage);
router.get('/', getAllProducts);
router.post('/', authMiddleware, authorize('admin', 'farmer'), createProduct);

/**
 * @openapi
 * /api/products/admin:
 *   get:
 *     summary: Get product management table (Admin only)
 *     description: Məhsullar ekranı üçün real Neon cədvəli. Axtarış, kateqoriya, rayon, stok və aktivlik filtrlərini dəstəkləyir. Hər məhsulda category, region, owner, stock_status və status qaytarılır.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Məhsul adı və ya təsviri ilə axtarış
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: stock_status
 *         schema:
 *           type: string
 *           enum: [in_stock, out_of_stock]
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
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
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Real Neon məhsulları və meta pagination məlumatı
 *       400:
 *         description: Yanlış filtr
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/admin', authMiddleware, authorize('admin'), getAllProducts);

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
 *         description: Product detail including owner, owner_id, reviews, and rating_stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rating_stats:
 *                   $ref: '#/components/schemas/RatingStats'
 *   put:
 *     summary: Update a product (Admin or Farmer)
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
 *               product_type:
 *                 type: string
 *                 enum: [organic, homemade]
 *               is_best_seller:
 *                 type: boolean
 *               is_seasonal:
 *                 type: boolean
 *               is_natural:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a product (Admin or Farmer)
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
