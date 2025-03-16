import {Database} from "../database/database.js";
import {DelayedResult} from "../Interfaces/Interfaces.js";


export class GameRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async saveDelayedGameResultUpsert(delayedResult: DelayedResult){
        return this.db.findOneAndUpdate({
                collection: 'DelayedResult',
                query: { whitePlayerId: delayedResult.whitePlayerId },
                update: {
                    whitePlayerId: delayedResult.whitePlayerId,
                    result: delayedResult.result,
                    gameCompletedAt: delayedResult.gameCompletedAt,
                },
                options: { upsert: true, new: true },
            },
        );
    }

    async getAllDelayedResults(): Promise<DelayedResult[]> {
        return await this.db.find({
            collection: 'DelayedResult',
            project: {
                whitePlayerId: 1,
            }
        });
    }

    async deleteExpiredDelayedResults(cutoffTime: number): Promise<DelayedResult[]> {
        return await this.db.deleteMany({
            collection: 'DelayedResult',
            query: { gameCompletedAt: { $lt: cutoffTime } }
        });
    }
}