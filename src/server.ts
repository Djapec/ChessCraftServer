import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config/config.js';
import { getDatabase } from './config/databaseConfig.js';

import {Database} from "./database/database.js";
import {getSchemas} from "./schemas/index.js";
import {createTestRoutes} from "./routes/testRoute.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app: Application = express();

// Now you can use top-level await
const mg = await getDatabase(config.mongodbUri!);
const schemas = getSchemas(mg);

const db = new Database(mg, schemas);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
const testRoutes = createTestRoutes(db);
app.use('/api/test', testRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Export app for use in index.ts and for testing purposes
export default app;