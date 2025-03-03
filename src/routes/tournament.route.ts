import multer from 'multer';
import {Database} from "../database/database.js";
import express from "express";
import {TournamentController} from "../controllers/tournament.controller.js";

export function createTournamentRoutes(db: Database) {
    const router = express.Router();
    const tournamentController = new TournamentController(db);

    // Configure multer with memory storage instead of disk storage
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });

    router.post('/', upload.single('file'), tournamentController.saveTournament);

    return router;
}