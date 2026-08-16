import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Order, OrderItem, Product, Review, Address } from '../models/index.js';
import { ORDER_STATUSES } from '../utils/orderConstants.js';

const AZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];

const monthRange = (offsetMonths = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const calcTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
};

class AnalyticsService {

  // ─── 4 yuxarı statistika kartı ───
  async getSummary() {
    const thisMonth = monthRange(0);
    const lastMonth = monthRange(1);

    // Orta sifariş dəyəri (bu ay vs keçən ay)
    const [avgThis] = await sequelize.query(`
      SELECT COALESCE(AVG(total_price), 0) as avg_value
      FROM orders
      WHERE status != 'cancelled'
        AND created_at >= :start AND created_at <= :end
    `, { replacements: { start: thisMonth.start, end: thisMonth.end } });

    const [avgLast] = await sequelize.query(`
      SELECT COALESCE(AVG(total_price), 0) as avg_value
      FROM orders
      WHERE status != 'cancelled'
        AND created_at >= :start AND created_at <= :end
    `, { replacements: { start: lastMonth.start, end: lastMonth.end } });

    const avgOrderThis = Number(Number(avgThis[0].avg_value).toFixed(2));
    const avgOrderLast = Number(Number(avgLast[0].avg_value).toFixed(2));

    // Çatdırılma müddəti (delivered sifarişlər üçün orta gün)
    // orders cədvəlində updated_at sütunu olmadığına görə,
    // delivered statuslu sifarişlər arasında created_at fərqinə baxırıq
    const [deliveryThis] = await sequelize.query(`
      SELECT COALESCE(AVG(
        CASE WHEN status = 'delivered' AND delivered_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (delivered_at - created_at)) / 86400.0
          ELSE NULL 
        END
      ), 0) as avg_days
      FROM orders
      WHERE delivered_at >= :start AND delivered_at <= :end
    `, { replacements: { start: thisMonth.start, end: thisMonth.end } });

    const [deliveryLast] = await sequelize.query(`
      SELECT COALESCE(AVG(
        CASE WHEN status = 'delivered' AND delivered_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (delivered_at - created_at)) / 86400.0
          ELSE NULL 
        END
      ), 0) as avg_days
      FROM orders
      WHERE delivered_at >= :start AND delivered_at <= :end
    `, { replacements: { start: lastMonth.start, end: lastMonth.end } });

    const deliveryDaysThis = Number(Number(deliveryThis[0].avg_days).toFixed(1));
    const deliveryDaysLast = Number(Number(deliveryLast[0].avg_days).toFixed(1));

    // Müştəri məmnuniyyəti (review-lardan orta rating faizi, 5 üzərindən)
    const [satisfactionThis] = await sequelize.query(`
      SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as cnt
      FROM reviews
      WHERE created_at >= :start AND created_at <= :end
    `, { replacements: { start: thisMonth.start, end: thisMonth.end } });

    const [satisfactionLast] = await sequelize.query(`
      SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as cnt
      FROM reviews
      WHERE created_at >= :start AND created_at <= :end
    `, { replacements: { start: lastMonth.start, end: lastMonth.end } });

    const satisfactionPctThis = Number((Number(satisfactionThis[0].avg_rating) / 5 * 100).toFixed(1));
    const satisfactionPctLast = Number((Number(satisfactionLast[0].avg_rating) / 5 * 100).toFixed(1));

    // Ləğv etmə nisbəti
    const [cancelThis] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM orders
      WHERE created_at >= :start AND created_at <= :end
    `, { replacements: { start: thisMonth.start, end: thisMonth.end } });

    const [cancelLast] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM orders
      WHERE created_at >= :start AND created_at <= :end
    `, { replacements: { start: lastMonth.start, end: lastMonth.end } });

    const cancelRateThis = cancelThis[0].total > 0
      ? Number((cancelThis[0].cancelled / cancelThis[0].total * 100).toFixed(1))
      : 0;
    const cancelRateLast = cancelLast[0].total > 0
      ? Number((cancelLast[0].cancelled / cancelLast[0].total * 100).toFixed(1))
      : 0;

    return {
      avg_order_value: {
        value: avgOrderThis,
        trend_percent: calcTrend(avgOrderThis, avgOrderLast),
        currency: 'AZN',
      },
      delivery_time: {
        value: deliveryDaysThis,
        trend_value: Number((deliveryDaysThis - deliveryDaysLast).toFixed(1)),
        unit: 'gün',
      },
      customer_satisfaction: {
        value: satisfactionPctThis,
        trend_percent: Number((satisfactionPctThis - satisfactionPctLast).toFixed(1)),
        unit: '%',
      },
      cancellation_rate: {
        value: cancelRateThis,
        trend_percent: Number((cancelRateThis - cancelRateLast).toFixed(1)),
        unit: '%',
      },
    };
  }

  // ─── Satış trendi (xətt qrafik) ───
  async getSalesTrend(months = 7) {
    const parsedMonths = Math.min(Math.max(parseInt(months, 10) || 7, 1), 12);
    const series = [];

    for (let i = parsedMonths - 1; i >= 0; i -= 1) {
      const { start, end } = monthRange(i);

      const [row] = await sequelize.query(`
        SELECT 
          COALESCE(SUM(total_price), 0) as revenue,
          COUNT(*) FILTER (WHERE status != 'cancelled') as order_count
        FROM orders
        WHERE created_at >= :start AND created_at <= :end
          AND status != 'cancelled'
      `, { replacements: { start, end } });

      series.push({
        month: AZ_MONTHS[start.getMonth()],
        month_key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        sales: Number(Number(row[0].revenue).toFixed(2)),
        orders: Number(row[0].order_count),
      });
    }

    return { series };
  }

  // ─── Rayon üzrə paylanma (dairəvi qrafik) ───
  async getRegionDistribution() {
    const [rows] = await sequelize.query(`
      SELECT 
        COALESCE(a.city, 'Digər') as region_name,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_price), 0) as total_amount
      FROM orders o
      LEFT JOIN addresses a ON a.id = o.address_id
      WHERE o.status != 'cancelled'
      GROUP BY a.city
      ORDER BY total_amount DESC
    `);

    const total = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);

    const items = rows.map(row => ({
      region: row.region_name || 'Digər',
      order_count: Number(row.order_count),
      amount: Number(Number(row.total_amount).toFixed(2)),
      percentage: total > 0
        ? Number((Number(row.total_amount) / total * 100).toFixed(1))
        : 0,
    }));

    return { items, total: Number(total.toFixed(2)) };
  }

  // ─── Kateqoriya performansı (bar chart) ───
  async getCategoryPerformance() {
    const [rows] = await sequelize.query(`
      SELECT 
        COALESCE(c.name, 'Digər') as category_name,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `);

    const items = rows.map(row => ({
      category: row.category_name || 'Digər',
      sales: Number(Number(row.total_sales).toFixed(2)),
      orders: Number(row.order_count),
    }));

    return { items };
  }

  // ─── Bütün analitika bir yerdə ───
  async getFullAnalytics(months = 7) {
    const [summary, sales_trend, region_distribution, category_performance] = await Promise.all([
      this.getSummary(),
      this.getSalesTrend(months),
      this.getRegionDistribution(),
      this.getCategoryPerformance(),
    ]);

    return {
      summary,
      sales_trend,
      region_distribution,
      category_performance,
    };
  }
}

export default new AnalyticsService();
