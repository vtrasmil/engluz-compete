import { z } from "zod";
import { ReadyOptions } from "./WaitingRoom";
import { DragMode } from "./Board";



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
