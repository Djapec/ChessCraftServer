import multer from 'multer';
import { Database } from '../database/database.js';
import express from 'express';
import { TournamentController } from '../controllers/tournament.controller.js';
import { fetchTournamentSchema } from '../validators/tournament.validator.js';
import { validateQuery } from '../middleware/validate.middleware.js';

export function createTournamentRoutes(db: Database) {
  const router = express.Router();
  const tournamentController = new TournamentController(db);

  // Configure multer with memory storage instead of disk storage
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  router.get('/', validateQuery(fetchTournamentSchema), tournamentController.fetchTournament);
  router.post('/process-chess-data', upload.single('file'), tournamentController.saveTournament);

  return router;
}
