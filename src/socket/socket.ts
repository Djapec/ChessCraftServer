import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

export class SocketServer {
  private static instance: SocketServer;
  private readonly io: Server;

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.registerEvents();
    console.log('Socket.io initialized');
  }

  private registerEvents(): void {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public static initialize(httpServer: HttpServer): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
    }
    return SocketServer.instance;
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      throw new Error('SocketServer has not been initialized.');
    }
    return SocketServer.instance;
  }

  public getIO(): Server {
    return this.io;
  }
}
