import {Result} from "../Interfaces/Interfaces.js";
import {fetchApiData} from "../utils/api-client.js";
import {decodeTournamentId, encryptData} from "../utils/crypto.js";
import {constructApiUrl} from "../utils/urls.js";

export class ProxyService {
    async proxyHandler(encodedId?: string, round?: string, game?: string): Promise<Result> {
        if (!encodedId) {
            return {
                code: 400,
                message: 'Encoded ID is required and must be a string.'
            };
        }

        const tournamentId = decodeTournamentId(encodedId);
        const url = constructApiUrl(tournamentId, round, game);
        
        if (!url) {
            return {
                code: 400,
                message: 'Invalid URL parameters.'
            };
        }

        const responseData = await fetchApiData(url);
        const encryptedData = encryptData(responseData);

        return {
            code: 200,
            message: 'Data fetched successfully.',
            data: encryptedData
        };
    }
}
