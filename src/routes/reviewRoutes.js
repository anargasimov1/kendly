import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/reviewValidator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: Product reviews management APIs
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
 *         description: List of reviews retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/product/:productId', ReviewController.getProductReviews);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     description: Add a new review for a product. User must be authenticated.
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
 *               - comment
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
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
 *       500:
 *         description: Internal server error
 */
router.post('/', protect, validate(reviewSchema), ReviewController.createReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review
 *     description: Update an existing review. User must be the owner of the review.
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
router.put('/:id', protect, validate(reviewSchema), ReviewController.updateReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Delete an existing review. User must be the owner of the review.
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
