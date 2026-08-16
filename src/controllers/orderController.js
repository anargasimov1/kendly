import orderService from '../services/orderService.js';
import { ORDER_STATUSES } from '../utils/orderConstants.js';
import { Cart, CartItem } from '../models/index.js';
import ExcelJS from 'exceljs';

const formatFarmer = (owner) => {
  if (!owner) return null;

  return {
    id: owner.id,
    name: owner.name,
    farmer_profile: owner.farmerProfile
      ? {
          bio: owner.farmerProfile.bio,
          farm_name: owner.farmerProfile.farmName,
          verification_status: owner.farmerProfile.verification_status,
          profile_image: owner.farmerProfile.profile_image,
        }
      : null,
  };
};

const formatOrderItem = (item) => ({
  product_id: item.productId,
  name: item.product?.name ?? null,
  images: item.product?.images ?? null,
  owner_id: item.product?.owner_id ?? null,
  farmer_name: item.product?.owner?.name ?? null,
  farmer: formatFarmer(item.product?.owner),
  price: Number(item.price),
  quantity: item.quantity,
  total: Number(item.price) * item.quantity,
});

const getPrimaryFarmerName = (items = []) => items[0]?.product?.owner?.name ?? null;

const formatOrderListItem = (order) => {
  const orderPlain = order.get({ plain: true });
  return {
    id: orderPlain.id,
    customer_name: orderPlain.User?.name ?? null,
    phone: orderPlain.User?.phone ?? null,
    address: orderPlain.User?.address ?? null,
    address_id: orderPlain.address_id,
    email: orderPlain.User?.email ?? null,
    notes: orderPlain.notes,
    status: orderPlain.status,
    created_at: orderPlain.createdAt,
    total_items: orderPlain.items?.length ?? 0,
    total_amount: Number(orderPlain.totalPrice),
    farmer_name: getPrimaryFarmerName(orderPlain.items),
    product_name: orderPlain.items?.[0]?.product?.name ?? null,
    product_image: orderPlain.items?.[0]?.product?.images?.[0] ?? null,
  };
};

const parseAdminListQuery = (query) => {
  const { status, search } = query;
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);

  if (status && !Object.values(ORDER_STATUSES).includes(status)) {
    const error = new Error(`Yanlış status dəyəri. Mümkün dəyərlər: ${Object.values(ORDER_STATUSES).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return { status, search, page, limit };
};

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

    const formattedOrders = orders.map(formatOrderListItem);

    res.json(formattedOrders);
  } catch (error) {
    next(error);
  }
};

// Admin panelindəki sifariş cədvəli: axtarış, status tabları və səhifələmə.
export const getAdminOrders = async (req, res, next) => {
  try {
    const query = parseAdminListQuery(req.query);
    const [{ count, rows }, status_counts] = await Promise.all([
      orderService.getAdminOrders(query),
      orderService.getStatusCounts(),
    ]);

    res.json({
      items: rows.map(formatOrderListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total_items: count,
        total_pages: Math.ceil(count / query.limit),
      },
      status_counts,
    });
  } catch (error) {
    next(error);
  }
};

// Admin sifarişlərini real .xlsx faylı kimi ixrac edir.
export const exportAdminOrders = async (req, res, next) => {
  try {
    const query = parseAdminListQuery(req.query);
    const { rows } = await orderService.getAdminOrders({ ...query, paginate: false });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sifarişlər');

    worksheet.columns = [
      { header: 'Sifariş ID', key: 'id', width: 14 },
      { header: 'Məhsul', key: 'product_name', width: 28 },
      { header: 'Müştəri', key: 'customer_name', width: 24 },
      { header: 'Fermer', key: 'farmer_name', width: 24 },
      { header: 'Məbləğ (AZN)', key: 'total_amount', width: 16 },
      { header: 'Tarix', key: 'created_at', width: 14 },
      { header: 'Status', key: 'status', width: 16 },
    ];
    worksheet.getRow(1).font = { bold: true };

    rows.forEach((order) => {
      const item = formatOrderListItem(order);
      worksheet.addRow({
        id: `#${item.id}`,
        product_name: item.product_name,
        customer_name: item.customer_name,
        farmer_name: item.farmer_name,
        total_amount: item.total_amount,
        created_at: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : '',
        status: item.status,
      });
    });

    const filename = `sifarisler-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(Buffer.from(await workbook.xlsx.writeBuffer()));
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
      items: orderPlain.items ? orderPlain.items.map(formatOrderItem) : [],
      total_amount: Number(orderPlain.totalPrice),
      farmer_name: getPrimaryFarmerName(orderPlain.items),
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

// Sifarişi təkrar səbətə əlavə etmək (Reorder)
export const reorder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Bu sifarişi təkrar etmək üçün icazəniz yoxdur' });
    }

    let cart = await Cart.findOne({ where: { user_id: userId }, order: [['created_at', 'DESC']] });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    for (const item of order.items) {
      if (item.productId) {
        let cartItem = await CartItem.findOne({ where: { cart_id: cart.id, product_id: item.productId } });
        if (cartItem) {
          cartItem.quantity += item.quantity;
          await cartItem.save();
        } else {
          await CartItem.create({
            cart_id: cart.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
    }

    res.status(200).json({ message: 'Məhsullar uğurla səbətə əlavə edildi' });
  } catch (error) {
    next(error);
  }
};

// Sifarişin qəbz/faktura məlumatlarını qaytarmaq (Receipt)
export const getReceipt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Sifariş tapılmadı' });
    }
    if (req.user.role !== 'admin' && order.userId !== userId) {
      return res.status(403).json({ error: 'Bu sifarişin qəbzini görmək üçün icazəniz yoxdur' });
    }

    const orderPlain = order.get({ plain: true });

    const receiptData = {
      receipt_no: `INV-${orderPlain.id}`,
      date: orderPlain.createdAt,
      customer_name: orderPlain.User?.name,
      customer_phone: orderPlain.User?.phone,
      delivery_address: orderPlain.User?.address,
      items: orderPlain.items.map(item => ({
        name: item.product?.name || "Naməlum Məhsul",
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity
      })),
      total_amount: Number(orderPlain.totalPrice),
      status: orderPlain.status,
      message: "Bizi seçdiyiniz üçün təşəkkürlər!"
    };

    res.json(receiptData);
  } catch (error) {
    next(error);
  }
};
