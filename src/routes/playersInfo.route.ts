import multer from 'multer';
import {Database} from "../database/database.js";
import express from "express";
import {PlayersInfoController} from "../controllers/playersInfo.controller.js";

export function createChessRoutes(db: Database) {
    const router = express.Router();
    const playersInfoController = new PlayersInfoController(db);

    // Configure multer with memory storage instead of disk storage
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });

    router.post('/', upload.single('file'), playersInfoController.savePlayersInfo);

    return router;
}