import mongoose from 'mongoose';

const PairingPlayerSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    mname: { type: String, default: null },
    lname: { type: String, required: true },
    title: { type: String, default: null },
    federation: { type: String, default: null },
    gender: { type: String, default: null },
    fideid: { type: Number, required: true },
  },
  { _id: false },
);

const PairingSchema = new mongoose.Schema(
  {
    gameNumber: { type: Number, required: true },
    gameKey: { type: String, required: true },
    white: { type: PairingPlayerSchema, required: true },
    black: { type: PairingPlayerSchema, required: true },
    result: { type: String, default: '*' },
    live: { type: Boolean, default: false },
  },
  { _id: false },
);

const RoundSchema = new mongoose.Schema(
  {
    tournamentId: { type: String, required: true },
    round: { type: String, required: true },
    date: { type: Date, required: true },
    pairings: { type: [PairingSchema], default: [] },
  },
  { timestamps: true },
);

RoundSchema.index({ tournamentId: 1, round: 1 }, { unique: true });
RoundSchema.index({ 'pairings.gameKey': 1 });

export default RoundSchema;
