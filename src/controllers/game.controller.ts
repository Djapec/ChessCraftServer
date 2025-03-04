import {Request, Response} from "express";
import {sendResponse} from "../utils/api-client.js";
import {GameService} from "../services/game.service.js";
import {ProxyQueryParams} from "../Interfaces/Interfaces.js";
import {Database} from "../database/database.js";

export class GameController {
    private db: Database;
    private gameService: GameService

    constructor(db: Database) {
        this.db = db;
        this.gameService = new GameService(db);
    }

    fetchGame = async (request: Request<{}, {}, {}, ProxyQueryParams>, response: Response
    ) => {
        try {
            const { id: encodedId, round, game } = request.query;
            //todo: handle null check
            const result = await this.gameService.fetchGame(encodedId!, round!, game!);
            sendResponse(response, result);
        } catch (error: any) {
            console.error('Error in game fetching:', error.message);
            response.status(500).json({
                status: 500,
                message: 'There was an issue with fetching game.',
                error: error.message
            });
        }
    };
}