import { Review, Product, ComboMenu, User } from '../models/index.js';
import { buildRatingStats } from '../utils/ratingStats.js';
import {
  assertCanCreateProductReview,
  assertCanCreateComboReview,
  getProductReviewEligibility,
  getComboReviewEligibility,
} from '../utils/reviewEligibility.js';

class ReviewController {

  async getProductReviewEligibility(req, res, next) {
    try {
      const { productId } = req.params;
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: 'Məhsul tapılmadı' });
      }

      const eligibility = await getProductReviewEligibility(req.user.id, Number(productId));
      res.status(200).json(eligibility);
    } catch (error) {
      next(error);
    }
  }

  async getComboReviewEligibility(req, res, next) {
    try {
      const { comboId } = req.params;
      const combo = await ComboMenu.findByPk(comboId);
      if (!combo) {
        return res.status(404).json({ message: 'Kombo menyu tapılmadı' });
      }

      const eligibility = await getComboReviewEligibility(req.user.id, Number(comboId));
      res.status(200).json(eligibility);
    } catch (error) {
      next(error);
    }
  }

  async createReview(req, res, next) {
    try {
      const { product_id, productId, rating, comment } = req.body;
      const targetProductId = product_id || productId;
      const user_id = req.user.id;

      const product = await Product.findByPk(targetProductId);
      if (!product) {
        return res.status(404).json({ message: 'Məhsul tapılmadı' });
      }

      try {
        await assertCanCreateProductReview(user_id, targetProductId);
      } catch (error) {
        return res.status(error.statusCode || 403).json({ message: error.message });
      }

      const newReview = await Review.create({
        user_id,
        product_id: targetProductId,
        rating,
        comment,
        verified_purchase: true
      });

      res.status(201).json({ message: 'Rəy uğurla əlavə edildi', review: newReview });
    } catch (error) {
      next(error);
    }
  }

  async createComboReview(req, res, next) {
    try {
      const { combo_id, comboId, rating, comment } = req.body;
      const targetComboId = combo_id || comboId;
      const user_id = req.user.id;

      const combo = await ComboMenu.findByPk(targetComboId);
      if (!combo) {
        return res.status(404).json({ message: 'Kombo menyu tapılmadı' });
      }

      try {
        await assertCanCreateComboReview(user_id, targetComboId);
      } catch (error) {
        return res.status(error.statusCode || 403).json({ message: error.message });
      }

      const newReview = await Review.create({
        user_id,
        combo_id: targetComboId,
        rating,
        comment,
        verified_purchase: true
      });

      res.status(201).json({ message: 'Rəy uğurla əlavə edildi', review: newReview });
    } catch (error) {
      next(error);
    }
  }

  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await Review.findAll({
        where: { product_id: productId },
        attributes: ['id', 'rating', 'comment', 'createdAt', 'verified_purchase'],
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      const reviewList = reviews.map((review) => review.toJSON());
      res.status(200).json({
        reviews: reviewList,
        rating_stats: buildRatingStats(reviewList),
      });
    } catch (error) {
      next(error);
    }
  }

  async getComboReviews(req, res, next) {
    try {
      const { comboId } = req.params;
      const reviews = await Review.findAll({
        where: { combo_id: comboId },
        attributes: ['id', 'rating', 'comment', 'createdAt', 'verified_purchase'],
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']]
      });

      const reviewList = reviews.map((review) => review.toJSON());
      res.status(200).json({
        reviews: reviewList,
        rating_stats: buildRatingStats(reviewList),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const user_id = req.user.id;

      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ message: 'Rəy tapılmadı' });

      if (review.user_id !== user_id) {
        return res.status(403).json({ message: 'Yalnız öz rəyinizi dəyişə bilərsiniz' });
      }

      review.rating = rating;
      if (comment !== undefined) review.comment = comment;
      await review.save();

      res.status(200).json({ message: 'Rəy uğurla yeniləndi', review });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ message: 'Rəy tapılmadı' });

      if (review.user_id !== user_id) {
        return res.status(403).json({ message: 'Yalnız öz rəyinizi silə bilərsiniz' });
      }

      await review.destroy();
      res.status(200).json({ message: 'Rəy silindi' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
