import { z } from 'zod';

export const createProductReviewSchema = z.object({
  product_id: z.number().optional(),
  productId: z.number().optional(),
  rating: z.number().min(1).max(5, 'Qiymət (rating) 1 ilə 5 arasında olmalıdır'),
  comment: z.string().max(1000, 'Şərh çox uzundur').optional()
}).refine(data => data.product_id !== undefined || data.productId !== undefined, {
  message: 'Product ID məcburidir',
  path: ['product_id']
});

export const createComboReviewSchema = z.object({
  combo_id: z.number().optional(),
  comboId: z.number().optional(),
  rating: z.number().min(1).max(5, 'Qiymət (rating) 1 ilə 5 arasında olmalıdır'),
  comment: z.string().max(1000, 'Şərh çox uzundur').optional()
}).refine(data => data.combo_id !== undefined || data.comboId !== undefined, {
  message: 'Combo ID məcburidir',
  path: ['combo_id']
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Qiymət (rating) 1 ilə 5 arasında olmalıdır'),
  comment: z.string().max(1000, 'Şərh çox uzundur').optional()
});

// Geriyə uyğunluq üçün
export const reviewSchema = createProductReviewSchema;
