import { Database } from '../database/database.js';
import { TournamentService } from '../services/tournament.service.js';
import { ChessFileRequest } from '../Interfaces/Interfaces.js';
import { fetchApiData, sendResponse } from '../utils/api-client.js';
import { decodeTournamentId } from '../utils/crypto.js';
import { constructApiUrl } from '../utils/urls.js';

export class TournamentController {
  private tournamentService: TournamentService;

  constructor(db: Database) {
    this.tournamentService = new TournamentService(db);
  }

  async fetchTournament(request: any, response: any): Promise<void> {
    try {
      const { id: encodedId } = request.query;
      if (!encodedId) {
        sendResponse(response, {
          error: true,
          code: 400,
          message: 'Missing required tournamentId parameter',
        });
      }
      const tournamentId: string = decodeTournamentId(encodedId);
      const url: string = constructApiUrl(tournamentId);

      if (!url) {
        sendResponse(response, {
          error: true,
          code: 400,
          message: 'Invalid URL parameters.',
        });
      }

      const responseData = await fetchApiData(url);
      sendResponse(response, {
        error: false,
        code: 200,
        message: 'Data fetched successfully.',
        data: responseData,
        //data: encryptData(existingGame)
      });
    } catch (error: any) {
      console.error('Error processing chess file:', error);
      response.status(500).json({
        status: 500,
        message: 'There was an issue with tournament creation.',
        error: error.message,
      });
    }
  }

  saveTournament = async (request: ChessFileRequest, response: any): Promise<void> => {
    try {
      const result = await this.tournamentService.saveTournament(request);
      sendResponse(response, result);
    } catch (error: any) {
      console.error('Error processing chess file:', error);
      response.status(500).json({
        status: 500,
        message: 'There was an issue with tournament creation.',
        error: error.message,
      });
    }
  };
}
