import express from "express";
import {GameController} from "../controllers/game.controller.js";
import {Database} from "../database/database.js";

export function createGameRoutes(db: Database) {
    const router = express.Router();
    const gameController = new GameController(db);

    router.get('/', gameController.fetchGame);

    return router;
}