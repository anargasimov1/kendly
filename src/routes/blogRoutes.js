import express from 'express';
import { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Blogs
 *     description: Blog management APIs
 */

/**
 * @openapi
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: is_published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, popular]
 *         description: Sort alias - newest (default) or popular (by views)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [views, createdAt]
 *         description: Sort column - views for popular, createdAt for newest
 *     responses:
 *       200:
 *         description: Blog list with views field for popularity
 *   post:
 *     summary: Create a blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               slug:
 *                 type: string
 *               image:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', getAllBlogs);
router.post('/', authMiddleware, isAdmin, createBlog);

/**
 * @openapi
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:slug', getBlogBySlug);

/**
 * @openapi
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog (Admin only)
 *     tags: [Blogs]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               slug:
 *                 type: string
 *               image:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a blog (Admin only)
 *     tags: [Blogs]
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
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);

export default router;
