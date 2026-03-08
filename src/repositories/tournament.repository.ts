import { Database } from '../database/database.js';
import { Tournament } from '../Interfaces/Interfaces.js';
import { collections } from '../utils/constants.js';

export class TournamentRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async saveTournament(tournament: Tournament) {
    return await this.db.insertOne({
      collection: collections.TOURNAMENT,
      document: tournament,
    });
  }

  async findTournamentByLiveChessCloudId(lccId: string): Promise<Tournament> {
    return await this.db.findOne({
      collection: collections.TOURNAMENT,
      query: { liveChessCloudId: lccId },
    });
  }

  async findTournamentByChessResultId(chessResultId: string): Promise<Tournament> {
    return await this.db.findOne({
      collection: collections.TOURNAMENT,
      query: { chessResultId: chessResultId },
    });
  }

  async findTournamentByName(name: string): Promise<Tournament> {
    return await this.db.find({
      collection: collections.TOURNAMENT,
      query: { name: name },
    });
  }
}
