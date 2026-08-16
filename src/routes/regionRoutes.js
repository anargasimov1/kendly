import { Router } from 'express';
import { getRegions } from '../controllers/catalogController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Catalog
 *     description: Public category and region lists for product filters
 */

/**
 * @openapi
 * /api/regions:
 *   get:
 *     summary: Get all regions
 *     description: |
 *       Saytda məhsul filtrində region seçimi üçün.
 *       Məhsul filterində `GET /api/products?region=Bakı` kimi **name** göndərin.
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: List of regions
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
 *                     example: Bakı
 */
router.get('/', getRegions);

export default router;
