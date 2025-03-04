import {ChessPlayer, EnrichedPairing, EnrichedPlayer, Pairing, PairingPlayer} from "../Interfaces/Interfaces.js";

/**
 * Enrich the pairings data with additional player information
 * @param pairings Original pairings array
 * @param players Player database with titles, federations, and ratings
 * @returns Enriched pairings with complete player information
 */
export function enrichPairings(pairings: Pairing[], players: ChessPlayer[]): EnrichedPairing[] {
    const playerMap = new Map<number, ChessPlayer>();

    players.forEach(player => {
        if (player.fideId !== null) {
            playerMap.set(player.fideId, player);
        }
    });

    return pairings.map(pairing => ({
        white: enrichPlayer(pairing.white, playerMap),
        black: enrichPlayer(pairing.black, playerMap),
        result: pairing.result,
        live: pairing.live
    }));
}

/**
 * Enrich an individual player with data from the player database
 * @param player Original player data from pairings
 * @param playerMap Lookup map of player database
 * @returns Enriched player with title, federation, and rating
 */
function enrichPlayer(player: PairingPlayer, playerMap: Map<number, ChessPlayer>): EnrichedPlayer {
    const dbPlayer = playerMap.get(player.fideid);

    if (!dbPlayer) {
        console.warn(`Player with FIDE ID ${player.fideid} not found in database`);
        return {
            ...player,
            title: 'Unknown',
            federation: 'Unknown',
            rating: 0
        };
    }

    return {
        ...player,
        title: dbPlayer.title,
        federation: dbPlayer.federation,
        rating: dbPlayer.rating
    };
}
