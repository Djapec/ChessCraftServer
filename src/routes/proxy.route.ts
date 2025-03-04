import express from 'express';
import { ProxyController } from '../controllers/proxy.controller.js';

export function createProxyRoutes() {
    const router = express.Router();
    const proxyController = new ProxyController();

    router.get('/', proxyController.proxyHandler);

    return router;
} 