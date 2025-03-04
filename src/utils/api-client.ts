import axios, { AxiosResponse, AxiosError } from 'axios';

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

export { fetchApiData, sendResponse };
