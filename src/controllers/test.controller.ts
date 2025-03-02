import {Database} from "../database/database.js";

export class TestController {
    private db;

    constructor(db: Database) {
        this.db = db;
    }

    getTest = async (req: Request, res: any) => {
        try {
            const tests = await this.db.find({
                collection: 'Tournament',
                query: { /* your query here */ }
            });

            res.status(200).json(tests);
        } catch (error) {
            console.error('Error fetching tests:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}