import express from 'express';
import { ProxyController } from '../controllers/proxy.controller.js';
import {Database} from "../database/database.js";

export function createProxyRoutes(db: Database) {
    const router = express.Router();
    const proxyController = new ProxyController(db);

    router.get('/', proxyController.proxyHandler);

    return router;
} 