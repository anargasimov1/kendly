import express from 'express';
import newsletterController from '../controllers/newsletterController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Newsletter
 *     description: Newsletter subscription management APIs
 */

/**
 * @openapi
 * /api/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     description: Subscribe an email address to the newsletter.
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: Subscription request sent successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Email already subscribed
 *       500:
 *         description: Internal server error
 */
router.post('/subscribe', newsletterController.subscribe.bind(newsletterController));

/**
 * @openapi
 * /api/newsletter/verify:
 *   post:
 *     summary: Verify newsletter subscription
 *     description: Verify a newsletter subscription using the verification token.
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: 7d5e4b91d0b54e0b8b84b2dfe73f3d11
 *     responses:
 *       200:
 *         description: Subscription verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/verify', newsletterController.verify.bind(newsletterController));

/**
 * @openapi
 * /api/newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     description: Remove an email address from the newsletter.
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Email not found
 *       500:
 *         description: Internal server error
 */
router.post('/unsubscribe', newsletterController.unsubscribe.bind(newsletterController));

/**
 * @openapi
 * /api/newsletter:
 *   get:
 *     summary: Get all newsletter subscribers
 *     description: Retrieve the list of newsletter subscribers (Admin only).
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authMiddleware,
  isAdmin,
  newsletterController.adminList.bind(newsletterController)
);

export default router;