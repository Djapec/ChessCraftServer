import {DelayedResult, Pairing} from "../Interfaces/Interfaces.js";

export function isDateToday(dateString: string): boolean {
    const inputDate = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate.getTime() === today.getTime();
}

export function isRoundOver(pairings: Pairing[]): boolean {
    if (!pairings || pairings.length === 0) {
        return true;
    }

    const anyLiveGames = pairings.some(pairing => pairing.live);

    return !anyLiveGames;
}

export function validateRoundNumber(stringNumber: string) {
    const number = Number(stringNumber);
    if (!Number.isInteger(number) || number <= 0) {
        console.error('Invalid round number: must be a positive integer.');
    }
    return number;
}

export function createGameLookupMap(games: any) {
    return games.reduce((acc: { [x: string]: { round: any; game: any; }; }, {url, round, game}: any) => {
        acc[url] = { round, game };
        return acc;
    }, {});
}

export function filterChessPairings(pairings: Pairing[], excludeFideIds: number[]): Pairing[] {
    const excludeIdSet = new Set(excludeFideIds);

    return pairings.filter(pairing => {
        if (pairing.result === "*") {
            return false;
        }

        return !excludeIdSet.has(pairing.white.fideid);
    });
}

export function mapChessPairingsToDelayedResults(chessPairings: Pairing[]): DelayedResult[] {
    const defaultCompletedAt: number = Date.now()
    return chessPairings.map(pairing => {
        return {
            whitePlayerId: pairing.white.fideid,
            result: pairing.result,
            gameCompletedAt: defaultCompletedAt
        };
    });
}

export function updateChessPairingsWithResults(chessPairings: Pairing[], delayedResults: DelayedResult[]): Pairing[] {
    const resultsMap = new Map<number, DelayedResult>();

    delayedResults.forEach(result => {
        resultsMap.set(result.whitePlayerId, result);
    });

    const updatedPairings = JSON.parse(JSON.stringify(chessPairings));
    updatedPairings.forEach((pairing: any) => {
        const whiteFideId = pairing.white.fideid;
        const matchingResult = resultsMap.get(whiteFideId);

        if (matchingResult) {
            pairing.result = "*";
        }
    });

    return updatedPairings;
}

export function resetAllPairingsResults(chessPairings: Pairing[]): Pairing[] {
    const resetPairings = JSON.parse(JSON.stringify(chessPairings));

    resetPairings.forEach((pairing: any) => {
        pairing.result = "*";
    });

    return resetPairings;
}