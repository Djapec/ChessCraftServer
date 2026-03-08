import { Request, Response } from 'express';
import { sendResponse } from '../utils/api-client.js';
import { GameService } from '../services/game.service.js';
import { ProxyQueryParams } from '../Interfaces/Interfaces.js';
import { Database } from '../database/database.js';

export class GameController {
  private gameService: GameService;

  constructor(db: Database) {
    this.gameService = new GameService(db);
  }

  fetchGame = async (
    request: Request<object, object, object, ProxyQueryParams>,
    response: Response,
  ) => {
    try {
      const { id: encodedId, round, game } = request.query;
      // todo: add api validator
      if (encodedId && round && game) {
        const result = await this.gameService.fetchGame(encodedId, round, game);
        sendResponse(response, result);
      } else {
        return response.status(400).json({
          status: 400,
          message: 'Missing required parameters',
        });
      }
      // todo: add custom error type
    } catch (error: any) {
      console.error('Error in game fetching:', error.message);
      response.status(500).json({
        status: 500,
        message: 'There was an issue with fetching game.',
        error: error.message,
      });
    }
  };
}
