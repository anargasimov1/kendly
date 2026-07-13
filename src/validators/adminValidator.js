import { z } from 'zod';

export const pageSchema = z.object({
  slug: z.string().min(2, 'Slug çox qısadır').max(100, 'Slug çox uzundur').regex(/^[a-z0-9-]+$/, 'Slug yalnız kiçik hərflər, rəqəmlər və defisdən ibarət olmalıdır'),
  title: z.string().min(3, 'Başlıq çox qısadır').max(200, 'Başlıq çox uzundur'),
  content: z.string().min(10, 'Məzmun çox qısadır')
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Ad çox qısadır').max(100, 'Ad çox uzundur'),
  parent_id: z.number().int().positive().optional().nullable()
});

export const regionSchema = z.object({
  name: z.string().min(2, 'Ad çox qısadır').max(100, 'Ad çox uzundur')
});

export const farmerVerifySchema = z.object({
  status: z.enum(['approved', 'rejected'], { errorMap: () => ({ message: 'Status yalnız approved və ya rejected ola bilər' }) })
});
