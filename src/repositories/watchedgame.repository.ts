import { Database } from '../database/database.js';
import { IGame, IBoardMove } from '../schemas/schemas.interfaces.js';

export class WatchedGameRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findBySerialNr(serialNr: string): Promise<IGame | null> {
    return await this.db.findOne({
      collection: 'Game',
      query: { serialNr },
    });
  }

  async createGame(document: Partial<IGame>): Promise<IGame> {
    return await this.db.insertOne({
      collection: 'Game',
      document,
    });
  }

  async appendMoves(serialNr: string, moves: IBoardMove[]): Promise<void> {
    await this.db.updateOne({
      collection: 'Game',
      query: { serialNr },
      update: {
        $push: { moves: { $each: moves } },
        $inc: { moveCount: moves.length },
      },
    });
  }

  async closeGame(serialNr: string, result: string): Promise<void> {
    await this.db.updateOne({
      collection: 'Game',
      query: { serialNr },
      update: {
        $set: { live: false, result },
      },
    });
  }

  async findLiveGames(): Promise<IGame[]> {
    return await this.db.find({
      collection: 'Game',
      query: { live: true },
    });
  }
}
