import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/reviewValidator.js';

const router = Router();

// Hər kəs baxa bilər
router.get('/product/:productId', ReviewController.getProductReviews);

// Actionlar
router.post('/', protect, validate(reviewSchema), ReviewController.createReview);
router.put('/:id', protect, validate(reviewSchema), ReviewController.updateReview);
router.delete('/:id', protect, ReviewController.deleteReview);

export default router;
