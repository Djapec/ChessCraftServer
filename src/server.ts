import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config/config.js';
import { getDatabase } from './config/database.config.js';
import {Database} from "./database/database.js";
import {getSchemas} from "./schemas/index.js";
import {createTestRoutes} from "./routes/test.route.js";
import {createTournamentRoutes} from "./routes/tournament.route.js";
import { createProxyRoutes } from './routes/proxy.route.js';
import {createGameRoutes} from "./routes/game.route.js";
import {midnightTruncateCron} from "./cron/midnightTruncateCron.js";
import {ResourceService} from "./services/resource.service.js";

dotenv.config();

const app: Application = express();

// Database
const mongoDb = await getDatabase(config.mongodbUri!);
const schemas = getSchemas(mongoDb);
const db = new Database(mongoDb, schemas);

midnightTruncateCron(db);

const corsConfig = {
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsConfig));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API controllers
const resourceService = new ResourceService();
const testRoutes = createTestRoutes(db);
const tournamentRoutes = createTournamentRoutes(db);
const proxyRoutes = createProxyRoutes(db, resourceService);
const gameRoutes = createGameRoutes(db, resourceService);

// API routes
app.use('/api/test', testRoutes);
app.use('/api/process-chess-data', tournamentRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/proxy/game', gameRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

export default app;
