import { Router } from 'express';
import ContactController from '../controllers/contactController.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../validators/contactValidator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Contact
 *     description: Contact & Feedback APIs
 */

/**
 * @openapi
 * /api/contact:
 *   post:
 *     summary: Send a contact message
 *     description: Anyone can send a contact or feedback message without authentication.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               subject:
 *                 type: string
 *                 example: Website Feedback
 *               message:
 *                 type: string
 *                 example: Your website looks great!
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', validate(contactSchema), ContactController.sendMessage);

export default router;