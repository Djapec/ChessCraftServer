import CryptoJS from 'crypto-js';

const secretKey: string = 'your-secret-key'; // Move to environment variable for security

/**
 * Decodes the tournament ID from the provided encoded ID.
 */
function decodeTournamentId(encodedId: string): string {
    const cleanedId: string = cleanString(encodedId);
    const tournamentId: string = reverseString(cleanedId);

    if (!tournamentId) {
        throw new Error('Failed to decode the tournament ID');
    }

    return tournamentId;
}

/**
 * Encrypts data using AES.
 */
function encryptData(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

/**
 * Cleans a string by removing the last character of each segment.
 */
function cleanString(input: string): string {
    return input.split('-').map(segment => segment.slice(0, -1)).join('-');
}

/**
 * Reverses a string.
 */
function reverseString(str: string): string {
    return str.split('').reverse().join('');
}

export {
    decodeTournamentId,
    encryptData,
};