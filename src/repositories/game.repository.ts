import {Database} from "../database/database.js";
import {DelayedResult} from "../Interfaces/Interfaces.js";


export class GameRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async getDelayedResults(fifteenMinutesAgo: number): Promise<DelayedResult[]>{
        return await this.db.find({
            collection: 'DelayedResult',
            query: { gameCompletedAt: { $lt: fifteenMinutesAgo } },
            project: {
                whitePlayerId: 1,
            }
        });
    }

    async bulkInsertDelayedResults(records: DelayedResult[]): Promise<DelayedResult[]> {
        const whitePlayerIds = records.map(record => record.whitePlayerId);

        const existingRecords = await this.db.find({
            collection: 'DelayedResult',
            query: { whitePlayerId: { $in: whitePlayerIds } },
            project: {
                whitePlayerId: 1,
            }
        });

        const existingPlayerIds = new Set(existingRecords.map((record: { whitePlayerId: any; }) => record.whitePlayerId));
        const recordsToInsert = records.filter(record => !existingPlayerIds.has(record.whitePlayerId));

        const formatToUTCOffset = (timestamp: number): string => {
            return new Date(timestamp).toISOString();
        };

        const formattedGames = recordsToInsert.map(game => ({
            ...game,
            gameCompletedAtFormatted: formatToUTCOffset(game.gameCompletedAt)
        }));

        if (recordsToInsert.length > 0) {
            await this.db.insertMany({
                collection: 'DelayedResult',
                documents: formattedGames
            });
            return recordsToInsert;
        }
        return [];
    }
}