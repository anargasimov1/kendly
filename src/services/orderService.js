import { Op } from 'sequelize';
import { Order, OrderItem, Product, User, Cart, CartItem, DeliveryZone, FarmerProfile, Settings } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { ORDER_STATUSES, VALID_TRANSITIONS } from '../utils/orderConstants.js';

const orderDetailIncludes = [
  { model: User, attributes: ['name', 'email', 'phone', 'address'] },
  {
    model: OrderItem,
    as: 'items',
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'images', 'owner_id'],
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name'],
        include: [{
          model: FarmerProfile,
          as: 'farmerProfile',
          attributes: ['bio', 'farmName', 'verification_status', 'profile_image'],
        }],
      }],
    }],
  },
];

class OrderService {
  /**
   * Cari istifadəçinin səbətindən (Cart) sifariş yaradır.
   */
  async createOrder(userId, orderData) {
    const { address_id, notes, delivery_zone_id, payment_method = 'cash' } = orderData;

    if (!address_id) {
       const err = new Error("address_id mütləqdir");
       err.statusCode = 400;
       throw err;
    }

    if (!['card', 'cash'].includes(payment_method)) {
       const err = new Error("payment_method yalnız 'card' və ya 'cash' ola bilər");
       err.statusCode = 400;
       throw err;
    }

    // Seçili səbəti tap
    const cart = await Cart.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      const err = new Error("Səbətiniz boşdur, sifariş yaradıla bilməz");
      err.statusCode = 400;
      throw err;
    }

    // Qiymət hesablama
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += item.quantity * Number(item.price);
    });

    const settings = await Settings.findByPk(1);
    let delivery_fee = settings ? Number(settings.delivery_fee) : 5.0;
    let free_delivery_min = settings ? Number(settings.free_delivery_min) : 30.0;

    if (delivery_zone_id) {
      const zone = await DeliveryZone.findByPk(delivery_zone_id);
      if (zone) {
        delivery_fee = Number(zone.fee);
        if (Number(zone.min_order_amount) > 0) {
           free_delivery_min = Number(zone.min_order_amount);
        }
      }
    }

    if (free_delivery_min > 0 && subtotal >= free_delivery_min) {
      delivery_fee = 0;
    }

    const discount = 0; // Hələlik mock deyil, 0 olaraq qalır
    const total_price = Number((subtotal - discount + delivery_fee).toFixed(2));

    const t = await sequelize.transaction();

    try {
      const newOrder = await Order.create(
        { userId, address_id, cart_id: cart.id, totalPrice: total_price, notes, discount, payment_method },
        { transaction: t }
      );

      const itemsToCreate = cart.items.map(item => ({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

      // Sifariş verildikdən sonra səbətdəki məhsulları silirik (Səbət təmizlənir)
      await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

      await t.commit();
      return newOrder;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Bütün sifarişləri gətirir. Opsional olaraq statusa görə filter edir.
   */
  async getAllOrders(status) {
    const where = status ? { status } : {};

    return await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: orderDetailIncludes,
    });
  }

  /**
   * Admin sifariş cədvəli üçün axtarış, filtr və səhifələmə ilə siyahı.
   */
  async getAdminOrders({ status, search, page = 1, limit = 10, paginate = true } = {}) {
    const where = {};

    if (status) {
      where.status = status;
    }

    const searchValue = String(search || '').trim();
    if (searchValue) {
      const searchConditions = [
        { '$User.name$': { [Op.iLike]: `%${searchValue}%` } },
        { '$User.email$': { [Op.iLike]: `%${searchValue}%` } },
        { '$User.phone$': { [Op.iLike]: `%${searchValue}%` } },
      ];

      if (/^\d+$/.test(searchValue)) {
        searchConditions.unshift({ id: Number(searchValue) });
      }

      where[Op.or] = searchConditions;
    }

    const options = {
      where,
      order: [['createdAt', 'DESC']],
      include: orderDetailIncludes,
      distinct: true,
    };

    if (paginate) {
      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const { count, rows } = await Order.findAndCountAll(options);
    return { count, rows };
  }

  async getStatusCounts() {
    const rows = await Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const counts = Object.fromEntries(
      Object.values(ORDER_STATUSES).map((status) => [status, 0])
    );

    rows.forEach((row) => {
      counts[row.status] = Number(row.count);
    });

    return { all: Object.values(counts).reduce((total, count) => total + count, 0), ...counts };
  }

  /**
   * Tək sifarişi ID-yə görə detallı gətirir.
   */
  async getOrderById(id) {
    return await Order.findByPk(id, {
      include: orderDetailIncludes,
    });
  }

  /**
   * Sifarişin statusunu yeniləyir.
   */
  async updateOrderStatus(id, newStatus) {
    const order = await Order.findByPk(id);

    if (!order) {
      const error = new Error('Sifariş tapılmadı');
      error.statusCode = 404;
      throw error;
    }

    const allowedNextStatuses = VALID_TRANSITIONS[order.status];

    if (!allowedNextStatuses.includes(newStatus)) {
      const error = new Error(
        `"${order.status}" statusundan "${newStatus}" statusuna keçid etmək mümkün deyil`
      );
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = order.status;
    order.status = newStatus;
    if (newStatus === ORDER_STATUSES.DELIVERED && previousStatus !== ORDER_STATUSES.DELIVERED) {
      order.deliveredAt = new Date();
    }
    await order.save();

    if (newStatus === ORDER_STATUSES.DELIVERED && previousStatus !== ORDER_STATUSES.DELIVERED) {
      const items = await OrderItem.findAll({ where: { orderId: id } });
      for (const item of items) {
        await Product.increment('sales_count', {
          by: item.quantity,
          where: { id: item.productId },
        });
      }
    }

    return order;
  }
}

export default new OrderService();
