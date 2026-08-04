import { Router } from 'express';
import FarmerController from '../controllers/farmerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createFarmerSchema } from '../validators/farmerValidator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Farmers
 *     description: Farmer profile management APIs
 */

/**
 * @openapi
 * /api/farmers:
 *   get:
 *     summary: Get all verified farmers
 *     description: Retrieve a list of all verified farmers.
 *     tags: [Farmers]
 *     responses:
 *       200:
 *         description: Farmers retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', FarmerController.getVerifiedFarmers);

/**
 * @openapi
 * /api/farmers/{id}:
 *   get:
 *     summary: Get farmer details
 *     description: Retrieve details of a specific farmer.
 *     tags: [Farmers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Farmer details retrieved successfully
 *       404:
 *         description: Farmer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', FarmerController.getFarmerDetails);

/**
 * @openapi
 * /api/farmers/{id}/products:
 *   get:
 *     summary: Get farmer products
 *     description: Retrieve all products belonging to a farmer.
 *     tags: [Farmers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Farmer products retrieved successfully
 *       404:
 *         description: Farmer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/products', FarmerController.getFarmerProducts);

/**
 * @openapi
 * /api/farmers:
 *   post:
 *     summary: Create farmer profile
 *     description: Create a farmer profile for the authenticated user.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Organic vegetable farmer with 10 years of experience.
 *               farmName:
 *                 type: string
 *                 example: Green Valley Farm
 *               address:
 *                 type: string
 *                 example: Baku, Azerbaijan
 *               phone:
 *                 type: string
 *                 example: "+994501234567"
 *               experienceYears:
 *                 type: integer
 *                 example: 5
 *               idCardNumber:
 *                 type: string
 *                 example: "123456789"
 *     responses:
 *       201:
 *         description: Farmer profile created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  protect,
  validate(createFarmerSchema),
  FarmerController.createProfile
);

/**
 * @openapi
 * /api/farmers/me:
 *   put:
 *     summary: Update my farmer profile
 *     description: Update the authenticated user's farmer profile.
 *     tags: [Farmers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Updated biography
 *               farmName:
 *                 type: string
 *                 example: Organic Farm
 *               address:
 *                 type: string
 *                 example: Sumqayıt
 *               phone:
 *                 type: string
 *                 example: "+994551112233"
 *               experienceYears:
 *                 type: integer
 *                 example: 8
 *               idCardNumber:
 *                 type: string
 *                 example: "987654321"
 *     responses:
 *       200:
 *         description: Farmer profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/me',
  protect,
  validate(createFarmerSchema),
  FarmerController.updateMyBio
);

export default router;