import {Result} from "../Interfaces/Interfaces.js";
import {decodeTournamentId, encryptData} from "../utils/crypto.js";
import {getGameUrl, getRoundUrl, getTourneyUrl} from "../utils/urls.js";
import {enrichPairings} from "../utils/enrichPairings.js";
import {Database} from "../database/database.js";
import {TournamentRepository} from "../repositories/tournament.repository.js";

export class GameService {
    private db: Database;
    private tournamentRepository: TournamentRepository

    constructor(db: Database) {
        this.db = db;
        this.tournamentRepository = new TournamentRepository(db)
    }
     parseGameInput = (gameInput: any) => {
        if (gameInput.includes(',')) {
            return gameInput.split(',').map((num: string) => parseInt(num.trim(), 10));
        } else {
            return [parseInt(gameInput.trim(), 10)];
        }
    };

     async fetchGame(encodedId: string, round: string, game: string): Promise<Result> {
         const tournamentId = decodeTournamentId(encodedId);
         try {

             const desiredPairs = this.parseGameInput(game)

             const tournament = await fetchTournament(tournamentId);
             const roundNumber = validateRoundNumber(round);
             const pairsData = await fetchPairsData(tournamentId, [roundNumber]);

             const tournamentInfo = await this.tournamentRepository.findTournamentByLiveChessCloudId(tournamentId)
             pairsData[0].pairings = enrichPairings(pairsData[0].pairings, tournamentInfo.players)

             const extendedGamesUrls = getGamesUrls(tournamentId, [round], pairsData, desiredPairs);

             const gamesData = await getGamesInfo(extendedGamesUrls);
             const lookupMap = createGameLookupMap(extendedGamesUrls);

             const result = {
                 tournament,
                 pairsData,
                 gamesData,
                 extendedGamesUrls,
                 lookupMap
             }

             const encryptedData = encryptData(result);

             return {
                 code: 200,
                 message: 'Data fetched successfully.',
                 data: encryptedData
             };

         } catch (error: any) {
             return {
                 code: 500,
                 message: `There was an issue with fetching game. ${error.message}`,
             }
         }
    }
}


function validateRoundNumber(stringNumber: string) {
    const number = Number(stringNumber);
    if (!Number.isInteger(number) || number <= 0) {
        console.error('Invalid round number: must be a positive integer.');
    }
    return number;
}

async function fetchTournament(id: any) {
    try {
        const url = getTourneyUrl(id)
        const tournamentRes = await fetch(url);

        return await tournamentRes.json();
    } catch (error) {
        console.error('Error fetching tournament data:', error);
    }
}

async function fetchPairsData(id: any, rounds: any) {
    try {
        const fetchedRounds = rounds.map(async (round: any) => {
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

function createGameLookupMap(games: any) {
    return games.reduce((acc: { [x: string]: { round: any; game: any; }; }, {url, round, game}: any) => {
        acc[url] = { round, game };
        return acc;
    }, {});
}
