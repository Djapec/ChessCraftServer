import mongoose from "mongoose";

export async function getDatabase(mongoUrl: string) {
    try {
        const mgInstance = new mongoose.Mongoose();
        const mongo = await mgInstance.connect(mongoUrl);
        console.log(`Connection with Database is established`);
        return mongo;
    } catch (error) {
        console.log('Error with Database connection', error);
        throw error;
    }
}