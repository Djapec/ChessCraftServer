import express from 'express';
import { TestController } from '../controllers/test.controller.js';
import { Database } from '../database/database.js';

export function createTestRoutes(db: Database) {
  const router = express.Router();
  const testController = new TestController(db);

  router.get('/', testController.getTest);
  router.post('/socket-test', testController.testSocket);

  return router;
}
