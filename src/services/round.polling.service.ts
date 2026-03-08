import { Database } from '../database/database.js';
import { WatchedRound, RoundWatcherService } from './round.watcher.service.js';
import { RoundRepository } from '../repositories/round.repository.js';
import { fetchApiData } from '../utils/api-client.js';
import { constructApiUrl } from '../utils/urls.js';
import { IPairing } from '../schemas/schemas.interfaces.js';

interface RoundState {
    totalPairings: number;
    completedPairings: number;
}

interface BoardPairing {
    white: {
        fname: string;
        mname: string | null;
        lname: string;
        title: string | null;
        federation: string | null;
        gender: string | null;
        fideid: number;
    };
    black: {
        fname: string;
        mname: string | null;
        lname: string;
        title: string | null;
        federation: string | null;
        gender: string | null;
        fideid: number;
    };
    result: string;
    live: boolean;
}

interface RoundResponse {
    date: string;
    pairings: BoardPairing[];
}

export class RoundPollingService {
    private roundRepository: RoundRepository;
    private roundStates: Map<string, RoundState>;
    private processingRounds: Set<string>;

    constructor(db: Database) {
        this.roundRepository = new RoundRepository(db);
        this.roundStates = new Map();
        this.processingRounds = new Set();
    }

    public async poll(round: WatchedRound): Promise<void> {
        const key = RoundWatcherService.getInstance().buildKey(round);

        if (this.processingRounds.has(key)) {
            console.log(`Skipping round ${key} — still processing from previous cycle`);
            return;
        }

        this.processingRounds.add(key);

        try {
            const url = constructApiUrl(round.id, round.round.toString());
            const result = await fetchApiData(url);

            if (!result.pairings) {
                console.error(`Failed to fetch round data for ${key}`);
                return;
            }

            const roundData: RoundResponse = result;
            await this.processResponse(key, round, roundData);
        } catch (error: any) {
            console.error(`Error polling round ${key}:`, error.message);
        } finally {
            this.processingRounds.delete(key);
        }
    }

    public async processResponse(key: string, watchedRound: WatchedRound, roundData: RoundResponse): Promise<void> {
        const currentState = this.roundStates.get(key);

        if (!currentState) {
            await this.initializeRound(key, watchedRound, roundData);
            return;
        }

        let updatedCount = 0;

        for (let i = 0; i < roundData.pairings.length; i++) {
            const incoming = roundData.pairings[i];
            const gameKey = `${watchedRound.id}-${watchedRound.round}-${i + 1}`;

            if (!incoming.live && incoming.result !== '*') {
                await this.roundRepository.updatePairingResult(
                    watchedRound.id,
                    watchedRound.round,
                    gameKey,
                    incoming.result,
                );
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`Round ${key} — ${updatedCount} pairing(s) updated`);
        }

        const completedPairings = roundData.pairings.filter(
            p => !p.live && p.result !== '*'
        ).length;

        this.roundStates.set(key, {
            totalPairings: roundData.pairings.length,
            completedPairings,
        });

        if (completedPairings === roundData.pairings.length) {
            console.log(`Round ${key} — all pairings completed, removing from watch list`);
            RoundWatcherService.getInstance().removeRoundByKey(key);
        }
    }

    public async initializeRound(key: string, watchedRound: WatchedRound, roundData: RoundResponse): Promise<void> {
        const existingRound = await this.roundRepository.findByTournamentAndRound(
            watchedRound.id,
            watchedRound.round,
        );

        if (existingRound) {
            const completedPairings = existingRound.pairings.filter(
                p => !p.live && p.result !== '*'
            ).length;

            this.roundStates.set(key, {
                totalPairings: existingRound.pairings.length,
                completedPairings,
            });

            console.log(`Round ${key} resumed from DB — ${completedPairings}/${existingRound.pairings.length} pairings completed`);
        } else {
            const pairings: IPairing[] = roundData.pairings.map((p, index) => ({
                gameNumber: index + 1,
                gameKey: `${watchedRound.id}-${watchedRound.round}-${index + 1}`,
                white: p.white,
                black: p.black,
                result: p.result,
                live: p.live,
            }));

            await this.roundRepository.createRound({
                tournamentId: watchedRound.id,
                round: watchedRound.round,
                date: new Date(roundData.date),
                pairings,
            });

            const completedPairings = roundData.pairings.filter(
                p => !p.live && p.result !== '*'
            ).length;

            this.roundStates.set(key, {
                totalPairings: pairings.length,
                completedPairings,
            });

            console.log(`Round ${key} created in DB with ${pairings.length} pairings`);
        }
    }

    public clearState(key: string): void {
        this.roundStates.delete(key);
        this.processingRounds.delete(key);
        console.log(`State cleared for round: ${key}`);
    }

    public clearAllStates(): void {
        this.roundStates.clear();
        this.processingRounds.clear();
        console.log('All round states cleared');
    }
}