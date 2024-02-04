import { z } from "zod";
import { LetterDieSchema } from "~/server/diceManager";
import { ReadyOptions } from "./WaitingRoom";



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

export type SubmittedWordInfo = {
    userId: string,
    cellIds: number[],
    word: string,
    isValid: boolean,
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

export enum AblyMessageType {
    WordSubmitted = 'wordSubmitted',
    DiceSwapped = 'diceSwapped',
    GameStarted = 'gameStarted',
    ScoreUpdated = 'scoreUpdated'
}

