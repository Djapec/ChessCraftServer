import { Database } from '../database/database.js';
import { GamePollingService } from './game.pulling.service.js';

export interface WatchedGame {
  id: string;
  round: string;
  game: string;
}

export class PollingService {
  private static instance: PollingService;
  private gamePollingService: GamePollingService;
  private watchedGames: Map<string, WatchedGame>;
  private intervalId: NodeJS.Timeout | null;
  private readonly POLL_INTERVAL = 5000;

  private constructor(db: Database) {
    this.gamePollingService = new GamePollingService(db);
    this.watchedGames = new Map();
    this.intervalId = null;
  }

  public static initialize(db: Database): PollingService {
    if (!PollingService.instance) {
      PollingService.instance = new PollingService(db);
    }
    return PollingService.instance;
  }

  public static getInstance(): PollingService {
    if (!PollingService.instance) {
      throw new Error(
        'PollingService has not been initialized. Call PollingService.initialize() first.',
      );
    }
    return PollingService.instance;
  }

  // Called when Vue sends an updated list of watched games
  public syncGames(games: WatchedGame[]): void {
    const incomingKeys = new Set(games.map((g) => this.buildKey(g)));

    // Stop polling games no longer in the list
    for (const key of this.watchedGames.keys()) {
      if (!incomingKeys.has(key)) {
        this.watchedGames.delete(key);
        console.log(`Stopped watching game: ${key}`);
      }
    }

    // Start watching new games
    for (const game of games) {
      const key = this.buildKey(game);
      if (!this.watchedGames.has(key)) {
        this.watchedGames.set(key, game);
        console.log(`Started watching game: ${key}`);
      }
    }
  }

  public start(): void {
    if (this.intervalId) {
      console.log('PollingService is already running');
      return;
    }

    console.log(`PollingService started — polling every ${this.POLL_INTERVAL / 1000}s`);

    this.intervalId = setInterval(async () => {
      if (this.watchedGames.size === 0) return;

      const games = Array.from(this.watchedGames.values());

      await Promise.allSettled(games.map((game) => this.gamePollingService.poll(game)));
    }, this.POLL_INTERVAL);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('PollingService stopped');
    }
  }

  public isGameInWatchedGameList(game: WatchedGame): boolean {
    const key = this.buildKey(game);
    return this.watchedGames.has(key);
  }

  public addGame(game: WatchedGame): boolean {
    const key = this.buildKey(game);
    if (!this.watchedGames.has(key)) {
      this.watchedGames.set(key, game);
      console.log(`Started watching game: ${key}`);
      return true;
    }
    return false;
  }

  public removeGame(game: WatchedGame): boolean {
    const key = this.buildKey(game);
    if (this.watchedGames.has(key)) {
      this.watchedGames.delete(key);
      console.log(`Stopped watching game: ${key}`);
      return true;
    }
    return false;
  }

  public getWatchedGames(): WatchedGame[] {
    return Array.from(this.watchedGames.values());
  }

  public clearGames(): void {
    this.watchedGames.clear();
    this.gamePollingService.clearStates();
    console.log('Cleared all watched games');
  }

  private buildKey(game: WatchedGame): string {
    return `${game.id}-${game.round}-${game.game}`;
  }
}
