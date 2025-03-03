import {Database} from "../database/database.js";
import * as XLSX from "xlsx";
import {ChessFileRequest, Result} from "../Interfaces/Interfaces.js";
import {TournamentRepository} from "../repositories/tournament.repository.js";

interface ChessPlayer {
    name: string;
    title: string | null;
    fideId: number | null;
    federation: string | null;
    rating: number | null;
}

export interface Tournament {
    liveChessCloudId: string,
    chessResultId: string,
    name: string,
    players: ChessPlayer[],
}

export class TournamentService {
    private db: Database;
    private tournamentRepository: TournamentRepository

    constructor(db: Database) {
        this.db = db;
        this.tournamentRepository = new TournamentRepository(db)
    }

    async saveTournament(request: ChessFileRequest): Promise<Result> {
        if (!request.file) {
            return {
                code: 400,
                message: 'No file uploaded.'
            }
        }

        if (!request.body.chessResultId) {
            return {
                code: 400,
                message: 'Chess result ID is required.'
            }
        }

        const file = request.file;
        const chessResultId = request.body.chessResultId
        const liveChessCloudId = request.body.liveChessCloudId || null;
        const tournamentName = request.body.name || null;

        this.validateXlsxFile(file);

        const workbook = XLSX.read(file.buffer, {
            type: 'buffer',
            cellDates: true
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return {
                code: 400,
                message: 'Excel file contains no sheets.'
            }
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const players = this.extractPlayersFromSheet(sheet);

        const tournament = {
            liveChessCloudId: liveChessCloudId,
            chessResultId: chessResultId,
            name: tournamentName,
            players: players,
        } as Tournament;

        await this.tournamentRepository.saveTournament(tournament);

        return {
            code: 200,
            message: 'Tournament saved successfully.',
            data: {
                liveChessCloudId: liveChessCloudId,
                chessResultId: chessResultId,
                name: tournamentName,
                players: players,
                count: players.length,
            }
        }
    }

    private validateXlsxFile(file: Express.Multer.File): void {
        if (!file.buffer) {
            throw new Error('Missing file data');
        }

        const fileName = file.originalname.toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
        }
    }

    private extractPlayersFromSheet(sheet: XLSX.WorkSheet): ChessPlayer[] {
        // Convert sheet to JSON with array format
        const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: true,
            blankrows: false
        });

        // Find the header row containing required column names
        const headerRowIndex = rawData.findIndex(row =>
            Array.isArray(row) &&
            row.includes('Name') &&
            row.includes('FideID')
        );

        if (headerRowIndex === -1) {
            throw new Error('Could not find required headers (Name, FideID) in the file');
        }

        // Extract column indices for required fields
        const headers = rawData[headerRowIndex];
        const nameIndex = headers.indexOf('Name');
        const fideIdIndex = headers.indexOf('FideID');
        const fedIndex = headers.indexOf('FED');

        // Find which rating column is present
        const ratingHeaders = ['RtgI', 'Rtg', 'Rtgl'];
        const ratingIndex = ratingHeaders
            .map(col => headers.indexOf(col))
            .find(index => index !== -1) ?? -1;

        // Process data rows (skip header)
        const dataRows = rawData.slice(headerRowIndex + 1);

        return dataRows
            .filter(row => Array.isArray(row) && row.length > 0 && row[nameIndex])
            .map(row => {
                // Title is typically in the column before Name
                const title = nameIndex > 0 ? String(row[nameIndex - 1] || '') : '';

                return {
                    name: String(row[nameIndex] || ''),
                    title: title ? title : null,
                    fideId: fideIdIndex !== -1 ? this.parseNumeric(row[fideIdIndex]) : null,
                    federation: fedIndex !== -1 ? String(row[fedIndex] || '') || null : null,
                    rating: ratingIndex !== -1 ? this.parseNumeric(row[ratingIndex]) : null
                };
            });
    }

    private parseNumeric(value: any): number | null {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }
}