import { Review, Order, OrderItem, Product } from '../models/index.js';

class ReviewController {
  
  // 1. Rəy yaratmaq (Ancaq alan istifadəçilər)
  async createReview(req, res, next) {
    try {
      const { product_id, rating, comment } = req.body;
      const user_id = req.user.id;

      // 1-ci qayda: İstifadəçinin bu məhsulu doğurdan aldığı (sifarişi olduğu) yoxlanılır
      // Biz baxırıq ki, Userin sifarişlərinin icinde bu product_id-li orderItem varmı və o sifariş ləğv edilməyib ki?
      const hasPurchased = await Order.findOne({
        where: { userId: user_id },
        include: [
          {
            model: OrderItem,
            as: 'items',
            where: { productId: product_id }
          }
        ]
      });

      if (!hasPurchased) {
        return res.status(403).json({ message: 'Siz bu məhsulu satın almamısınız, buna görə rəy yaza bilməzsiniz!' });
      } // "hasPurchased.status === 'delivered'" əlavə oluna bilər gələcəkdə

      // 2-ci qayda: İstifadəçi 1 məhsula sadəcə 1 dəfə rəy yaza bilər
      const existingReview = await Review.findOne({ where: { user_id, product_id } });
      if (existingReview) {
        return res.status(400).json({ message: 'Siz artıq bu məhsula rəy bildirmisiniz. İstəsəniz köhnə rəyinizi yeniləyin.' });
      }

      const newReview = await Review.create({
        user_id,
        product_id,
        rating,
        comment,
        verified_purchase: true 
      });

      res.status(201).json({ message: 'Rəy uğurla əlavə edildi', review: newReview });
    } catch (error) {
      next(error);
    }
  }

  // 2. Məhsulun Rəylərini Oxumaq
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await Review.findAll({
        where: { product_id: productId },
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  // 3. Öz Rəyini Yeniləmək
  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const user_id = req.user.id;

      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ message: 'Rəy tapılmadı' });

      // Owner yoxlanışı
      if (review.user_id !== user_id) {
        return res.status(403).json({ message: 'Yalnız öz rəyinizi dəyişə bilərsiniz' });
      }

      review.rating = rating;
      if (comment) review.comment = comment;
      await review.save();

      res.status(200).json({ message: 'Rəy uğurla yeniləndi', review });
    } catch (error) {
      next(error);
    }
  }

  // 4. Öz rəyini silmək
  async deleteReview(req, res, next) {
      try {
        const { id } = req.params;
        const user_id = req.user.id;
  
        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ message: 'Rəy tapılmadı' });
  
        // Role = admin olsaydı req.user.role === 'admin' ilə silinməyə icazə vermək olar (sonra artırılacaq)
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
