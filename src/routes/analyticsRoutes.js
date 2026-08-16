import express from 'express';
import {
  getAnalytics,
  getAnalyticsSummary,
  getAnalyticsSalesTrend,
  getAnalyticsRegionDistribution,
  getAnalyticsCategoryPerformance,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bütün analitika route-ları admin hüququ tələb edir
router.use(protect);
router.use(authorize('admin'));

/**
 * @openapi
 * tags:
 *   - name: Analytics
 *     description: Analitika səhifəsi API-ları
 */

/**
 * @openapi
 * /api/analytics:
 *   get:
 *     summary: Bütün analitika məlumatları
 *     description: |
 *       Analitika səhifəsi üçün bütün widget məlumatları bir cavabda.
 *       Özet kartlar (orta sifariş, çatdırılma müddəti, müştəri məmnuniyyəti, ləğv nisbəti),
 *       satış trendi qrafiki, rayon üzrə paylanma və kateqoriya performansı.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Satış trendi qrafiki üçün ay sayı (1-12)
 *     responses:
 *       200:
 *         description: Bütün analitika məlumatları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     avg_order_value:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 126.43
 *                         trend_percent:
 *                           type: number
 *                           example: 12.5
 *                         currency:
 *                           type: string
 *                           example: AZN
 *                     delivery_time:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 2.4
 *                         trend_value:
 *                           type: number
 *                           example: -0.3
 *                         unit:
 *                           type: string
 *                           example: gün
 *                     customer_satisfaction:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 94.7
 *                         trend_percent:
 *                           type: number
 *                           example: 2.0
 *                         unit:
 *                           type: string
 *                           example: '%'
 *                     cancellation_rate:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 3.8
 *                         trend_percent:
 *                           type: number
 *                           example: -2.0
 *                         unit:
 *                           type: string
 *                           example: '%'
 *                 sales_trend:
 *                   type: object
 *                   properties:
 *                     series:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: Yan
 *                           month_key:
 *                             type: string
 *                             example: '2026-01'
 *                           sales:
 *                             type: number
 *                             example: 30000
 *                           orders:
 *                             type: integer
 *                             example: 128
 *                 region_distribution:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           region:
 *                             type: string
 *                             example: Bakı
 *                           order_count:
 *                             type: integer
 *                             example: 45
 *                           amount:
 *                             type: number
 *                             example: 15000.50
 *                           percentage:
 *                             type: number
 *                             example: 35.0
 *                     total:
 *                       type: number
 *                       example: 42857.14
 *                 category_performance:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: Yumurta
 *                           sales:
 *                             type: number
 *                             example: 15000
 *                           orders:
 *                             type: integer
 *                             example: 120
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/', getAnalytics);

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     summary: Analitika özet kartları
 *     description: |
 *       Orta sifariş dəyəri (AZN), çatdırılma müddəti (gün),
 *       müştəri məmnuniyyəti (%) və ləğv etmə nisbəti (%).
 *       Hər birinin keçən ayla müqayisəsində trend göstəricisi var.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analitika özet kartları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avg_order_value:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 126.43
 *                     trend_percent:
 *                       type: number
 *                       example: 12.5
 *                     currency:
 *                       type: string
 *                       example: AZN
 *                 delivery_time:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 2.4
 *                     trend_value:
 *                       type: number
 *                       example: -0.3
 *                     unit:
 *                       type: string
 *                       example: gün
 *                 customer_satisfaction:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 94.7
 *                     trend_percent:
 *                       type: number
 *                       example: 2.0
 *                     unit:
 *                       type: string
 *                       example: '%'
 *                 cancellation_rate:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       example: 3.8
 *                     trend_percent:
 *                       type: number
 *                       example: -2.0
 *                     unit:
 *                       type: string
 *                       example: '%'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/summary', getAnalyticsSummary);

/**
 * @openapi
 * /api/analytics/sales-trend:
 *   get:
 *     summary: Satış trendi (xətt qrafik)
 *     description: Aylıq satış məbləği (₼) və sifariş sayı. Şəkildəki "Satış Trendinə Görə" xətt qrafiki üçün.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Neçə aylıq datanı gətirmək (1-12)
 *     responses:
 *       200:
 *         description: Aylıq satış trendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 series:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Yan
 *                       month_key:
 *                         type: string
 *                         example: '2026-01'
 *                       sales:
 *                         type: number
 *                         example: 30000
 *                       orders:
 *                         type: integer
 *                         example: 128
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/sales-trend', getAnalyticsSalesTrend);

/**
 * @openapi
 * /api/analytics/region-distribution:
 *   get:
 *     summary: Rayon üzrə paylanma (dairəvi qrafik)
 *     description: |
 *       Sifarişlərin rayon/şəhər üzrə paylanması.
 *       Hər rayonun sifariş sayı, ümumi məbləği və faiz nisbəti.
 *       Şəkildəki "Rayon üzrə Paylanma" pie chart üçün.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rayon üzrə paylanma
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       region:
 *                         type: string
 *                         example: Bakı
 *                       order_count:
 *                         type: integer
 *                         example: 45
 *                       amount:
 *                         type: number
 *                         example: 15000.50
 *                       percentage:
 *                         type: number
 *                         example: 35.0
 *                 total:
 *                   type: number
 *                   example: 42857.14
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/region-distribution', getAnalyticsRegionDistribution);

/**
 * @openapi
 * /api/analytics/category-performance:
 *   get:
 *     summary: Kateqoriya performansı (bar chart)
 *     description: |
 *       Hər kateqoriyanın ümumi satış məbləği (₼) və sifariş sayı.
 *       Şəkildəki "Kateqoriya Performansı" sütunlu qrafik üçün.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kateqoriya performansı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: Yumurta
 *                       sales:
 *                         type: number
 *                         example: 15000
 *                       orders:
 *                         type: integer
 *                         example: 120
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/category-performance', getAnalyticsCategoryPerformance);

export default router;
