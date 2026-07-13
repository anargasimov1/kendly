import { z } from 'zod';

export const reviewSchema = z.object({
  product_id: z.number({ required_error: 'Product ID məcburidir' }),
  rating: z.number().min(1).max(5, 'Qiymət (rating) 1 ilə 5 arasında olmalıdır'),
  comment: z.string().max(1000, 'Şərh çox uzundur').optional()
});
