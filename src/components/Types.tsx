import { z } from "zod";
import type { LetterDieSchema } from "~/server/diceManager";
import type { ReadyOptions } from "./WaitingRoom";



export const basicPlayerInfoSchema = z.object({
    userId: z.string(),
    playerName: z.string(),
})
export type BasicPlayerInfo = z.infer<typeof basicPlayerInfoSchema>;

export interface BasePlayerInfo {
    userId: string,
    playerName: string,
    isHost: boolean
}

export interface RoomPlayerInfo extends BasePlayerInfo {

    readyStatus: ReadyOptions,
}

export type Score = {
    userId: string,
    score: number
}

export interface GameSettings {
    turnPhases: DragMode[],
    numRounds: number
}

export type BoardConfiguration = BoardLetterDie[];
export interface SwappedLetterState {
    swappedLetter: LetterDieSchema | undefined;
    dragSourceCell: number;
    dropTargetCell: number;
}

export type BoardLetterDie = {
    cellId: number;
    letterBlock: LetterDieSchema;
}; export enum DragMode {
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
    players: BasicPlayerInfo[];
} & DefaultAblyMessageData;

/* export type ScoreUpdatedMessageData = {
    scores: Score[];
} & DefaultAblyMessageData; */

export type GameplayMessageData = WordSubmittedMessageData | DiceSwappedMessageData;

