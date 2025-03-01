import mongoose from "mongoose";
import {ITournament} from "./schemasInterfaces.js";
import TournamentSchema from "./tournamentPlayers.js";

export function getSchemas(mg: mongoose.Mongoose) {
    return {
        Tournament: mg.model<ITournament>('Tournament', TournamentSchema)
    }
}