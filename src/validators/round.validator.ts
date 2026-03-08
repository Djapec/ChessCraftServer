import { z } from 'zod';

export const fetchRoundSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
  round: z
    .string()
    .min(1, 'Round number is required')
    .regex(/^\d+$/, 'Round must be a valid number'),
});

export type FetchRoundQuery = z.infer<typeof fetchRoundSchema>;
