import express from 'express';
import { ProxyController } from '../controllers/proxy.controller.js';
import {Database} from "../database/database.js";
import {ResourceService} from "../services/resource.service.js";

export function createProxyRoutes(db: Database, resourceService: ResourceService) {
    const router = express.Router();
    const proxyController = new ProxyController(db, resourceService);

    router.get('/', proxyController.proxyHandler);

    return router;
} 