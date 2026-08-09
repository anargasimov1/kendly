import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  phone: z.string().min(5, 'Düzgün nömrə daxil edin'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Mesaj ən azı 10 simvol olmalıdır').max(2000, 'Mesaj çox uzundur')
});
