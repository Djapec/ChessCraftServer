import mongoose from "mongoose";
import {ITournament} from "./schemas.interfaces.js";
import TournamentSchema from "./tournament.schema.js";

export function getSchemas(mg: mongoose.Mongoose) {
    return {
        Tournament: mg.model<ITournament>('Tournament', TournamentSchema)
    }
}