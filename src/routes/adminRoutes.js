import express from 'express';
import {
  listUsers, updateUserStatus, approveFarmer, listFarmerApplications,
  getContactMessages, markMessageRead, createOrUpdatePage,
  createCategory, updateCategory, deleteCategory, listCategories,
  createRegion, updateRegion, deleteRegion, listRegions,
  listCustomers, getCustomerStats
} from '../controllers/adminController.js';
import {
  getDashboard,
  getDashboardSummary,
  getDashboardRevenueChart,
  getDashboardCategorySales,
  getDashboardTopFarmers,
  getDashboardRecentOrders,
} from '../controllers/dashboardController.js';
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
 * /api/admin/dashboard:
 *   get:
 *     summary: Get full admin dashboard data
 *     description: |
 *       İdarə paneli üçün bütün widget məlumatları bir cavabda.
 *       Özet kartlar, gəlir qrafiki, kateqoriya satışları, top fermerlər və son sifarişlər.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Gəlir qrafiki üçün ay sayı (1-12)
 *     responses:
 *       200:
 *         description: Full dashboard payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/dashboard', getDashboard);

/**
 * @openapi
 * /api/admin/dashboard/summary:
 *   get:
 *     summary: Dashboard summary cards
 *     description: Aylıq gəlir, aktiv sifarişlər, məhsul sayı, fermer sayı, pending_orders_count (sidebar badge) və trend faizləri.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary metrics
 */
router.get('/dashboard/summary', getDashboardSummary);

/**
 * @openapi
 * /api/admin/dashboard/revenue-chart:
 *   get:
 *     summary: Revenue and orders chart data
 *     description: Aylıq gəlir və sifariş sayı (Gəlir və Sifarişlər qrafiki).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Monthly revenue series
 */
router.get('/dashboard/revenue-chart', getDashboardRevenueChart);

/**
 * @openapi
 * /api/admin/dashboard/category-sales:
 *   get:
 *     summary: Sales by category (pie chart)
 *     description: Kateqoriya üzrə satış faizləri və məbləğlər.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category sales breakdown
 */
router.get('/dashboard/category-sales', getDashboardCategorySales);

/**
 * @openapi
 * /api/admin/dashboard/top-farmers:
 *   get:
 *     summary: Top farmers by order count
 *     description: Ən çox sifariş alan fermerlər (bar chart).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Top farmers list
 */
router.get('/dashboard/top-farmers', getDashboardTopFarmers);

/**
 * @openapi
 * /api/admin/dashboard/recent-orders:
 *   get:
 *     summary: Recent orders list
 *     description: Son sifarişlər (status_label, məhsul şəkli, məbləğ).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recent orders
 */
router.get('/dashboard/recent-orders', getDashboardRecentOrders);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, farmer, admin]
 *         description: Filter users by role; use farmer for the product form.
 *     responses:
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     description: List users with role "user" along with their total orders and total spent. Supports pagination, searching, and filtering.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g., active, suspended)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: success
 */
router.get('/customers', listCustomers);

/**
 * @openapi
 * /api/admin/customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     description: Returns total customers, active customers, total orders, and total spent amount.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: success
 */
router.get('/customers/stats', getCustomerStats);

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
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     description: Creates a new static page or updates existing one by slug.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *               - content
 *             properties:
 *               slug:
 *                 type: string
 *                 example: about-us
 *                 description: URL slug (lowercase, numbers, hyphens only)
 *               title:
 *                 type: string
 *                 example: Haqqımızda
 *               content:
 *                 type: string
 *                 example: Kendly platforması haqqında məlumat...
 *     responses:
 *       200:
 *         description: Page created or updated
 */
router.post('/pages', validate(pageSchema), createOrUpdatePage);

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     summary: List all categories (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Meyvə
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/categories', listCategories);
router.post('/categories', validate(categorySchema), createCategory);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
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
 *                 example: Tərəvəz
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', validate(categorySchema), updateCategory);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/categories/:id', deleteCategory);

/**
 * @openapi
 * /api/admin/regions:
 *   get:
 *     summary: List all regions (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of regions
 *   post:
 *     summary: Create region
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bakı
 *     responses:
 *       201:
 *         description: Region created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get('/regions', listRegions);
router.post('/regions', validate(regionSchema), createRegion);

/**
 * @openapi
 * /api/admin/regions/{id}:
 *   put:
 *     summary: Update region
 *     tags: [Admin]
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
 *                 example: Gəncə
 *     responses:
 *       200:
 *         description: Region updated
 *       404:
 *         description: Region not found
 *       401:
 *         description: Unauthorized
 */
router.put('/regions/:id', validate(regionSchema), updateRegion);

/**
 * @openapi
 * /api/admin/regions/{id}:
 *   delete:
 *     summary: Delete region
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/regions/:id', deleteRegion);

export default router;
