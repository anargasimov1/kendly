import { Op } from 'sequelize';
import { Order, OrderItem, Product, User, Cart, CartItem, DeliveryZone } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { ORDER_STATUSES, VALID_TRANSITIONS } from '../utils/orderConstants.js';

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

    let delivery_fee = 0;
    if (delivery_zone_id) {
      const zone = await DeliveryZone.findByPk(delivery_zone_id);
      if (zone) {
        if (Number(zone.min_order_amount) > 0 && subtotal >= Number(zone.min_order_amount)) {
          delivery_fee = 0;
        } else {
          delivery_fee = Number(zone.fee);
        }
      }
    }

    const discount = Number((subtotal * 0.15).toFixed(2));
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
      include: [
        { model: User, attributes: ['name', 'email', 'phone', 'address'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'image'],
            include: [{ model: User, as: 'owner', attributes: ['name'] }]
          }]
        },
      ],
    });
  }

  /**
   * Tək sifarişi ID-yə görə detallı gətirir.
   */
  async getOrderById(id) {
    return await Order.findByPk(id, {
      include: [
        { model: User, attributes: ['name', 'email', 'phone', 'address'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name'] }],
        },
      ],
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

    order.status = newStatus;
    await order.save();

    return order;
  }
}

export default new OrderService();
