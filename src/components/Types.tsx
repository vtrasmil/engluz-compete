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
    dateTimeStarted: number,
}

export type GameInfoUpdate = Partial<Pick<GameInfo, 'state' | 'scores'>>;

export type GameState = {
    round: number;
    isGameFinished: boolean;
    board: BoardConfiguration;
};

export enum RoundState {
    WordSelection = 'WordSelection',
    Intermission = 'Intermission',
    GameFinished = 'GameFinished',
}

export type ConfirmedWord = {
    userId: string,
    word: string,
    score: number,
    sourceCellIds: number[],
}

export enum WordSubmissionState {
    NotSubmitted = "NotSubmitted",
    Submitting = "Submitting",
    Submitted = "Submitted",
    SubmitFailed = "SubmitFailed",
    Confirming = "Confirming",
    Confirmed = "Confirmed",
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
    GameStarted = 'GameStarted',
    ScoreUpdated = 'ScoreUpdated',
    PlayerConfirmedWord = 'PlayerConfirmedWord',
    BeginIntermission = 'BeginIntermission',
}
interface DefaultAblyMessageData {
    messageType: AblyMessageType;
    dateTimePublished: number;
}
// NOTE: Ably only allows serialized data in messages

export type PlayerConfirmedWordMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.PlayerConfirmedWord;
    userId: string;
    word: string;
    sourceCellIds: number[];
};

export const defaultAblyMessageDataSchema = z.object({
    messageType: z.string(),
    dateTimePublished: z.date(),
})

export const scoreSchema = z.object({
    userId: z.string(),
    score: z.number()
});

export const letterDieSchemaSchema = z.object({
    letters: z.string(),
    id: z.number(),
    numTimesRolled: z.number()
});

export const boardLetterDieSchema = z.object({
    cellId: z.number(),
    letterBlock: letterDieSchemaSchema
});

export const boardConfigurationSchema = z.array(boardLetterDieSchema);

export const gameStateSchema = z.object({
    round: z.number(),
    isGameFinished: z.boolean(),
    board: boardConfigurationSchema,
});

export const confirmedWordSchema = z.object({
    userId: z.string(),
    word: z.string(),
    score: z.number(),
    sourceCellIds: z.array(z.number()),
});

export const gameInfoSchema = z.object({
    state: gameStateSchema,
    scores: z.array(scoreSchema),
    words: z.undefined(),
    gameId: z.string(),
    roomCode: z.string(),
    dateTimeStarted: z.number(),
});

export type BeginIntermissionMessageData = DefaultAblyMessageData & {
    messageType: AblyMessageType.BeginIntermission;
    words: ConfirmedWord[];
    game: GameInfo;
};

export const beginIntermissionMsgDataSchema = defaultAblyMessageDataSchema.extend({
    messageType: z.literal(AblyMessageType.BeginIntermission),
    words: z.array(confirmedWordSchema),
    game: gameInfoSchema
});

export type GameStartedMessageData = {
    messageType: AblyMessageType.GameStarted;
    initBoard: BoardConfiguration;
    players: SimplePlayerInfo[];
} & DefaultAblyMessageData;

export interface WordSubmissionResponse {
    wordSubmitted: string,
    score: number,
    cellIds: number[],
    isValid: boolean,
}