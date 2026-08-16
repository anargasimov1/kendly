import { Order, OrderItem, Review } from '../models/index.js';
import { ORDER_STATUSES } from './orderConstants.js';

export const REVIEW_BLOCK_REASONS = {
  NOT_PURCHASED: 'not_purchased',
  ORDER_NOT_DELIVERED: 'order_not_delivered',
  ALREADY_REVIEWED: 'already_reviewed',
};

const findDeliveredOrder = async (userId, itemWhere) => {
  return Order.findOne({
    where: { userId, status: ORDER_STATUSES.DELIVERED },
    include: [
      {
        model: OrderItem,
        as: 'items',
        where: itemWhere,
      },
    ],
  });
};

export const getProductReviewEligibility = async (userId, productId) => {
  const existingReview = await Review.findOne({
    where: { user_id: userId, product_id: productId },
    attributes: ['id'],
  });

  if (existingReview) {
    return {
      can_review: false,
      has_review: true,
      review_id: existingReview.id,
      reason: REVIEW_BLOCK_REASONS.ALREADY_REVIEWED,
    };
  }

  const deliveredOrder = await findDeliveredOrder(userId, { productId });

  if (deliveredOrder) {
    return {
      can_review: true,
      has_review: false,
      product_id: productId,
    };
  }

  const anyOrder = await Order.findOne({
    where: { userId },
    include: [
      {
        model: OrderItem,
        as: 'items',
        where: { productId },
      },
    ],
  });

  if (anyOrder) {
    return {
      can_review: false,
      has_review: false,
      reason: REVIEW_BLOCK_REASONS.ORDER_NOT_DELIVERED,
    };
  }

  return {
    can_review: false,
    has_review: false,
    reason: REVIEW_BLOCK_REASONS.NOT_PURCHASED,
  };
};

export const getComboReviewEligibility = async (userId, comboId) => {
  const existingReview = await Review.findOne({
    where: { user_id: userId, combo_id: comboId },
    attributes: ['id'],
  });

  if (existingReview) {
    return {
      can_review: false,
      has_review: true,
      review_id: existingReview.id,
      reason: REVIEW_BLOCK_REASONS.ALREADY_REVIEWED,
    };
  }

  const deliveredOrder = await findDeliveredOrder(userId, { comboId });

  if (deliveredOrder) {
    return {
      can_review: true,
      has_review: false,
      combo_id: comboId,
    };
  }

  const anyOrder = await Order.findOne({
    where: { userId },
    include: [
      {
        model: OrderItem,
        as: 'items',
        where: { comboId },
      },
    ],
  });

  if (anyOrder) {
    return {
      can_review: false,
      has_review: false,
      reason: REVIEW_BLOCK_REASONS.ORDER_NOT_DELIVERED,
    };
  }

  return {
    can_review: false,
    has_review: false,
    reason: REVIEW_BLOCK_REASONS.NOT_PURCHASED,
  };
};

export const assertCanCreateProductReview = async (userId, productId) => {
  const eligibility = await getProductReviewEligibility(userId, productId);

  if (eligibility.can_review) {
    return eligibility;
  }

  const messages = {
    [REVIEW_BLOCK_REASONS.NOT_PURCHASED]: 'Siz bu məhsulu satın almamısınız, buna görə rəy yaza bilməzsiniz!',
    [REVIEW_BLOCK_REASONS.ORDER_NOT_DELIVERED]: 'Sifarişiniz hələ tamamlanmayıb. Rəy yalnız çatdırılmış (tamamlanmış) sifarişlər üçün mümkündür.',
    [REVIEW_BLOCK_REASONS.ALREADY_REVIEWED]: 'Siz artıq bu məhsula rəy bildirmisiniz. İstəsəniz köhnə rəyinizi yeniləyin.',
  };

  const error = new Error(messages[eligibility.reason] || 'Rəy yaza bilməzsiniz');
  error.statusCode = eligibility.reason === REVIEW_BLOCK_REASONS.ALREADY_REVIEWED ? 400 : 403;
  throw error;
};

export const assertCanCreateComboReview = async (userId, comboId) => {
  const eligibility = await getComboReviewEligibility(userId, comboId);

  if (eligibility.can_review) {
    return eligibility;
  }

  const messages = {
    [REVIEW_BLOCK_REASONS.NOT_PURCHASED]: 'Siz bu kombo menyunu satın almamısınız, buna görə rəy yaza bilməzsiniz!',
    [REVIEW_BLOCK_REASONS.ORDER_NOT_DELIVERED]: 'Sifarişiniz hələ tamamlanmayıb. Rəy yalnız çatdırılmış (tamamlanmış) sifarişlər üçün mümkündür.',
    [REVIEW_BLOCK_REASONS.ALREADY_REVIEWED]: 'Siz artıq bu kombo menyuya rəy bildirmisiniz. İstəsəniz köhnə rəyinizi yeniləyin.',
  };

  const error = new Error(messages[eligibility.reason] || 'Rəy yaza bilməzsiniz');
  error.statusCode = eligibility.reason === REVIEW_BLOCK_REASONS.ALREADY_REVIEWED ? 400 : 403;
  throw error;
};
