import { Router } from 'express';
import ContentController from '../controllers/contentController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Content
 *     description: Static page content APIs
 */

/**
 * @openapi
 * /api/content/{slug}:
 *   get:
 *     summary: Get static page content
 *     description: Retrieve the content of a static page by its slug (e.g. about-us, privacy-policy, terms).
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The page slug
 *         example: about-us
 *     responses:
 *       200:
 *         description: Page content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: About Us
 *                 slug:
 *                   type: string
 *                   example: about-us
 *                 content:
 *                   type: string
 *                   example: Welcome to our company...
 *       404:
 *         description: Page not found
 *       500:
 *         description: Internal server error
 */
router.get('/:slug', ContentController.getPage);

export default router;