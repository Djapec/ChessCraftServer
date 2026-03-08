import { Result } from '../Interfaces/Interfaces.js';
import { fetchApiData } from '../utils/api-client.js';
import { decodeTournamentId, encryptData } from '../utils/crypto.js';
import { constructApiUrl } from '../utils/urls.js';
import { Database } from '../database/database.js';
import { TournamentRepository } from '../repositories/tournament.repository.js';
import { enrichPairings } from '../utils/enrichPairings.js';
import { GameService } from './game.service.js';
import { isDateToday, isRoundOver } from '../utils/util.js';
import { RoundWatcherService, WatchedRound } from './watchers/round.watcher.service.js';
import { RoundRepository } from '../repositories/round.repository.js';
import { RoundPollingService } from './pullers/round.polling.service.js';

export class RoundService {
  private readonly tournamentRepository: TournamentRepository;
  private readonly gameService: GameService;
  private readonly roundPollingService: RoundPollingService;
  private readonly roundRepository: RoundRepository;

  constructor(db: Database) {
    this.tournamentRepository = new TournamentRepository(db);
    this.gameService = new GameService(db);
    this.roundRepository = new RoundRepository(db);
    this.roundPollingService = new RoundPollingService(db);
  }

  async fetchRound(encodedId: string, round: string): Promise<Result> {
    if (!encodedId) {
      return {
        error: true,
        code: 400,
        message: 'Encoded ID is required and must be a string.',
      };
    }

    const tournamentId = decodeTournamentId(encodedId);
    const url = constructApiUrl(tournamentId, round);

    if (!url) {
      return {
        error: true,
        code: 400,
        message: 'Invalid URL parameters.',
      };
    }

    const responseData = await fetchApiData(url);
    if (!responseData.pairings) {
      throw new Error(`Pairings missing from round source API`);
    }

    const tournament =
      await this.tournamentRepository.findTournamentByLiveChessCloudId(tournamentId);

    if (isDateToday(responseData.date)) {
      if (!isRoundOver(responseData.pairings)) {
        responseData.pairings = await this.gameService.processDelayedResults(responseData.pairings);
      }
    }

    if (tournament?.players) {
      responseData.pairings = enrichPairings(responseData.pairings, tournament.players);
    }

    const watchedRound: WatchedRound = {
      id: tournamentId,
      round: round!,
    };

    const isRoundInWatchedRoundList: boolean =
      RoundWatcherService.getInstance().isRoundInWatchedRoundList(watchedRound);
    if (isRoundInWatchedRoundList) {
      const existingRound = await this.roundRepository.findByTournamentAndRound(
        watchedRound.id,
        watchedRound.round,
      );
      return {
        error: false,
        code: 200,
        message: 'Data fetched successfully.',
        data: existingRound,
        //data: encryptData(existingGame)
      };
    } else {
      const roundKey = `${watchedRound.id}-${watchedRound.round}`;
      await this.roundPollingService.initializeRound(roundKey, watchedRound, responseData);
      const existingRound = await this.roundRepository.findByTournamentAndRound(
        watchedRound.id,
        watchedRound.round,
      );
      return {
        error: false,
        code: 200,
        message: 'Data fetched successfully.',
        data: existingRound,
        //data: encryptData(existingGame)
      };
    }
  }
}
