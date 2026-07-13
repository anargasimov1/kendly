import express from 'express';
import { createIntent, handleWebhook, getPaymentStatus } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createPaymentIntentSchema } from '../validators/paymentValidator.js';

const router = express.Router();

router.post('/intent', authMiddleware, validate(createPaymentIntentSchema), createIntent);
router.get('/:id/status', authMiddleware, getPaymentStatus);

// Webhook xarici servislərdən gəldiyi üçün authMiddleware qoyulmur
router.post('/webhook', handleWebhook);

export default router;
