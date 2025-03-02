import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String }, // Titles like "GM", "IM", etc.
    fideId: { type: Number, unique: true },
    federation: { type: String }, // Country code like "ROU"
    rating: { type: Number }
}, { _id: false }); // Disables automatic _id for players

const TournamentSchema = new mongoose.Schema({
    tournamentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    players: { type: [PlayerSchema], default: [] } // Array of player objects without _id
});

export default TournamentSchema;
