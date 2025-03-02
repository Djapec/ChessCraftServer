import express from "express";

export interface Result {
    code: number;
    message: string;
    data?: any;
}

export interface ChessFileRequest extends express.Request {
    file: Express.Multer.File;
    body: {
        liveChessCloudId?: string;
        chessResultId?: string;
        name?: string;
        [key: string]: any;
    };
}