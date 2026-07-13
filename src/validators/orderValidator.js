import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z
    .number({ required_error: 'product_id mütləqdir' })
    .int('product_id tam ədəd olmalıdır')
    .positive('product_id müsbət olmalıdır'),
  quantity: z
    .number({ required_error: 'quantity mütləqdir' })
    .int('quantity tam ədəd olmalıdır')
    .min(1, 'quantity minimum 1 olmalıdır'),
  price: z
    .number({ required_error: 'price mütləqdir' })
    .positive('price müsbət olmalıdır'),
});

export const createOrderSchema = z.object({
  total_price: z
    .number({ required_error: 'total_price mütləqdir' })
    .positive('total_price müsbət olmalıdır'),
  notes: z.string().max(500).optional(),
  items: z
    .array(orderItemSchema)
    .min(1, 'Sifarişdə ən azı 1 məhsul olmalıdır'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    { required_error: 'status mütləqdir' }
  ),
});
