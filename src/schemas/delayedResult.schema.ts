import mongoose from "mongoose";

const DelayedResultSchema = new mongoose.Schema({
    whitePlayerId: { type: Number, required: true, unique: true },
    result: { type: String, required: true },
    gameCompletedAt: { type: Number, required: true },
    gameCompletedAtFormatted : { type: Date, required: true },
});

export default DelayedResultSchema;