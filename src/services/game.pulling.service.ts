import { Database } from '../database/database.js';
import { WatchedGame } from './pulling.service.js';
import { fetchApiData } from '../utils/api-client.js';
import { constructApiUrl } from '../utils/urls.js';
import { SocketService } from '../socket/socket.service.js';
import { SocketEvents } from '../socket/socket.events.js';
import { IBoardMove, IGame } from '../schemas/schemas.interfaces.js';
import { WatchedGameRepository } from '../repositories/watchedgame.repository.js';
import { RoundRepository } from '../repositories/round.repository.js';
import { gameResultMap } from '../utils/constants.js';

interface GameState {
  moveCount: number;
  live: boolean;
}

interface BoardResponse {
  live: boolean;
  serialNr: string;
  firstMove: number;
  chess960: number;
  result: string;
  comment: string | null;
  clock: string | null;
  moves: string[];
}

export class GamePollingService {
  private watchedGameRepository: WatchedGameRepository;
  private roundRepository: RoundRepository;
  private gameStates: Map<string, GameState>;
  private processingGames: Set<string>;

  constructor(db: Database) {
    this.watchedGameRepository = new WatchedGameRepository(db);
    this.roundRepository = new RoundRepository(db);
    this.gameStates = new Map();
    this.processingGames = new Set();
  }

  public async poll(game: WatchedGame): Promise<void> {
    const key = this.buildKey(game);

    if (this.processingGames.has(key)) {
      console.log(`Skipping ${key} — still processing from previous cycle`);
      return;
    }

    this.processingGames.add(key);

    try {
      const url = constructApiUrl(game.id, game.round.toString(), game.game.toString());
      const result = await fetchApiData(url);

      if (!result.moves) {
        console.error(`Failed to fetch board data for ${key}`);
        return;
      }

      const boardData: BoardResponse = result;
      await this.processResponse(key, boardData);
    } catch (error: any) {
      console.error(`Error polling game ${key}:`, error.message);
    } finally {
      this.processingGames.delete(key);
    }
  }

  public async processResponse(
    key: string,
    boardData: BoardResponse,
    emitToSocket: boolean = true,
  ): Promise<void> {
    const currentState = this.gameStates.get(key);
    const incomingMoveCount = boardData.moves.length;

    // First time seeing this game — check DB or create new document
    if (!currentState) {
      await this.initializeGame(key, boardData);
      return;
    }

    const hasNewMoves = incomingMoveCount > currentState.moveCount;
    const gameEnded = currentState.live && !boardData.live;

    if (!hasNewMoves && !gameEnded) {
      console.log(`No changes for game ${key}`);
      return;
    }

    if (hasNewMoves) {
      const newRawMoves = boardData.moves.slice(currentState.moveCount);
      const receivedAt = new Date();
      const newMoves = this.parseMoves(
        newRawMoves,
        currentState.moveCount,
        receivedAt,
        boardData.moves,
      );

      await this.watchedGameRepository.appendMoves(boardData.serialNr, newMoves);
      console.log(
        `Game ${key} — ${newMoves.length} new move(s) saved:`,
        newMoves.map((m) => m.notation),
      );

      if (emitToSocket) {
        SocketService.getInstance().emitToRoom(key, SocketEvents.GAME_UPDATED, {
          serialNr: boardData.serialNr,
          newMoves: this.filterMovesForDelay(newMoves),
          result: boardData.result,
          live: boardData.live,
        });
      }
    }

    if (gameEnded && boardData.result) {
      await this.watchedGameRepository.closeGame(boardData.serialNr, boardData.result);
      if (gameResultMap.has(boardData.result)) {
        const result = gameResultMap.get(boardData.result);
        if (result) await this.updatePairingResult(key, result);

        console.log(`Game ${key} ended with result: ${boardData.result}`);
      } else {
        console.log(
          `Not able to update pairings result for Game ${key} with result: ${boardData.result}`,
        );
      }

      if (emitToSocket) {
        SocketService.getInstance().emitToRoom(key, SocketEvents.GAME_UPDATED, {
          serialNr: boardData.serialNr,
          newMoves: [],
          result: boardData.result,
          live: false,
        });
      }
    }

    // Update local state
    this.gameStates.set(key, {
      moveCount: incomingMoveCount,
      live: boardData.live,
    });
  }

  public async initializeGame(key: string, boardData: BoardResponse): Promise<void> {
    const existingGame = await this.watchedGameRepository.findBySerialNr(boardData.serialNr);

    if (existingGame) {
      // Game already in DB — resume from stored state
      this.gameStates.set(key, {
        moveCount: existingGame.moveCount,
        live: existingGame.live,
      });
      console.log(`Game ${key} resumed from DB with ${existingGame.moveCount} moves`);
    } else {
      // Brand new game — create document
      const receivedAt = new Date();
      const moves = this.parseMoves(boardData.moves, 0, receivedAt, boardData.moves);

      await this.watchedGameRepository.createGame({
        gameKey: key,
        serialNr: boardData.serialNr,
        live: boardData.live,
        result: boardData.result as IGame['result'],
        firstMove: new Date(boardData.firstMove),
        delayMs: 0,
        moveCount: moves.length,
        moves,
      });

      this.gameStates.set(key, {
        moveCount: moves.length,
        live: boardData.live,
      });

      console.log(`Game ${key} created in DB with ${moves.length} moves`);
    }
  }

  public filterMovesForDelay(moves: IBoardMove[]): IBoardMove[] {
    // delayMs will be fetched from the game document in a future iteration
    // For now return all moves — delay filtering will be added later
    return moves;
  }

  public parseMoves(
    rawMoves: string[],
    offset: number,
    receivedAt: Date,
    allMoves: string[],
  ): IBoardMove[] {
    return rawMoves.map((raw, index) => {
      const globalIndex = offset + index;
      const parts = raw.split(' ');
      const notation = parts[0];
      const [clockStr, incrementStr] = parts[1].split('+');
      const clock = parseInt(clockStr);
      const increment = parseInt(incrementStr);
      const color: 'white' | 'black' = globalIndex % 2 === 0 ? 'white' : 'black';
      const moveNumber = Math.floor(globalIndex / 2) + 1;
      const playedAt = this.estimatePlayedAt(globalIndex, allMoves, receivedAt);

      return {
        notation,
        clock,
        increment,
        moveNumber,
        color,
        receivedAt,
        playedAt,
      };
    });
  }

  private async updatePairingResult(gameKey: string, result: string): Promise<void> {
    try {
      // gameKey format is tournamentId-round-gameNumber
      // split from the right to handle UUIDs which contain dashes
      const parts = gameKey.split('-');
      const gameNumber = parts[parts.length - 1];
      const round = parts[parts.length - 2];
      const tournamentId = parts.slice(0, parts.length - 2).join('-');

      await this.roundRepository.updatePairingResult(tournamentId, round, gameKey, result);

      console.log(`Pairing updated for game ${gameKey} with result: ${result}`);
    } catch (error: any) {
      console.error(`Failed to update pairing result for game ${gameKey}:`, error.message);
    }
  }

  public estimatePlayedAt(globalIndex: number, allMoves: string[], receivedAt: Date): Date | null {
    if (globalIndex === 0) return null;

    try {
      const currentParts = allMoves[globalIndex].split(' ');
      const previousParts = allMoves[globalIndex - 1].split(' ');
      const currentClock = parseInt(currentParts[1].split('+')[0]);
      const previousClock = parseInt(previousParts[1].split('+')[0]);
      const increment = parseInt(currentParts[1].split('+')[1]);
      const timeSpentMs = previousClock - currentClock + increment;

      return new Date(receivedAt.getTime() - timeSpentMs);
    } catch {
      return null;
    }
  }

  public clearStates(): void {
    this.gameStates.clear();
    this.processingGames.clear();
    console.log('GamePollingService states cleared');
  }

  public buildKey(game: WatchedGame): string {
    return `${game.id}-${game.round}-${game.game}`;
  }
}
