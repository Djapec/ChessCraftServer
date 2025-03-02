import express from 'express';
import {TestController} from '../controllers/test.controller.js';
import {Database} from "../database/database.js";

export function createTestRoutes(db: Database) {
    const router = express.Router();
    const testController = new TestController(db);

    // Define your routes using the controller
    router.get('/', testController.getTest);
    // Add other routes as needed

    return router;
}