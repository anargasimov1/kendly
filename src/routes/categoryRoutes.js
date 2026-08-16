import { Router } from 'express';
import { getCategories, getRegions } from '../controllers/catalogController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Catalog
 *     description: Public category and region lists for product filters
 */

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: |
 *       Saytda məhsul filtrində category seçimi üçün.
 *       Məhsul filterində `GET /api/products?category=Meyvə` kimi **name** göndərin.
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Meyvə
 */
router.get('/', getCategories);

export default router;
