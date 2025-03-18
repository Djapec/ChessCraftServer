import {Database} from "../database/database.js";
import {Tournament} from "../Interfaces/Interfaces.js";


export class TournamentRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async saveTournament(tournament: Tournament){
        return await this.db.insertOne({
            collection: 'Tournament',
            document: tournament,
        });
    }

    async findTournamentByLiveChessCloudId(lccId: string): Promise<Tournament> {
        return await this.db.findOne({
            collection: 'Tournament',
            query: { liveChessCloudId: lccId }
        });
    }

    async findTournamentByChessResultId(chessResultId: string): Promise<Tournament> {
        return await this.db.findOne({
            collection: 'Tournament',
            query: { chessResultId: chessResultId }
        });
    }

    async findTournamentByName(name: string): Promise<Tournament> {
        return await this.db.find({
            collection: 'Tournament',
            query: { name: name }
        });
    }
}