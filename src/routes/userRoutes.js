import { Router } from 'express';
import { createUser, findUserById, login } from '../controllers/userController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User management APIs
 */

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: "+994501234567"
 *               address:
 *                 type: string
 *                 example: Baku, Azerbaijan
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 phone:
 *                   type: string
 *                   example: "+994501234567"
 *                 address:
 *                   type: string
 *                   example: Baku, Azerbaijan
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user together with their orders.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', findUserById);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user and return a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

export default router;
