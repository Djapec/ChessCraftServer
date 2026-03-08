import express from 'express';
import { RoundController } from '../controllers/round.controller.js';
import { Database } from '../database/database.js';
import { fetchRoundSchema } from '../validators/round.validator.js';
import { validateQuery } from '../middleware/validate.middleware.js';

export function createRoundRoutes(db: Database) {
  const router = express.Router();
  const roundController = new RoundController(db);

  router.get('/', validateQuery(fetchRoundSchema), roundController.fetchRound);

  return router;
}
