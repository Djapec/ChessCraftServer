import { z } from 'zod';

export const fetchGameSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
  round: z
    .string()
    .min(1, 'Round number is required')
    .regex(/^\d+$/, 'Round must be a valid number'),
  game: z.string().min(1, 'Game number is required').regex(/^\d+$/, 'Game must be a valid number'),
});

export type FetchGameQuery = z.infer<typeof fetchGameSchema>;
