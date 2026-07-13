import paymentService from '../services/paymentService.js';

export const createIntent = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    // Ownership yoxlanması service yaxud burada da edilə bilər (sadəlik üçün buraxılıb)
    const result = await paymentService.createIntent(orderId, amount);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    // Burada real Stripe-da raw buffer və signature verification (Stripe.webhooks.constructEvent) olacaq
    // İndi mock olaraq req.body qəbul edirik
    const providerData = req.body; 
    
    const result = await paymentService.handleWebhook(providerData);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = await paymentService.getPaymentStatus(id);
    res.json(status);
  } catch (error) {
    next(error);
  }
};
