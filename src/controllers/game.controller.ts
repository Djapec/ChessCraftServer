import {Request, Response} from "express";
import {sendResponse} from "../utils/api-client.js";
import {GameService} from "../services/game.service.js";
import {ProxyQueryParams} from "../Interfaces/Interfaces.js";
import {Database} from "../database/database.js";
import {ResourceService} from "../services/resource.service.js";

export class GameController {
    private db: Database;
    private gameService: GameService
    private resourceService: ResourceService;

    constructor(db: Database, resourceService: ResourceService) {
        this.db = db;
        this.gameService = new GameService(db);
        this.resourceService = resourceService;
    }

    fetchGame = async (request: Request<{}, {}, {}, ProxyQueryParams>, response: Response
    ) => {
        try {
            const { id: encodedId, round, game } = request.query;
            if (!encodedId || !round || !game) {
                return response.status(400).json({
                    status: 400,
                    message: 'Missing required parameters'
                });
            }


            const resourceKey = `game:${encodedId}:${round}:${game}`;
            const result = await this.resourceService.getResource(resourceKey, async () => {
                return await this.gameService.fetchGame(encodedId!, round!, game!);
            });
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