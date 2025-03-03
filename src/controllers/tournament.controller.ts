import {Database} from "../database/database.js";
import {TournamentService} from "../services/tournament.service.js";
import {ChessFileRequest} from "../Interfaces/Interfaces.js";
import {sendResponse} from "../utils/api-client.js";

export class TournamentController {
    private db: Database;
    private tournamentService: TournamentService;

    constructor(db: Database) {
        this.db = db;
        this.tournamentService = new TournamentService(db);
    }

    saveTournament = async (request: ChessFileRequest, response: any)=> {
        try {
            const result = await this.tournamentService.saveTournament(request)
            sendResponse(response, result);
        } catch (error: any) {
            console.error('Error processing chess file:', error);
            response.status(500).json({
                status: 500,
                message: 'There was an issue with tournament creation.',
                error: error.message,
            });
        }
    }
}
