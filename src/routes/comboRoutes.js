import express from 'express';
import { getAllCombos, getComboById, createCombo, updateCombo, deleteCombo } from '../controllers/comboController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Combo Menus
 *     description: Combo Menu management APIs
 */

/**
 * @openapi
 * /api/combos:
 *   get:
 *     summary: Get all combo menus
 *     tags: [Combo Menus]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a combo menu (Admin only)
 *     tags: [Combo Menus]
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
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', getAllCombos);
router.post('/', authMiddleware, isAdmin, createCombo);

/**
 * @openapi
 * /api/combos/{id}:
 *   get:
 *     summary: Get a combo menu by ID
 *     tags: [Combo Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a combo menu (Admin only)
 *     tags: [Combo Menus]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a combo menu (Admin only)
 *     tags: [Combo Menus]
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
router.get('/:id', getComboById);
router.put('/:id', authMiddleware, isAdmin, updateCombo);
router.delete('/:id', authMiddleware, isAdmin, deleteCombo);

export default router;
