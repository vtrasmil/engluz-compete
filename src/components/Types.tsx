import { z } from "zod";
import type { LetterDieSchema } from "~/server/diceManager";
import type { ReadyOptions } from "./WaitingRoom";





/* =========================== ROOM INFO =========================== */
export interface SessionInfo {
    playerName: string,
    isHost: boolean,
    gameId: string,
    roomCode: string
}

export interface PlayerInfo {
    userId: string,
    playerName: string,
    isHost: boolean
}

export const simplePlayerInfoSchema = z.object({
    userId: z.string(),
    playerName: z.string(),
})
export type SimplePlayerInfo = z.infer<typeof simplePlayerInfoSchema>;

export interface RoomPlayerInfo extends PlayerInfo {
    readyStatus: ReadyOptions,
}

export type RoomInfo = {
    players: PlayerInfo[],
    activeGameId: string,
    roomCode: string,
}

/* =========================== GAME INFO =========================== */
export type Score = {
    userId: string,
    score: number
}

export interface GameSettings {
    turnPhases: DragMode[],
    numRounds: number
}

export interface GameInfo {
    state: GameState,
    scores: Score[],
    words: undefined,
    gameId: string,
    roomCode: string,
}

export type GameInfoUpdate = Partial<Pick<GameInfo, 'state' | 'scores'>>;

export type GameState = {
    round: number;
    turn: number;
    phase: number;
    phaseType: DragMode;
    isGameFinished: boolean;
    board: BoardConfiguration;
};


/* =========================== GAMEPLAY =========================== */

export type BoardConfiguration = BoardLetterDie[];

export type BoardLetterDie = {
    cellId: number;
    letterBlock: LetterDieSchema;
};

export interface SwappedLetterState {
    swappedLetter: LetterDieSchema | undefined;
    dragSourceCell: number;
    dropTargetCell: number;
}

export enum DragMode {
    DragToSelect = 'dragToSelect',
    DragNDrop = 'dragNDrop',
    Disabled = 'disabled'
}

/* =========================== ABLY TYPES =========================== */

export enum AblyMessageType {
    WordSubmitted = 'wordSubmitted',
    DiceSwapped = 'diceSwapped',
    GameStarted = 'gameStarted',
    ScoreUpdated = 'scoreUpdated'
}
interface DefaultAblyMessageData {
    userId: string;
    messageType: AblyMessageType;
}
// NOTE: Ably only allows serialized data in messages

export type WordSubmittedMessageData = (ValidWordSubmittedMessageData | InvalidWordSubmittedMessageData)
    & { messageType: AblyMessageType.WordSubmitted };

export type ValidWordSubmittedMessageData = {
    newBoard: BoardConfiguration;
    word: string;
    sourceCellIds: number[];
    newScores: Score[];
    isValid: true;
    score: number;
} & DefaultAblyMessageData;

export type InvalidWordSubmittedMessageData = {
    word: string;
    sourceCellIds: number[];
    isValid: false;
} & DefaultAblyMessageData;

export type DiceSwappedMessageData = {
    newBoard: BoardConfiguration;
    sourceCellIds: number[];
    messageType: AblyMessageType.DiceSwapped;
} & DefaultAblyMessageData;

export type GameStartedMessageData = {
    initBoard: BoardConfiguration;
    players: SimplePlayerInfo[];
} & DefaultAblyMessageData;

/* export type ScoreUpdatedMessageData = {
    scores: Score[];
} & DefaultAblyMessageData; */

export type GameplayMessageData = WordSubmittedMessageData | DiceSwappedMessageData;


