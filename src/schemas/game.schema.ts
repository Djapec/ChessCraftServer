import mongoose from 'mongoose';

const BoardMoveSchema = new mongoose.Schema(
  {
    notation: { type: String, required: true },
    clock: { type: Number, required: false, default: null },
    increment: { type: Number, required: false, default: null },
    moveNumber: { type: Number, required: true },
    color: { type: String, enum: ['white', 'black'], required: true },
    receivedAt: { type: Date, required: true },
    playedAt: { type: Date, default: null },
  },
  { _id: false },
);

const GameSchema = new mongoose.Schema(
  {
    gameKey: { type: String, required: true, unique: true },
    serialNr: { type: String, required: true },
    live: { type: Boolean, required: true, default: false },
    result: { type: String, enum: ['*', 'BLACKWIN', 'WHITEWIN', 'DRAW'], default: '*' },
    firstMove: { type: Date, required: true },
    delayMs: { type: Number, default: 0 },
    moveCount: { type: Number, default: null },
    moves: { type: [BoardMoveSchema], default: [] },
  },
  { timestamps: true },
);

GameSchema.index({ serialNr: 1 });
GameSchema.index({ live: 1 });
GameSchema.index({ firstMove: -1 });

export default GameSchema;
