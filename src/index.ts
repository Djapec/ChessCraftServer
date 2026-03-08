import http from 'http';
import app from './server.js';
import dotenv from 'dotenv';
import { SocketServer } from './socket/socket.js';
import { Database } from './database/database.js';
import { PollingService } from './services/pulling.service.js';
import { RoundWatcherService } from './services/round.watcher.service.js';

dotenv.config();

const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

// Initialize Socket.io
SocketServer.initialize(server);

// Initialize PollingService
const db = app.get('db') as Database;
PollingService.initialize(db);
PollingService.getInstance().start();

RoundWatcherService.initialize(db);
RoundWatcherService.getInstance().start();

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  PollingService.getInstance().stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});
