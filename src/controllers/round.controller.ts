import { Request, Response } from 'express';
import { sendResponse } from '../utils/api-client.js';
import { RoundService } from '../services/round.service.js';
import { Database } from '../database/database.js';
import { ProxyQueryParams } from '../Interfaces/Interfaces.js';

export class RoundController {
  private proxyService: RoundService;

  constructor(db: Database) {
    this.proxyService = new RoundService(db);
  }

  fetchRound = async (
    request: Request<object, object, object, ProxyQueryParams>,
    response: Response,
  ) => {
    try {
      const { id: encodedId, round } = request.query;
      // todo: add api validator
      if (encodedId && round) {
        const result = await this.proxyService.fetchRound(encodedId, round);
        sendResponse(response, result);
      } else {
        return response.status(400).json({
          status: 400,
          message: 'Missing required parameters',
        });
      }
    } catch (error: any) {
      console.error('Error in proxy handler:', error.message);
      response.status(500).json({
        status: 500,
        message: 'There was an issue with proxy handler.',
        error: error.message,
      });
    }
  };
}
