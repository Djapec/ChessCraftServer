import { DelayedResult, Pairing, Result } from '../Interfaces/Interfaces.js';
import { decodeTournamentId, encryptData } from '../utils/crypto.js';
import { Database } from '../database/database.js';
import { GameRepository } from '../repositories/game.repository.js';
import {
  filterChessPairings,
  mapChessPairingsToDelayedResults,
  resetAllPairingsResults,
  updateChessPairingsWithResults,
} from '../utils/util.js';
import { fetchApiData } from '../utils/api-client.js';
import { constructApiUrl } from '../utils/urls.js';
import { GameWatcherService, WatchedGame } from './watchers/game.watcher.service.js';
import { WatchedGameRepository } from '../repositories/watchedgame.repository.js';
import { GamePollingService } from './pullers/game.pulling.service.js';

export class GameService {
  private readonly watchedGameRepository: WatchedGameRepository;
  private readonly gamePollingService: GamePollingService;
  private gameRepository: GameRepository;
  readonly DELAY_MS = 15 * 60 * 1000;

  constructor(db: Database) {
    this.gameRepository = new GameRepository(db);
    this.watchedGameRepository = new WatchedGameRepository(db);
    this.gamePollingService = new GamePollingService(db);
  }

  async processDelayedResults(pairings: Pairing[]): Promise<Pairing[]> {
    const fifteenMinutesAgo = Date.now() - this.DELAY_MS;

    const existingDelayedResults = await this.gameRepository.getDelayedResults(fifteenMinutesAgo);
    if (existingDelayedResults.length === 0) {
      await this.insertDelayedResults(pairings, []);
      return resetAllPairingsResults(pairings);
    }

    const excludedPairings = existingDelayedResults.map((result) => result.whitePlayerId);
    const insertedDelayedResults = await this.insertDelayedResults(pairings, excludedPairings);
    return updateChessPairingsWithResults(pairings, insertedDelayedResults);
  }

  async insertDelayedResults(
    pairings: Pairing[],
    excludeFideIds: number[],
  ): Promise<DelayedResult[]> {
    const paringsForInsert = filterChessPairings(pairings, excludeFideIds);
    const delayedResults = mapChessPairingsToDelayedResults(paringsForInsert);
    await this.gameRepository.bulkInsertDelayedResults(delayedResults);
    return delayedResults;
  }

  async fetchGame(encodedId: string, round: string, game: string): Promise<Result> {
    const tournamentId = decodeTournamentId(encodedId);
    const url = constructApiUrl(tournamentId, round, game);

    if (!url) {
      return {
        error: true,
        code: 400,
        message: 'Invalid URL parameters.',
      };
    }

    const responseData = await fetchApiData(url);
    if (!responseData.moves) {
      throw new Error(`Moves missing from game source API`);
    }

    const watchedGame: WatchedGame = {
      id: tournamentId,
      round: round!,
      game: game!,
    };

    const gameKey: string = this.gamePollingService.buildKey(watchedGame);

    const isGameInWatchedGameList: boolean =
      GameWatcherService.getInstance().isGameInWatchedGameList(watchedGame);
    if (isGameInWatchedGameList) {
      const existingGame = await this.watchedGameRepository.findBySerialNr(responseData.serialNr);
      return {
        error: false,
        code: 200,
        message: 'Data fetched successfully.',
        data: existingGame,
        //data: encryptData(existingGame)
      };
    } else {
      await this.gamePollingService.processResponse(gameKey, responseData, false);
      const existingGame = await this.watchedGameRepository.findBySerialNr(responseData.serialNr);
      return {
        error: false,
        code: 200,
        message: 'Data fetched successfully.',
        data: existingGame,
        //data: encryptData(existingGame)
      };
    }
  }
}
