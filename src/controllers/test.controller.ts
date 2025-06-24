import { Database } from "../database/database.js";
import { Request } from 'express';

export class TestController {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    getTest = async (req: Request, res: any) => {
        try {
            res.status(200).json('This is test');
        } catch (error) {
            console.error('Error fetching tests:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}
