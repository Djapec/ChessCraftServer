import mongoose, { Document } from 'mongoose';

export interface IBoardMove {
    notation: string;
    clock: number;
    increment: number;
    moveNumber: number;
    color: 'white' | 'black';
    receivedAt: Date;
    playedAt: Date | null;
}

export interface IGame extends mongoose.Document {
    gameKey: string;
    serialNr: string;
    live: boolean;
    result: '*' | 'BLACKWIN' | 'WHITEWIN' | 'DRAW';
    firstMove: Date;
    delayMs: number;
    moveCount: number;
    moves: IBoardMove[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IPairingPlayer {
    fname: string;
    mname: string | null;
    lname: string;
    title: string | null;
    federation: string | null;
    gender: string | null;
    fideid: number;
}

export interface IPairing {
    gameNumber: number;
    gameKey: string;
    white: IPairingPlayer;
    black: IPairingPlayer;
    result: string;
    live: boolean;
}

export interface IRound extends mongoose.Document {
    tournamentId: string;
    round: string;
    date: Date;
    pairings: IPairing[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface for a Player inside the TournamentPlayers collection.
 */
interface IPlayer {
    name: string;
    title?: string; // Titles like "GM", "IM", etc.
    fideId?: number;
    federation?: string; // Country code like "ROU"
    rating?: number;
}

/**
 * Interface for the Tournament schema.
 */
interface ITournament extends Document {
    tournamentId: string;
    name: string;
    players: IPlayer[];
}

/**
 * Interface for the Tournament schema.
 */
interface IDelayedResult extends Document {
    whitePlayerId: number;
    result: string;
    gameCompletedAt: number;
    gameCompletedAtFormatted: Date;
}

export { IPlayer, ITournament, IDelayedResult };
