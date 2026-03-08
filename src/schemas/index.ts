import mongoose from 'mongoose';
import { IDelayedResult, IGame, IRound, ITournament } from './schemas.interfaces.js';
import TournamentSchema from './tournament.schema.js';
import DelayedResultSchema from './delayedResult.schema.js';
import GameSchema from './game.schema.js';
import RoundSchema from './round.schema.js';

export function getSchemas(mg: mongoose.Mongoose) {
  return {
    Tournament: mg.model<ITournament>('Tournament', TournamentSchema),
    DelayedResult: mg.model<IDelayedResult>('DelayedResult', DelayedResultSchema),
    Game: mg.model<IGame>('Game', GameSchema),
    Round: mg.model<IRound>('Round', RoundSchema),
  };
}
