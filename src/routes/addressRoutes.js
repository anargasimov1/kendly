import express from 'express';
import addressController from '../controllers/addressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * tags:
 *   - name: Address
 *     description: User address management APIs
 */

/**
 * @openapi
 * /api/address:
 *   post:
 *     summary: Create a new address
 *     description: Add a new address for the authenticated user.
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_line
 *               - city
 *             properties:
 *               title:
 *                 type: string
 *                 example: Home
 *               address_line:
 *                 type: string
 *                 example: 28 May Street 15
 *               city:
 *                 type: string
 *                 example: Baku
 *               region:
 *                 type: string
 *                 example: Yasamal
 *               postal_code:
 *                 type: string
 *                 example: AZ1000
 *               is_default:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 user_id:
 *                   type: integer
 *                   example: 5
 *                 title:
 *                   type: string
 *                   example: Home
 *                 address_line:
 *                   type: string
 *                   example: 28 May Street 15
 *                 city:
 *                   type: string
 *                   example: Baku
 *                 region:
 *                   type: string
 *                   example: Yasamal
 *                 postal_code:
 *                   type: string
 *                   example: AZ1000
 *                 is_default:
 *                   type: boolean
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", addressController.addAddress.bind(addressController));

/**
 * @openapi
 * /api/address:
 *   get:
 *     summary: Get all user addresses
 *     description: Retrieve all addresses of the authenticated user.
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
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
 *                   title:
 *                     type: string
 *                     example: Home
 *                   address_line:
 *                     type: string
 *                     example: 28 May Street 15
 *                   city:
 *                     type: string
 *                     example: Baku
 *                   region:
 *                     type: string
 *                     example: Yasamal
 *                   postal_code:
 *                     type: string
 *                     example: AZ1000
 *                   is_default:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", addressController.listAddresses.bind(addressController));

/**
 * @openapi
 * /api/address/{id}:
 *   put:
 *     summary: Update address
 *     description: Update an existing address.
 *     tags: [Address]
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
 *               title:
 *                 type: string
 *                 example: Office
 *               address_line:
 *                 type: string
 *                 example: Heydar Aliyev Avenue 25
 *               city:
 *                 type: string
 *                 example: Baku
 *               region:
 *                 type: string
 *                 example: Narimanov
 *               postal_code:
 *                 type: string
 *                 example: AZ1025
 *               is_default:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", addressController.updateAddress.bind(addressController));

/**
 * @openapi
 * /api/address/{id}:
 *   delete:
 *     summary: Delete address
 *     description: Delete an address by ID.
 *     tags: [Address]
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
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", addressController.deleteAddress.bind(addressController));

export default router;