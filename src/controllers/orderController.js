import orderService from '../services/orderService.js';
import { ORDER_STATUSES } from '../utils/orderConstants.js';

// Yeni sifariş yarat
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const newOrder = await orderService.createOrder(userId, req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

// Bütün sifarişləri gətir
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status && !Object.values(ORDER_STATUSES).includes(status)) {
      return res.status(400).json({
        error: `Yanlış status dəyəri. Mümkün dəyərlər: ${Object.values(ORDER_STATUSES).join(', ')}`,
      });
    }

    const orders = await orderService.getAllOrders(status);

    const formattedOrders = orders.map(order => {
      const orderPlain = order.get({ plain: true });
      return {
        id: orderPlain.id,
        customer_name: orderPlain.User?.name,
        phone: orderPlain.User?.phone,
        address: orderPlain.User?.address,
        address_id: orderPlain.address_id,
        email: orderPlain.User?.email,
        notes: orderPlain.notes,
        status: orderPlain.status,
        created_at: orderPlain.createdAt,
        total_items: orderPlain.items ? orderPlain.items.length : 0,
        total_amount: Number(orderPlain.totalPrice),
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    next(error);
  }
};

// Sifarişi id-yə görə gətir
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ error: 'Bu sifarişi görmək üçün icazəniz yoxdur' });
    }

    const orderPlain = order.get({ plain: true });

    const formattedOrder = {
      id: orderPlain.id,
      customer_name: orderPlain.User?.name,
      phone: orderPlain.User?.phone,
      address: orderPlain.User?.address,
      address_id: orderPlain.address_id,
      cart_id: orderPlain.cart_id,
      email: orderPlain.User?.email,
      notes: orderPlain.notes,
      status: orderPlain.status,
      created_at: orderPlain.createdAt,
      items: orderPlain.items
        ? orderPlain.items.map(item => ({
            product_id: item.productId,
            name: item.product?.name,
            price: Number(item.price),
            quantity: item.quantity,
            total: Number(item.price) * item.quantity,
          }))
        : [],
      total_amount: Number(orderPlain.totalPrice),
    };

    res.json(formattedOrder);
  } catch (error) {
    next(error);
  }
};

// Sifarişin statusunu yenilə
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: '"status" sahəsi mütləqdir' });
    }

    if (!Object.values(ORDER_STATUSES).includes(status)) {
      return res.status(400).json({
        error: `Yanlış status dəyəri. Mümkün dəyərlər: ${Object.values(ORDER_STATUSES).join(', ')}`,
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
    });
  } catch (error) {
    next(error);
  }
};
