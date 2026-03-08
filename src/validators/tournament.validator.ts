import { z } from 'zod';

export const fetchTournamentSchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
});

export type FetchTournamentQuery = z.infer<typeof fetchTournamentSchema>;
