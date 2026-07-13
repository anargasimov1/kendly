import { z } from 'zod';

export const createFarmerSchema = z.object({
  bio: z.string().min(10, 'Bio ən azı 10 simvol olmalıdır').max(1000, 'Bio çox uzundur')
});
