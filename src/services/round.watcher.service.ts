import { Database } from '../database/database.js';
import { RoundPollingService } from './round.polling.service.js';

export interface WatchedRound {
    id: string;
    round: string;
}

export class RoundWatcherService {
    private static instance: RoundWatcherService;
    private roundPollingService: RoundPollingService;
    private watchedRounds: Map<string, WatchedRound>;
    private intervalId: NodeJS.Timeout | null;
    private readonly POLL_INTERVAL = 600000; // 10 minutes

    constructor(db: Database) {
        this.roundPollingService = new RoundPollingService(db);
        this.watchedRounds = new Map();
        this.intervalId = null;
    }

    public static initialize(db: Database): RoundWatcherService {
        if (!RoundWatcherService.instance) {
            RoundWatcherService.instance = new RoundWatcherService(db);
        }
        return RoundWatcherService.instance;
    }

    public static getInstance(): RoundWatcherService {
        if (!RoundWatcherService.instance) {
            throw new Error('RoundWatcherService has not been initialized. Call RoundWatcherService.initialize() first.');
        }
        return RoundWatcherService.instance;
    }

    public isRoundInWatchedRoundList(round: WatchedRound): boolean {
        const key = this.buildKey(round);
        return this.watchedRounds.has(key);
    }
    public syncRounds(rounds: WatchedRound[]): void {
        const incomingKeys = new Set(rounds.map(r => this.buildKey(r)));

        for (const key of this.watchedRounds.keys()) {
            if (!incomingKeys.has(key)) {
                this.watchedRounds.delete(key);
                console.log(`Stopped watching round: ${key}`);
            }
        }

        for (const round of rounds) {
            const key = this.buildKey(round);
            if (!this.watchedRounds.has(key)) {
                this.watchedRounds.set(key, round);
                console.log(`Started watching round: ${key}`);
            }
        }
    }

    public addRound(round: WatchedRound): void {
        const key = this.buildKey(round);
        if (!this.watchedRounds.has(key)) {
            this.watchedRounds.set(key, round);
            console.log(`Started watching round: ${key}`);
        }
    }

    public removeRound(round: WatchedRound): void {
        const key = this.buildKey(round);
        if (this.watchedRounds.has(key)) {
            this.watchedRounds.delete(key);
            this.roundPollingService.clearState(key);
            console.log(`Stopped watching round: ${key}`);
        }
    }

    public removeRoundByKey(key: string): void {
        if (this.watchedRounds.has(key)) {
            this.watchedRounds.delete(key);
            this.roundPollingService.clearState(key);
            console.log(`Auto-removed completed round: ${key}`);
        }
    }

    public getWatchedRounds(): WatchedRound[] {
        return Array.from(this.watchedRounds.values());
    }

    public clearRounds(): void {
        this.watchedRounds.clear();
        this.roundPollingService.clearAllStates();
        console.log('Cleared all watched rounds');
    }

    public start(): void {
        if (this.intervalId) {
            console.log('RoundWatcherService is already running');
            return;
        }

        console.log(`RoundWatcherService started — polling every ${this.POLL_INTERVAL / 60000} minutes`);

        this.intervalId = setInterval(async () => {
            if (this.watchedRounds.size === 0) return;

            const rounds = Array.from(this.watchedRounds.values());

            await Promise.allSettled(
                rounds.map(round => this.roundPollingService.poll(round))
            );
        }, this.POLL_INTERVAL);
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('RoundWatcherService stopped');
        }
    }

    public buildKey(round: WatchedRound): string {
        return `${round.id}-${round.round}`;
    }
}
