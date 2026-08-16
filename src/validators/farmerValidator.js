import { z } from 'zod';

export const createFarmerSchema = z.object({
  bio: z.string().min(10, 'Bio ən azı 10 simvol olmalıdır').max(1000, 'Bio çox uzundur'),
  farmName: z.string().min(2, 'Ferma adı ən azı 2 simvol olmalıdır').max(255).optional(),
  profile_image: z.string().optional(),
  farmAddress: z.string().max(255).optional(),
  farmPhone: z.string().max(20).optional(),
  experienceYears: z.number().int().min(0, 'Təcrübə ili mənfi ola bilməz').optional(),
  idCardNumber: z.string().max(20).optional(),
});
