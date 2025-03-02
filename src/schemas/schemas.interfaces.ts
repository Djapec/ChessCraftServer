import { Document } from 'mongoose';

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

export { IPlayer, ITournament };
