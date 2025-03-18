import axios, { AxiosResponse, AxiosError } from 'axios';
import {getGameUrl, getRoundUrl, getTourneyUrl} from "./urls.js";

/**
 * Fetches data from the specified API URL.
 * @param url The URL to fetch data from
 * @returns A promise that resolves to the parsed JSON response
 */
async function fetchApiData<T = any>(url: string): Promise<T> {
    try {
        const response: AxiosResponse<T> = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        throw new Error(`Error fetching data from ${url}, status: ${status}`);
    }
}

/**
 * Sends a response with the given result
 * @param response The Express response object
 * @param result The result to send
 */
function sendResponse(response: any, result: any): void {
    const error = result.code < 200 || result.code >= 300;

    response.status(result.code).json({
        message: result.message,
        data: result.data,
        code: result.code,
        error
    });
}

async function fetchTournament(id: string) {
    try {
        const url = getTourneyUrl(id)
        const tournamentRes = await fetch(url);

        return await tournamentRes.json();
    } catch (error) {
        console.error('Error fetching tournament data:', error);
    }
}

async function fetchPairsData(id: string, rounds: number[]) {
    try {
        const fetchedRounds = rounds.map(async (round) => {
            const url = getRoundUrl(id, round);

            const response = await fetch(url);
            return await response.json();
        });

        return await Promise.all(fetchedRounds);
    } catch (error) {
        console.error('Error fetching or decrypting rounds data:', error);
        throw error;
    }
}

async function getGamesInfo(games: any) {
    const fetchGame = async (game: any) => {
        try {
            const response = await fetch(game.url, { cache: 'no-store' });
            return await response.json();
        } catch (error: any) {
            return { error: `Failed to fetch game data: ${error.message}` };
        }
    };

    const gamesPromises = games.map(fetchGame);
    return await Promise.allSettled(gamesPromises);
}

function getGamesUrls(id: any, roundsWithGames: any, pairsData: any, desiredPairs: any = null) {
    return roundsWithGames.flatMap((round: any, roundIndex: any) => {
        const pairingsCount = pairsData[roundIndex].pairings.length;
        const pairs = Array.from({ length: pairingsCount }, (_, i) => ({
            url: getGameUrl(id, round, i + 1),
            round: round,
            game: i + 1,
        }));
        return desiredPairs ? pairs.filter(pair => desiredPairs.includes(pair.game)) : pairs;
    });
}

export { fetchApiData, sendResponse, fetchTournament, fetchPairsData, getGamesInfo, getGamesUrls};
