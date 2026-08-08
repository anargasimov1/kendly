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
  address_id: z
    .number({ required_error: 'address_id mütləqdir' })
    .int('address_id tam ədəd olmalıdır')
    .positive('address_id müsbət olmalıdır'),
  delivery_zone_id: z
    .number()
    .int()
    .positive()
    .optional(),
  payment_method: z.enum(['card', 'cash']).optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    { required_error: 'status mütləqdir' }
  ),
});
