import {Pairing, Result} from "../Interfaces/Interfaces.js";
import {decodeTournamentId, encryptData} from "../utils/crypto.js";
import {enrichPairings} from "../utils/enrichPairings.js";
import {Database} from "../database/database.js";
import {TournamentRepository} from "../repositories/tournament.repository.js";
import {GameRepository} from "../repositories/game.repository.js";
import {
    createGameLookupMap,
    filterChessPairings, isDateToday, isRoundOver,
    mapChessPairingsToDelayedResults,
    resetAllPairingsResults, updateChessPairingsWithResults,
    validateRoundNumber
} from "../utils/util.js";
import {fetchPairsData, fetchTournament, getGamesInfo, getGamesUrls} from "../utils/api-client.js";

export class GameService {
    private db: Database;
    private tournamentRepository: TournamentRepository
    private gameRepository: GameRepository
    readonly DELAY_MS = 15 * 60 * 1000;

    constructor(db: Database) {
        this.db = db;
        this.tournamentRepository = new TournamentRepository(db)
        this.gameRepository = new GameRepository(db)
    }
     parseGameInput = (gameInput: any) => {
        if (gameInput.includes(',')) {
            return gameInput.split(',').map((num: string) => parseInt(num.trim(), 10));
        } else {
            return [parseInt(gameInput.trim(), 10)];
        }
    };

    async processDelayedResults(pairings: Pairing[]): Promise<Pairing[]> {
        const fifteenMinutesAgo = Date.now() - this.DELAY_MS;
        const existingDelayedResults = await this.gameRepository.getDelayedResults(fifteenMinutesAgo);
        if (existingDelayedResults.length === 0) {
            return resetAllPairingsResults(pairings)
        }

        const excludedPairings = existingDelayedResults.map(result => result.whitePlayerId)
        const paringsForInsert = filterChessPairings(pairings, excludedPairings)
        const delayedResults = mapChessPairingsToDelayedResults(paringsForInsert)

        const insertedDelayedResults = await this.gameRepository.bulkInsertDelayedResults(delayedResults)

        return updateChessPairingsWithResults(pairings, insertedDelayedResults)
    }

     async fetchGame(encodedId: string, round: string, game: string): Promise<Result> {
         const tournamentId = decodeTournamentId(encodedId);
         try {

             const desiredPairs = this.parseGameInput(game)

             const tournament = await fetchTournament(tournamentId);
             const roundNumber = validateRoundNumber(round);
             const pairsData = await fetchPairsData(tournamentId, [roundNumber]);

             const tournamentInfo = await this.tournamentRepository.findTournamentByLiveChessCloudId(tournamentId)
             if (tournamentInfo?.players) {
                 pairsData[0].pairings = enrichPairings(pairsData[0].pairings, tournamentInfo.players)
                 if (isDateToday(pairsData[0].date)) {
                     if (!isRoundOver(pairsData[0].pairings)) {
                         pairsData[0].pairings = await this.processDelayedResults(pairsData[0].pairings)
                     }
                 }
             }

             const extendedGamesUrls = getGamesUrls(tournamentId, [round], pairsData, desiredPairs);

             const gamesData = await getGamesInfo(extendedGamesUrls);
             const lookupMap = createGameLookupMap(extendedGamesUrls);

             const result = {
                 tournament,
                 pairsData,
                 gamesData,
                 extendedGamesUrls,
                 lookupMap
             }

             const encryptedData = encryptData(result);

             return {
                 code: 200,
                 message: 'Data fetched successfully.',
                 data: encryptedData
             };

         } catch (error: any) {
             return {
                 code: 500,
                 message: `There was an issue with fetching game. ${error.message}`,
             }
         }
    }
}
