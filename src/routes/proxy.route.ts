import express from 'express';
import { RoundController } from '../controllers/round.controller.js';
import { Database } from '../database/database.js';

export function createRoundRoutes(db: Database) {
  const router = express.Router();
  const roundController = new RoundController(db);

  router.get('/', roundController.fetchRound);

  return router;
}
