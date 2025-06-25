import {Request, Response} from 'express';
import {sendResponse} from '../utils/api-client.js';
import {ProxyService} from "../services/proxy.service.js";
import {Database} from "../database/database.js";
import {ProxyQueryParams} from "../Interfaces/Interfaces.js";
import {ResourceService} from "../services/resource.service.js";

export class ProxyController {
    private db: Database;
    private proxyService: ProxyService;
    private resourceService: ResourceService;

    constructor(db: Database, resourceService: ResourceService) {
        this.db = db;
        this.proxyService = new ProxyService(db);
        this.resourceService = resourceService;
    }

    proxyHandler = async (
        request: Request<{}, {}, {}, ProxyQueryParams>,
        response: Response
    ) => {
        try {
            const { id: encodedId, round, game } = request.query;
            const resourceKey = `proxy:${encodedId}:${round}:${game}`;
            const result = await this.resourceService.getResource(resourceKey, async () => {
                return await this.proxyService.proxyHandler(encodedId, round, game);
            });
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
