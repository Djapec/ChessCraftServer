import { SocketServer } from './socket.js';
import { SocketEvents, type SocketEvent } from './socket.events.js';

interface NotificationPayload {
    message: string;
    data?: Record<string, unknown>;
}

export class SocketService {
    private static instance: SocketService;

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
            console.log('SocketServer has been initialized' )
        }
        return SocketService.instance;
    }

    // Emit to all connected clients
    public emit(event: SocketEvent, payload: unknown): void {
        SocketServer.getInstance().getIO().emit(event, payload);
    }

    // Emit to a specific socket (single client)
    public emitToSocket(socketId: string, event: SocketEvent, payload: unknown): void {
        SocketServer.getInstance().getIO().to(socketId).emit(event, payload);
    }

    // Emit to a specific room
    public emitToRoom(room: string, event: SocketEvent, payload: unknown): void {
        SocketServer.getInstance().getIO().to(room).emit(event, payload);
    }

    // Convenience method for sending notifications
    public notify(payload: NotificationPayload): void {
        this.emit(SocketEvents.NOTIFICATION, payload);
    }

    // Convenience method for tournament updates
    public notifyTournamentUpdated(data: Record<string, unknown>): void {
        this.emit(SocketEvents.TOURNAMENT_UPDATED, data);
    }

    // Convenience method for game updates
    public notifyGameUpdated(data: Record<string, unknown>): void {
        this.emit(SocketEvents.GAME_UPDATED, data);
    }
}