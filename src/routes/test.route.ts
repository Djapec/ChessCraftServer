import express from 'express';
import { TestController } from '../controllers/test.controller.js';

export function createTestRoutes() {
  const router = express.Router();
  const testController = new TestController();

  router.get('/', testController.getTest);
  router.post('/socket-test', testController.testSocket);

  return router;
}
