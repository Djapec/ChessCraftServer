import app from './server.js';
import dotenv from 'dotenv';
import http from 'http';
import {SocketServer} from "./socket/socket.js";

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3333;

const server = http.createServer(app);

// Initialize Socket.io
SocketServer.initialize(server);

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
