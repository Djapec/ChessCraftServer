import { Database } from '../database/database.js';
import { IGame, IBoardMove } from '../schemas/schemas.interfaces.js';
import { collections } from '../utils/constants.js';

export class WatchedGameRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findBySerialNr(serialNr: string): Promise<IGame | null> {
    return await this.db.findOne({
      collection: collections.GAME,
      query: { serialNr },
    });
  }

  async createGame(document: Partial<IGame>): Promise<IGame> {
    return await this.db.insertOne({
      collection: collections.GAME,
      document,
    });
  }

  async appendMoves(serialNr: string, moves: IBoardMove[]): Promise<void> {
    await this.db.updateOne({
      collection: collections.GAME,
      query: { serialNr },
      update: {
        $push: { moves: { $each: moves } },
        $inc: { moveCount: moves.length },
      },
    });
  }

  async closeGame(serialNr: string, result: string): Promise<void> {
    await this.db.updateOne({
      collection: collections.GAME,
      query: { serialNr },
      update: {
        $set: { live: false, result },
      },
    });
  }

  async findLiveGames(): Promise<IGame[]> {
    return await this.db.find({
      collection: collections.GAME,
      query: { live: true },
    });
  }
}
