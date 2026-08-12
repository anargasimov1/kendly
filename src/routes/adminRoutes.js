import express from 'express';
import { 
  listUsers, updateUserStatus, approveFarmer, listFarmerApplications,
  getContactMessages, markMessageRead, createOrUpdatePage,
  createCategory, updateCategory, deleteCategory,
  createRegion, updateRegion, deleteRegion
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { pageSchema, categorySchema, regionSchema, farmerVerifySchema } from '../validators/adminValidator.js';

const router = express.Router();

// Bütün admin route-ları qorunur 
// authMiddleware yerinə universal "protect" və "authorize('admin')" işlədirik
router.use(protect);
router.use(authorize('admin'));

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin panel API
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
     security:
       - bearerAuth: []
 responses:
 *       200:
 *         description: success
 */
router.get('/users', listUsers);

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: updated
 */
router.patch('/users/:id/status', updateUserStatus);

/**
 * @openapi
 * /api/admin/farmers/applications:
 *   get:
 *     summary: Get farmer applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/farmers/applications', listFarmerApplications);

/**
 * @openapi
 * /api/admin/farmers/{id}/approve:
 *   patch:
 *     summary: Approve farmer
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 default: approved
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/farmers/:id/approve', approveFarmer);

/**
 * @openapi
 * /api/admin/contacts:
 *   get:
 *     summary: Get contact messages
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/contacts', getContactMessages);

/**
 * @openapi
 * /api/admin/contacts/{id}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.patch('/contacts/:id/read', markMessageRead);

/**
 * @openapi
 * /api/admin/pages:
 *   post:
 *     summary: Create or update page
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/pages', createOrUpdatePage);

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     summary: Create category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/categories', createCategory);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/categories/:id', updateCategory);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/categories/:id', deleteCategory);

/**
 * @openapi
 * /api/admin/regions:
 *   post:
 *     summary: Create region
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/regions', createRegion);

/**
 * @openapi
 * /api/admin/regions/{id}:
 *   put:
 *     summary: Update region
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/regions/:id', updateRegion);

/**
 * @openapi
 * /api/admin/regions/{id}:
 *   delete:
 *     summary: Delete region
 *     tags: [Admin]
     security:
       - bearerAuth: []
 parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/regions/:id', deleteRegion);

export default router;
