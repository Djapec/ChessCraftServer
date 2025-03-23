import * as cron from 'node-cron';
import {Database} from "../database/database.js";

/**
 * Creates a cron job that truncates a MongoDB collection at midnight if it's not empty
 *
 * @param db - MongoDB database connection
 * @returns A function to stop the cron job
 */
export function midnightTruncateCron(db: Database): () => void {
    const collectionName = 'DelayedResult'

    if (!db) {
        throw new Error('Database connection is required');
    }

    const task = cron.schedule('0 0 * * *', async () => {
        console.log(`Running scheduled task: Checking and truncating collection '${collectionName}' if needed`);

        try {
            const count = await db.countDocuments({
                collection: collectionName,
            });

            if (count > 0) {
                await db.deleteMany({
                    collection: collectionName,
                });
                console.log(`Collection '${collectionName}' has been truncated successfully.`);
            } else {
                console.log(`Collection '${collectionName}' is already empty. No action needed.`);
            }
        } catch (error) {
            console.error(`Failed to truncate collection '${collectionName}':`, error);
        }
    });

    return () => {
        console.log(`Stopping cron job for collection '${collectionName}'`);
        task.stop();
    };
}