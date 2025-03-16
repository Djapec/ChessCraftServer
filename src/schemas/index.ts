import mongoose from "mongoose";
import {IDelayedResult, ITournament} from "./schemas.interfaces.js";
import TournamentSchema from "./tournament.schema.js";
import DelayedResultSchema from "./delayedResult.schema.js";

export function getSchemas(mg: mongoose.Mongoose) {
    return {
        Tournament: mg.model<ITournament>('Tournament', TournamentSchema),
        DelayedResult: mg.model<IDelayedResult>('DelayedResult', DelayedResultSchema),
    }
}