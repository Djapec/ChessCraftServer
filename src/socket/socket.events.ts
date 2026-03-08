export const SocketEvents = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // My events
  NOTIFICATION: 'notification',
  TOURNAMENT_UPDATED: 'tournament:updated',
  GAME_UPDATED: 'game:updated',
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
