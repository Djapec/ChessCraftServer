function getTourneyUrl(id: string): string {
    return `https://1.pool.livechesscloud.com/get/${id}/tournament.json`;
}

function getRoundUrl(id: string, round: number): string {
    return `https://1.pool.livechesscloud.com/get/${id}/round-${round}/index.json`;
}

function getGameUrl(id: string, round: number, game: number): string {
    return `https://1.pool.livechesscloud.com/get/${id}/round-${round}/game-${game}.json?poll`;
}

/**
 * Constructs the API URL based on the parameters.
 */
function constructApiUrl(tournamentId: string, round?: number, game?: number): string {
    if (round !== undefined && game !== undefined) {
        return getGameUrl(tournamentId, round, game);
    } else if (round !== undefined) {
        return getRoundUrl(tournamentId, round);
    } else {
        return getTourneyUrl(tournamentId);
    }
}

export {
    getTourneyUrl,
    getRoundUrl,
    getGameUrl,
    constructApiUrl
};