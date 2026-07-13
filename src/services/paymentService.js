import { v4 as uuidv4 } from 'uuid';
import { Payment, Order } from '../models/index.js';
import { sequelize } from '../config/db.js';

// Qeyd: Real Stripe obyekti işlətmək üçün test açarı lazımdır.
// Cari halda Stripe-ı simulyasiya edirik (Mock rejim)
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createIntent(orderId, amount) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      const error = new Error('Sifariş tapılmadı');
      error.statusCode = 404;
      throw error;
    }

    if (order.status !== 'pending') {
         const error = new Error('Bu sifariş artıq ödənilib və ya ləğv edilib');
         error.statusCode = 400;
         throw error;
    }

    // İdempotency key yaradırıq (iki dəfə eyni ödənişin qarşısını almaq üçün)
    const idempotencyKey = uuidv4();

    // Mock yaradılışı
    const payment = await Payment.create({
      orderId,
      amount,
      status: 'pending',
      provider: 'mock_stripe',
      idempotencyKey,
      providerData: { clientSecret: `mock_secret_${uuidv4()}` }
    });

    return {
      paymentId: payment.id,
      clientSecret: payment.providerData.clientSecret,
      amount
    };
  }

  // Webhook funksiyası - Mock rejimində sırf xarici zəng simulyasiyasıdır
  async handleWebhook(providerData) {
    const t = await sequelize.transaction();
    try {
      // Mock rejimdə təsəvvür edək ki, "succeeded" event-i göndərilib
      // Payload: { paymentId: '...', status: 'succeeded' }
      const { paymentId, status } = providerData;

      const payment = await Payment.findByPk(paymentId, { transaction: t });
      if (!payment) {
        throw new Error('Ödəniş tapılmadı');
      }

      if (payment.status !== 'pending') {
          await t.rollback();
          return { message: "Bu ödəniş artıq işlənib" }; // Idempotent təbiət
      }

      payment.status = status;
      await payment.save({ transaction: t });

      // Order State Sync
      const order = await Order.findByPk(payment.orderId, { transaction: t });
      
      if (status === 'succeeded') {
        order.status = 'confirmed';
      } else if (status === 'failed') {
        order.status = 'cancelled';
      }
      
      await order.save({ transaction: t });

      await t.commit();
      return { success: true, paymentStatus: payment.status };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
        const error = new Error('Ödəniş tapılmadı');
        error.statusCode = 404;
        throw error;
    }
    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount
    };
  }
}

export default new PaymentService();
