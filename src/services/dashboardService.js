import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import {
  Order,
  OrderItem,
  Product,
  FarmerProfile,
} from '../models/index.js';
import { ORDER_STATUSES } from '../utils/orderConstants.js';

const AZ_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];

const STATUS_LABELS = {
  pending: 'Yeni',
  confirmed: 'Təsdiqlənib',
  preparing: 'Hazırlanır',
  delivered: 'Tamamlandı',
  cancelled: 'Ləğv edilib',
};

const ACTIVE_STATUSES = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.PREPARING,
];

const calcTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
};

const monthRange = (offsetMonths = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getFirstImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) {
    const first = images[0];
    if (Array.isArray(first)) return first[0] ?? null;
    return first ?? null;
  }
  return null;
};

class DashboardService {
  async sumRevenueBetween(start, end) {
    const result = await Order.sum('totalPrice', {
      where: {
        createdAt: { [Op.between]: [start, end] },
        status: { [Op.ne]: ORDER_STATUSES.CANCELLED },
      },
    });
    return Number(result || 0);
  }

  async countOrdersBetween(start, end, extraWhere = {}) {
    return Order.count({
      where: {
        createdAt: { [Op.between]: [start, end] },
        status: { [Op.ne]: ORDER_STATUSES.CANCELLED },
        ...extraWhere,
      },
    });
  }

  async getSummary() {
    const thisMonth = monthRange(0);
    const lastMonth = monthRange(1);

    const revenueThis = await this.sumRevenueBetween(thisMonth.start, thisMonth.end);
    const revenueLast = await this.sumRevenueBetween(lastMonth.start, lastMonth.end);

    const activeOrders = await Order.count({
      where: { status: { [Op.in]: ACTIVE_STATUSES } },
    });
    const activeOrdersLastMonth = await Order.count({
      where: {
        status: { [Op.in]: ACTIVE_STATUSES },
        createdAt: { [Op.between]: [lastMonth.start, lastMonth.end] },
      },
    });

    const productCount = await Product.count({ where: { is_active: true } });
    const productsLastMonth = await Product.count({
      where: {
        is_active: true,
        createdAt: { [Op.lte]: lastMonth.end },
      },
    });

    const farmersCount = await FarmerProfile.count({
      where: { verification_status: 'approved' },
    });
    const farmersLastMonth = await FarmerProfile.count({
      where: {
        verification_status: 'approved',
        createdAt: { [Op.lte]: lastMonth.end },
      },
    });

    const pendingOrdersCount = await Order.count({
      where: { status: ORDER_STATUSES.PENDING },
    });

    return {
      monthly_revenue: {
        value: Number(revenueThis.toFixed(2)),
        trend_percent: calcTrend(revenueThis, revenueLast),
        currency: 'AZN',
      },
      active_orders: {
        value: activeOrders,
        trend_percent: calcTrend(activeOrders, activeOrdersLastMonth),
      },
      product_count: {
        value: productCount,
        trend_percent: calcTrend(productCount, productsLastMonth),
      },
      farmers_count: {
        value: farmersCount,
        trend_percent: calcTrend(farmersCount, farmersLastMonth),
      },
      pending_orders_count: pendingOrdersCount,
    };
  }

  async getRevenueChart(months = 7) {
    const parsedMonths = Math.min(Math.max(parseInt(months, 10) || 7, 1), 12);
    const series = [];

    for (let i = parsedMonths - 1; i >= 0; i -= 1) {
      const { start, end } = monthRange(i);
      const revenue = await this.sumRevenueBetween(start, end);
      const orderCount = await this.countOrdersBetween(start, end);

      series.push({
        month: AZ_MONTHS[start.getMonth()],
        month_key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        revenue: Number(revenue.toFixed(2)),
        order_count: orderCount,
      });
    }

    return { series };
  }

  async getCategorySales() {
    const [rows] = await sequelize.query(`
      SELECT
        COALESCE(c.name, 'Digər') AS category_name,
        SUM(oi.quantity * oi.price) AS total_amount
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC
    `);

    const items = rows
      .map((row) => ({
        category: row.category_name || 'Digər',
        amount: Number(row.total_amount || 0),
      }))
      .filter((item) => item.amount > 0);

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    if (total === 0) {
      return { items: [], total: 0 };
    }

    const withPercentages = items.map((item) => ({
      ...item,
      percentage: Number(((item.amount / total) * 100).toFixed(1)),
    }));

    return { items: withPercentages, total: Number(total.toFixed(2)) };
  }

  async getTopFarmers(limit = 5) {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);

    const [rows] = await sequelize.query(
      `
      SELECT
        u.id AS farmer_id,
        u.name AS farmer_name,
        COUNT(DISTINCT o.id) AS order_count
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
      INNER JOIN products p ON p.id = oi.product_id
      INNER JOIN users u ON u.id = p.owner_id
      GROUP BY u.id, u.name
      ORDER BY order_count DESC
      LIMIT :limit
      `,
      { replacements: { limit: parsedLimit } }
    );

    return {
      items: rows.map((row) => ({
        farmer_id: Number(row.farmer_id),
        name: row.farmer_name,
        order_count: Number(row.order_count),
      })),
    };
  }

  async getRecentOrders(limit = 5) {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);

    const orders = await Order.findAll({
      limit: parsedLimit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'images'] }],
        },
      ],
    });

    return {
      items: orders.map((order) => {
        const plain = order.toJSON();
        const firstItem = plain.items?.[0];
        const product = firstItem?.product;

        return {
          id: plain.id,
          order_number: plain.id,
          total_amount: Number(plain.totalPrice),
          status: plain.status,
          status_label: STATUS_LABELS[plain.status] || plain.status,
          created_at: plain.createdAt,
          product_name: product?.name ?? null,
          image: getFirstImage(product?.images),
        };
      }),
    };
  }

  async getDashboard(months = 7) {
    const [summary, revenue_chart, category_sales, top_farmers, recent_orders] = await Promise.all([
      this.getSummary(),
      this.getRevenueChart(months),
      this.getCategorySales(),
      this.getTopFarmers(5),
      this.getRecentOrders(5),
    ]);

    return {
      summary,
      revenue_chart,
      category_sales,
      top_farmers,
      recent_orders,
    };
  }
}

export default new DashboardService();
