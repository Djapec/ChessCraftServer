import {Result} from "../Interfaces/Interfaces.js";
import {fetchApiData} from "../utils/api-client.js";
import {decodeTournamentId, encryptData} from "../utils/crypto.js";
import {constructApiUrl} from "../utils/urls.js";
import {Database} from "../database/database.js";
import {TournamentRepository} from "../repositories/tournament.repository.js";
import {enrichPairings} from "../utils/enrichPairings.js";
import {GameService} from "./game.service.js";
import {isDateToday, isRoundOver} from "../utils/util.js";
import {PollingService, WatchedGame} from "./pulling.service.js";
import {WatchedGameRepository} from "../repositories/watchedgame.repository.js";
import {GamePollingService} from "./game.pulling.service.js";
import {RoundWatcherService, WatchedRound} from "./round.watcher.service.js";
import {RoundRepository} from "../repositories/round.repository.js";
import {RoundPollingService} from "./round.polling.service.js";

export class ProxyService {
    private db: Database;
    private readonly tournamentRepository: TournamentRepository
    private readonly gameService: GameService;
    private readonly watchedGameRepository: WatchedGameRepository;
    private readonly gamePollingService: GamePollingService;
    private readonly roundPollingService: RoundPollingService;
    private readonly roundRepository: RoundRepository;

    constructor(db: Database) {
        this.db = db;
        this.tournamentRepository = new TournamentRepository(db);
        this.gameService = new GameService(db);
        this.roundRepository = new RoundRepository(db);
        this.watchedGameRepository = new WatchedGameRepository(db);
        this.gamePollingService = new GamePollingService(db);
        this.roundPollingService = new RoundPollingService(db);
    }

    async proxyHandler(encodedId?: string, round?: string, game?: string): Promise<Result> {
        if (!encodedId) {
            return {
                error: true,
                code: 400,
                message: 'Encoded ID is required and must be a string.'
            };
        }

        const tournamentId = decodeTournamentId(encodedId);
        const url = constructApiUrl(tournamentId, round, game);
        
        if (!url) {
            return {
                error: true,
                code: 400,
                message: 'Invalid URL parameters.'
            };
        }

        const responseData = await fetchApiData(url);
        if (responseData.pairings) {
            const tournament = await this.tournamentRepository.findTournamentByLiveChessCloudId(tournamentId);

            if (isDateToday(responseData.date)) {
                if (!isRoundOver(responseData.pairings)) {
                    responseData.pairings = await this.gameService.processDelayedResults(responseData.pairings)
                }
            }

            if (tournament?.players) {
                responseData.pairings = enrichPairings(responseData.pairings, tournament.players)
            }

            const watchedRound: WatchedRound = {
                id: tournamentId,
                round: round!,
            }

            const isRoundInWatchedRoundList: boolean = RoundWatcherService.getInstance().isRoundInWatchedRoundList(watchedRound)
            if (isRoundInWatchedRoundList) {
                const existingRound = await this.roundRepository.findByTournamentAndRound(watchedRound.id, watchedRound.round)
                return {
                    error: false,
                    code: 200,
                    message: 'Data fetched successfully.',
                    data: existingRound
                    //data: encryptData(existingGame)
                }
            } else {
                const roundKey = `${watchedRound.id}-${watchedRound.round}`
                await this.roundPollingService.initializeRound(roundKey, watchedRound, responseData)
                const existingRound = await this.roundRepository.findByTournamentAndRound(watchedRound.id, watchedRound.round)
                return {
                    error: false,
                    code: 200,
                    message: 'Data fetched successfully.',
                    data: existingRound
                    //data: encryptData(existingGame)
                }
            }
        }

        if (responseData.moves) {
            const watchedGame: WatchedGame = {
                id: tournamentId,
                round: round!,
                game: game!,
            }

            const gameKey: string = this.gamePollingService.buildKey(watchedGame)

            const isGameInWatchedGameList: boolean = PollingService.getInstance().isGameInWatchedGameList(watchedGame)
            if (isGameInWatchedGameList) {
                const existingGame = await this.watchedGameRepository.findBySerialNr(responseData.serialNr);
                return {
                    error: false,
                    code: 200,
                    message: 'Data fetched successfully.',
                    data: existingGame
                    //data: encryptData(existingGame)
                }
            } else {
                await this.gamePollingService.processResponse(gameKey, responseData, false);
                const existingGame = await this.watchedGameRepository.findBySerialNr(responseData.serialNr);
                return {
                    error: false,
                    code: 200,
                    message: 'Data fetched successfully.',
                    data: existingGame
                    //data: encryptData(existingGame)
                }
            }
        }
        //const encryptedData = encryptData(responseData);

        return {
            error: false,
            code: 200,
            message: 'Data fetched successfully.',
            data: responseData
        };
    }
}
