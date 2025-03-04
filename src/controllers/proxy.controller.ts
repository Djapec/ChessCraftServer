import {Request, Response} from 'express';
import {sendResponse} from '../utils/api-client.js';
import {ProxyService} from "../services/proxy.service.js";
import {Database} from "../database/database.js";

interface ProxyQueryParams {
    id?: string;
    round?: string;
    game?: string;
}

export class ProxyController {
    private db: Database;
    private proxyService: ProxyService;

    constructor(db: Database) {
        this.db = db;
        this.proxyService = new ProxyService(db);
    }

    proxyHandler = async (
        request: Request<{}, {}, {}, ProxyQueryParams>,
        response: Response
    ) => {
        try {
            const { id: encodedId, round, game } = request.query;
            const result = await this.proxyService.proxyHandler(encodedId, round, game);
            sendResponse(response, result);
        } catch (error: any) {
            console.error('Error in proxy handler:', error.message);
            response.status(500).json({
                status: 500,
                message: 'There was an issue with proxy handler.',
                error: error.message
            });
        }
    };
}
