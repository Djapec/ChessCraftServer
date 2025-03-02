import {Database} from "../database/database.js";
import {PlayersInfoService} from "../services/playersInfo.service.js";
import {ChessFileRequest} from "../Interfaces/Interfaces.js";
import express from "express";

export class PlayersInfoController {
    private db: Database;
    private playerInfoService: PlayersInfoService;

    constructor(db: Database) {
        this.db = db;
        this.playerInfoService = new PlayersInfoService(db);
    }

    savePlayersInfo = async (request: ChessFileRequest, response: any)=> {
        try {
            const result = await this.playerInfoService.savePlayersInfo(request)
            sendResponse(response, result);
        } catch (error: any) {
            console.error('Error processing chess file:', error);
            response.status(500).json({
                status: 500,
                message: 'There was an issue with player info creation.',
                error: error.message,
            });
        }
    }
}

function sendResponse(response: any, result: any) {
    const error = result.code < 200 || result.code >= 300;

    response.status(result.code).json({
        msg: result.message,
        data: result.data,
        code: result.code,
        error,
    });
}
