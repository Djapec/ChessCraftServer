import {Result} from "../Interfaces/Interfaces.js";
import {fetchApiData} from "../utils/api-client.js";
import {decodeTournamentId, encryptData} from "../utils/crypto.js";
import {constructApiUrl} from "../utils/urls.js";
import {Database} from "../database/database.js";
import {TournamentRepository} from "../repositories/tournament.repository.js";
import {enrichPairings} from "../utils/enrichPairings.js";
import {GameService} from "./game.service.js";

export class ProxyService {
    private db: Database;
    private tournamentRepository: TournamentRepository
    private gameService: GameService;
    private DELAY_MS = 15 * 60 * 1000;

    constructor(db: Database) {
        this.db = db;
        this.tournamentRepository = new TournamentRepository(db)
        this.gameService = new GameService(db);
    }

    async proxyHandler(encodedId?: string, round?: string, game?: string): Promise<Result> {
        if (!encodedId) {
            return {
                code: 400,
                message: 'Encoded ID is required and must be a string.'
            };
        }

        const tournamentId = decodeTournamentId(encodedId);
        const url = constructApiUrl(tournamentId, round, game);
        
        if (!url) {
            return {
                code: 400,
                message: 'Invalid URL parameters.'
            };
        }

        const responseData = await fetchApiData(url);
        if (responseData.pairings) {
            const tournament = await this.tournamentRepository.findTournamentByLiveChessCloudId(tournamentId);

            // if tournament is active/live (check by date); else skip
            // if at least one game is live; else skip

            // filter through list and see if there are results that are not in progress (* && day is not over)
            // await this.gameService.cleanupExpiredDelays(Date.now()); // maaaaaaaaybe not clear on the first go
            responseData.pairings = await this.gameService.saveDelayedResults(responseData.pairings);
            // responseData.pairings = this.gameService.updateMatchingItems(delayedResultWhitePlayerIds, responseData.pairings);
            // DONE bulk save pairings per game, not as a list, that have result change
            // DONE - white player id
            // DONE - result
            // DONE - timestamp
            // DONE - populate pairings with the old result (*), since we don't want new result to be propagated to the users
            //
            // query from DB those pairings that have new result timestamp older than 15mins
            // if they are older than 15mins, send the new result in the pairing and delete the db entry for that game
            //
            // drop db collection at the end of the day

            if (tournament?.players) {
                responseData.pairings = enrichPairings(responseData.pairings, tournament.players)
            }
        }
        const encryptedData = encryptData(responseData);

        return {
            code: 200,
            message: 'Data fetched successfully.',
            data: encryptedData
        };
    }
}
