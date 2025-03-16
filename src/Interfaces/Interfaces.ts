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

export interface PairingPlayer {
    fname: string;
    mname: string | null;
    lname: string;
    title: null;
    federation: null;
    gender: null;
    fideid: number;
}

export interface Pairing {
    white: PairingPlayer;
    black: PairingPlayer;
    result: string;
    live: boolean;
}

export interface EnrichedPlayer extends Omit<PairingPlayer, 'title' | 'federation'> {
    title: string | null;
    federation: string | null;
    rating: number | null;
}

export interface EnrichedPairing {
    white: EnrichedPlayer;
    black: EnrichedPlayer;
    result: string;
    live: boolean;
}

export interface ChessPlayer {
    name: string;
    title: string | null;
    fideId: number | null;
    federation: string | null;
    rating: number | null;
}

export interface Tournament {
    liveChessCloudId: string,
    chessResultId: string,
    name: string,
    players: ChessPlayer[],
}

export interface DelayedResult {
    whitePlayerId: number,
    result: string,
    gameCompletedAt: number,
}

export interface ProxyQueryParams {
    id?: string;
    round?: string;
    game?: string;
}
