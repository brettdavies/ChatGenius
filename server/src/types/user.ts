import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional()
});

export type User = z.infer<typeof userSchema>; 