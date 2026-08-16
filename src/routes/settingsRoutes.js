import express from 'express';
import { getSettings, updateSettings, getMaintenanceStatus, toggleMaintenanceStatus } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Settings
 *     description: Tənzimləmələr səhifəsi API-ları
 */

/**
 * @openapi
 * /api/settings/maintenance:
 *   get:
 *     summary: Texniki xidmət rejimini yoxla
 *     description: Saytın texniki xidmət rejimində olub-olmadığını yoxlayır. (Public API)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Texniki xidmət statusu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 maintenance_mode:
 *                   type: boolean
 */
router.get('/maintenance', getMaintenanceStatus);

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: Tənzimləmələri gətir
 *     description: Səhifədəki bütün tənzimləmələri (sayt məlumatları, çatdırılma, təhlükəsizlik) gətirir.
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Tənzimləmələr
 */
router.get('/', getSettings);

// Yeniləmə üçün admin icazəsi lazımdır
router.use(protect);
router.use(authorize('admin'));

/**
 * @openapi
 * /api/settings:
 *   put:
 *     summary: Tənzimləmələri yenilə
 *     description: Tənzimləmələri (sayt məlumatları, çatdırılma, təhlükəsizlik) yeniləyir. Sadəcə dəyişmək istədiyiniz sahələri göndərin.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_name:
 *                 type: string
 *               site_email:
 *                 type: string
 *               site_phone:
 *                 type: string
 *               site_address:
 *                 type: string
 *               delivery_fee:
 *                 type: number
 *               free_delivery_min:
 *                 type: number
 *               max_delivery_days:
 *                 type: integer
 *               email_notifications:
 *                 type: boolean
 *               sms_notifications:
 *                 type: boolean
 *               maintenance_mode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tənzimləmələr uğurla yeniləndi
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.put('/', updateSettings);

/**
 * @openapi
 * /api/settings/maintenance:
 *   patch:
 *     summary: Texniki xidmət rejimini dəyişdir
 *     description: Sürətli şəkildə texniki xidmət rejimini aktiv/deaktiv edir.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maintenance_mode
 *             properties:
 *               maintenance_mode:
 *                 type: boolean
 *                 description: true = aktiv, false = deaktiv
 *     responses:
 *       200:
 *         description: Texniki xidmət rejimi yeniləndi
 *       400:
 *         description: Gözlənilməyən məlumat formatı
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.patch('/maintenance', toggleMaintenanceStatus);

export default router;
