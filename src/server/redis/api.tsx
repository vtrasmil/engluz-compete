import type { VercelKV } from "@vercel/kv";
import type { createClient } from "redis";
import {
    DragMode,
    type PlayerInfo,
    type GameInfo,
    type GameInfoUpdate,
    type Score,
    RoomInfo,
    ConfirmedWord
} from "~/components/Types";
import {generateRandomString} from "~/server/helpers.tsx";
import { uniqueId } from "~/utils/helpers";
import { BoggleDice, rollAndShuffleDice } from "../diceManager";

const RedisObjects = {
    ActiveRoomsSet: 'ActiveRoomsSet',
    GamesPlayedSet: 'GamesPlayedSet',
    Dictionary: 'Dictionary'

}

export type LocalRedis = ReturnType<typeof createClient>;
export type BoggleRedisType = LocalRedis | VercelKV;

function getGameInfoKey(roomCode: string) {
    return `room:${roomCode}:gameInfo`;
}

function getRoomInfoKey(roomCode: string) {
    return `room:${roomCode}`;
}

export class RedisBoggleCommands {
    redis: VercelKV;

    constructor(redis: VercelKV) {//, redisKv?: VercelKV, redisLocal?: LocalRedis) {
        this.redis = redis;
    }

    async createGameInfo(gameId: string, roomCode: string, playersOrdered: { userId: string, playerName: string }[]) {
        const key = getGameInfoKey(roomCode);
        const newBoard = rollAndShuffleDice(BoggleDice);
        const newScores: Score[] = playersOrdered.map(p => {
            return { userId: p.userId, score: 0 };
        })
        const gameInfo = {
            state: {
                round: 0, isGameFinished: false,
                board: newBoard,
            },
            scores: newScores,
            words: undefined,
            gameId: gameId,
            roomCode: roomCode,
        } satisfies GameInfo;
        const gameAdded = await this.redis.json.set(key, '$', gameInfo);
        if (!gameAdded) throw new Error(`Game ${gameId} failed to initialize`);
        return gameInfo;
    }

    async updateGameInfo(gameId: string, roomCode: string, gameInfoUpdate: GameInfoUpdate) {
        const key = getGameInfoKey(roomCode);
        const get = await this.fetchGameInfo(roomCode);
        const info = {
            ...get,
            ...gameInfoUpdate
        } satisfies GameInfo;
        const set = await this.redis.json.set(key, '$', info);
        if (set == null) throw new Error(`gameInfo failed to set for gameId: ${gameId}`);
        return info;
    }

    async fetchGameInfo(roomCode: string) {
        if (roomCode.length != 4) throw new Error('roomCode.length != 4')
        const key = getGameInfoKey(roomCode);
        const gameInfo = await this.redis.json.get(key) as GameInfo;
        if (gameInfo == null) throw new Error(`No game info associated with room: ${roomCode}`);
        return gameInfo;
    }

    async createGameId() {
        let gameId: string | undefined;
        while (gameId == undefined) {
            const newGameId = uniqueId('game');
            const gameAdded = await this.redis.sadd(RedisObjects.GamesPlayedSet, newGameId);
            if (gameAdded) gameId = newGameId;
        }
        return gameId;
    }

    async createRoomCode() {
        let roomCode: string | undefined;
        while (roomCode == undefined) {
            roomCode = generateRandomString(4);
            const roomCodeActive = await this.isRoomCodeActive(roomCode)
            if (roomCodeActive) continue;

            const roomCodeActiveAdded = await this.redis.sadd(RedisObjects.ActiveRoomsSet, roomCode);
            if (roomCodeActiveAdded == null) throw new Error('room code not added to ActiveRoomsSet')
        }
        return roomCode;
    }

    async createRoomInfo(roomCode: string, player: PlayerInfo) {
        // init players
        const key = getRoomInfoKey(roomCode);
        const players = [player];
        const roomInfo = {
            players: players,
            activeGameId: undefined,
            roomCode: roomCode
        } satisfies RoomInfo;
        const setRoomInfo = await this.redis.json.set(key, '$', JSON.stringify(roomInfo));
        if (setRoomInfo == null) throw new Error(`Room info not set for ${roomCode}`);
        return roomInfo;
    }

    async fetchRoomInfo(roomCode: string) {
        const key = getRoomInfoKey(roomCode);
        const roomInfo = await this.redis.json.get(key) as RoomInfo;
        if (roomInfo == null) throw new Error(`Cannot find roomInfo for room ${roomCode}`);
        return roomInfo;
    }

    async addPlayer(playerInfo: PlayerInfo, roomCode: string) {
        const key = getRoomInfoKey(roomCode);
        const errorStr = `Player ${playerInfo.userId} (${playerInfo.playerName}) not added to room: ${roomCode}`;
        const setPlayerInfo = await this.redis.json.arrappend(key, '$.players', JSON.stringify(playerInfo));
        if (setPlayerInfo == null) throw new Error(errorStr);
    }

    async getPlayers(roomCode: string) {
        const key = getRoomInfoKey(roomCode) + ':players';
        const roomInfo = await this.fetchRoomInfo(roomCode);
        const playerInfos = roomInfo.players;
        if (playerInfos == null) throw new Error(`No player infos found for room code: ${roomCode}`);
        return playerInfos;
    }

    async addConfirmedWord(gameId: string, userId: string, word: string, sourceCellIds: number[], score: number,
                           round: number) {
        const key = `game:${gameId}:round:${round}:words`;
        const confirmedWord: ConfirmedWord = {
            userId: userId,
            word: word,
            score: score,
            sourceCellIds: sourceCellIds,
        };
        const confirmedWords = await this.redis.json.get(key) as ConfirmedWord[] ?? [];
        if (confirmedWords.some(x => x.userId === userId)) {
            throw new Error(`User ${userId} already has confirmed word in gameId ${gameId}`);
        }
        confirmedWords.push(confirmedWord);
        const set = await this.redis.json.set(key, '$', JSON.stringify(confirmedWords));
        if (set == null) throw new Error(`Failed to set: ${word}, ${key}`);
        return confirmedWords;
    }

    async isRoomCodeActive(roomCode: string) {
        return await this.redis.sismember(RedisObjects.ActiveRoomsSet, roomCode);
    }
}


