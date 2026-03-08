import express from 'express';
import { GameController } from '../controllers/game.controller.js';
import { Database } from '../database/database.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { fetchGameSchema } from '../validators/game.validator.js';

export function createGameRoutes(db: Database) {
  const router = express.Router();
  const gameController = new GameController(db);

  router.get('/', validateQuery(fetchGameSchema), gameController.fetchGame);

  return router;
}
