import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProductReviewSchema,
  createComboReviewSchema,
  updateReviewSchema,
} from '../validators/reviewValidator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: Product and combo menu reviews management APIs
 */

/**
 * @openapi
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get reviews for a product
 *     description: Retrieve all reviews for a specific product.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: |
 *           Reviews list with rating statistics.
 *           `rating_stats` includes: total_reviews, average_rating, rating_distribution (count per star), rating_percentages (% per star).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                 rating_stats:
 *                   $ref: '#/components/schemas/RatingStats'
 *       500:
 *         description: Internal server error
 */
router.get('/product/:productId', ReviewController.getProductReviews);

/**
 * @openapi
 * /api/reviews/combo/{comboId}:
 *   get:
 *     summary: Get reviews for a combo menu
 *     description: Retrieve all reviews for a specific combo menu.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: comboId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: |
 *           Combo reviews list with rating statistics.
 *           `rating_stats` includes: total_reviews, average_rating, rating_distribution, rating_percentages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/combo/:comboId', ReviewController.getComboReviews);

/**
 * @openapi
 * /api/reviews/eligibility/product/{productId}:
 *   get:
 *     summary: Check if user can write a product review
 *     description: |
 *       Frontend bu endpoint ilə rəy formunu göstərib-gizlədə bilər.
 *       `can_review: true` yalnız sifariş **delivered** (tamamlandı) olduqda qaytarılır.
 *
 *       `reason` dəyərləri:
 *       - `not_purchased` — heç sifariş etməyib
 *       - `order_not_delivered` — sifariş var, amma hələ tamamlanmayıb
 *       - `already_reviewed` — artıq rəy yazılıb (`review_id` ilə yeniləmək olar)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Review eligibility result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 can_review:
 *                   type: boolean
 *                 has_review:
 *                   type: boolean
 *                 review_id:
 *                   type: integer
 *                 reason:
 *                   type: string
 *                   enum: [not_purchased, order_not_delivered, already_reviewed]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get('/eligibility/product/:productId', protect, ReviewController.getProductReviewEligibility);

/**
 * @openapi
 * /api/reviews/eligibility/combo/{comboId}:
 *   get:
 *     summary: Check if user can write a combo review
 *     description: Same rules as product eligibility. Review is allowed only after order status is delivered.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comboId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Combo review eligibility result
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Combo menu not found
 */
router.get('/eligibility/combo/:comboId', protect, ReviewController.getComboReviewEligibility);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Create a product review
 *     description: |
 *       Add a new review for a product. User must be authenticated and must have purchased the product.
 *
 *       **Vacib:**
 *       - Əvvəlcə `GET /api/products` ilə mövcud məhsul ID-sini yoxlayın (məs: `3`, `6`)
 *       - Body-də `productId` **və ya** `product_id` kifayətdir (ikisini birdən yazmağa ehtiyac yoxdur)
 *       - Rəy yazmaq üçün həmin məhsulu **öz hesabınızla** sifariş etmiş olmalısınız
 *       - Admin sifarişi **delivered** (tamamlandı) etdikdən sonra rəy yazmaq mümkündür
 *       - Frontend üçün: `GET /api/reviews/eligibility/product/{productId}`
 *
 *       **Swagger Authorize:** `POST /api/auth/login` → `accessToken` → yuxarıdakı **Authorize**
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 3
 *               product_id:
 *                 type: integer
 *                 example: 3
 *               rating:
 *                 type: integer
 *                 example: 5
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 example: Great product! Highly recommended.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or user has already reviewed this product
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User has not purchased this product or order is not delivered yet
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post('/', protect, validate(createProductReviewSchema), ReviewController.createReview);

/**
 * @openapi
 * /api/reviews/combo:
 *   post:
 *     summary: Create a combo menu review
 *     description: |
 *       Add a new review for a combo menu. User must be authenticated, must have purchased the combo, and order must be delivered.
 *
 *       **Swagger-də əvvəlcə Authorize edin:**
 *       1. `POST /api/auth/login` ilə daxil olun
 *       2. Response-dan `accessToken` (və ya `token`) kopyalayın
 *       3. Səhifənin yuxarısındakı **Authorize** düyməsinə basın
 *       4. Tokeni yapışdırın (`Bearer` yazmadan) → **Authorize** → **Close**
 *       5. Bu endpointi yenidən **Execute** edin
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comboId
 *               - rating
 *             properties:
 *               comboId:
 *                 type: integer
 *                 example: 1
 *               combo_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 example: 5
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 example: Great combo! Highly recommended.
 *     responses:
 *       201:
 *         description: Combo review created successfully
 *       400:
 *         description: Validation error or user has already reviewed this combo
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User has not purchased this combo menu or order is not delivered yet
 *       404:
 *         description: Combo menu not found
 *       500:
 *         description: Internal server error
 */
router.post('/combo', protect, validate(createComboReviewSchema), ReviewController.createComboReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     description: Update an existing product or combo review. User must be the owner of the review.
 *     tags: [Reviews]
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
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 4
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 example: Good product, but delivery was a bit late.
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', protect, validate(updateReviewSchema), ReviewController.updateReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Delete an existing product or combo review. User must be the owner of the review.
 *     tags: [Reviews]
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
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', protect, ReviewController.deleteReview);

export default router;
