import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  orderId: z
    .number({ required_error: 'orderId mütləqdir' })
    .int('orderId tam ədəd olmalıdır')
    .positive('orderId müsbət olmalıdır'),
  amount: z
    .number({ required_error: 'amount mütləqdir' })
    .positive('amount müsbət olmalıdır'),
});
