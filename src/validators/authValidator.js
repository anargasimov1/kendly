import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email mütləqdir' })
    .email('Düzgün email formatı daxil edin'),
  password: z
    .string({ required_error: 'Şifrə mütləqdir' })
    .min(6, 'Şifrə minimum 6 simvol olmalıdır'),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Ad mütləqdir' })
    .min(2, 'Ad minimum 2 simvol olmalıdır')
    .max(100, 'Ad maksimum 100 simvol ola bilər'),
  email: z
    .string({ required_error: 'Email mütləqdir' })
    .email('Düzgün email formatı daxil edin'),
  password: z
    .string({ required_error: 'Şifrə mütləqdir' })
    .min(6, 'Şifrə minimum 6 simvol olmalıdır'),
  role: z.enum(['user', 'admin', 'farmer']).optional().default('user'),
});

export const refreshSchema = z
  .object({
    refreshToken: z.string().optional(),
    refresh_token: z.string().optional(),
  })
  .transform((data) => ({
    refreshToken: data.refreshToken || data.refresh_token,
  }))
  .refine((data) => Boolean(data.refreshToken), {
    message: 'Refresh token mütləqdir',
    path: ['refreshToken'],
  });
