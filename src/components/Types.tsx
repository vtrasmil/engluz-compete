import { ReadyOptions } from "./WaitingRoom";

export interface BasePlayerInfo {
    userId: string,
    playerName: string,
    isHost: boolean
}

export interface RoomPlayerInfo extends BasePlayerInfo {

    readyStatus: ReadyOptions,
}

export interface GamePlayerInfo extends RoomPlayerInfo {
    score: number,

}

export type Score = {
    userId: string,
    score: number
}