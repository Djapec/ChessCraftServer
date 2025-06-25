import express from "express";
import {GameController} from "../controllers/game.controller.js";
import {Database} from "../database/database.js";
import {ResourceService} from "../services/resource.service.js";

export function createGameRoutes(db: Database, resourceService: ResourceService) {
    const router = express.Router();
    const gameController = new GameController(db, resourceService);

    router.get('/', gameController.fetchGame);

    return router;
}