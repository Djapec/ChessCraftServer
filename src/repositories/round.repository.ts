import { Database } from '../database/database.js';
import { IRound } from '../schemas/schemas.interfaces.js';
import { collections } from '../utils/constants.js';

export class RoundRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findByTournamentAndRound(tournamentId: string, round: string): Promise<IRound | null> {
    return await this.db.findOne({
      collection: collections.ROUND,
      query: { tournamentId, round },
    });
  }

  async createRound(document: Partial<IRound>): Promise<IRound> {
    return await this.db.insertOne({
      collection: collections.ROUND,
      document,
    });
  }

  async updatePairingResult(
    tournamentId: string,
    round: string,
    gameKey: string,
    result: string,
  ): Promise<void> {
    await this.db.updateOne({
      collection: collections.ROUND,
      query: { tournamentId, round },
      update: {
        $set: {
          'pairings.$[pairing].result': result,
          'pairings.$[pairing].live': false,
        },
      },
      arrayFilters: [{ 'pairing.gameKey': gameKey }],
    });
  }

  async setPairingLive(
    tournamentId: string,
    round: number,
    gameKey: string,
    live: boolean,
  ): Promise<void> {
    await this.db.updateOne({
      collection: collections.ROUND,
      query: { tournamentId, round },
      update: {
        $set: {
          'pairings.$[pairing].live': live,
        },
      },
      arrayFilters: [{ 'pairing.gameKey': gameKey }],
    });
  }

  async findByGameKey(gameKey: string): Promise<IRound | null> {
    return await this.db.findOne({
      collection: collections.ROUND,
      query: { 'pairings.gameKey': gameKey },
    });
  }

  async findLiveRounds(tournamentId: string): Promise<IRound[]> {
    return await this.db.find({
      collection: collections.ROUND,
      query: { tournamentId, 'pairings.live': true },
    });
  }
}
