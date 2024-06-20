import { z } from "zod";
import type { LetterDieSchema } from "~/server/diceManager";
import type { ReadyOptions } from "./WaitingRoom";





/* =========================== ROOM INFO =========================== */
export interface SessionInfo {
    playerName: string,
    isHost: boolean,
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
    activeGameId: string | undefined,
    roomCode: string,
}

/* =========================== GAME INFO =========================== */
export type Score = {
    userId: string,
    score: number
}

export interface GameSettings {
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
    isGameFinished: boolean;
    board: BoardConfiguration;
};

export type ConfirmedWord = {
    userId: string,
    word: string,
    score: number,
    sourceCellIds: number[],
}

export enum WordSubmissionState {
    NotSubmitted = "notSubmitted",
    Submitting = "submitting",
    Submitted = "submitted",
    SubmitFailed = "submitFailed",
    Confirming = "confirming",
    Confirmed = "confirmed",
}

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
    GameStarted = 'gameStarted',
    ScoreUpdated = 'scoreUpdated',
    WordConfirmed = 'wordConfirmed',
    AllWordsConfirmed = 'allWordsConfirmed',
}
interface DefaultAblyMessageData {
    messageType: AblyMessageType;
}
// NOTE: Ably only allows serialized data in messages

export type WordSubmittedMessageData = (ValidWordSubmittedMessageData | InvalidWordSubmittedMessageData);

export type ValidWordSubmittedMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.WordSubmitted;
    userId: string;
    game: GameInfo,
    word: string;
    sourceCellIds: number[];
    newScores: Score[];
    isValid: true;
    score: number;
};

export type InvalidWordSubmittedMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.WordSubmitted;
    userId: string;
    word: string;
    sourceCellIds: number[];
    isValid: false;
};

export type WordConfirmedMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.WordConfirmed;
    userId: string;
    word: string;
    sourceCellIds: number[];
};

export type AllWordsConfirmedMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.AllWordsConfirmed;
    words: ConfirmedWord[];
};

export type GameStartedMessageData = {
    messageType: AblyMessageType.GameStarted;
    initBoard: BoardConfiguration;
    players: SimplePlayerInfo[];
} & DefaultAblyMessageData;

export type GameplayMessageData = WordSubmittedMessageData | WordConfirmedMessageData;
export type GameEventMessageData = GameStartedMessageData | AllWordsConfirmedMessageData;


