import type { VercelKV } from "@vercel/kv";
import type { createClient } from "redis";
import { DragMode, type PlayerInfo, type GameInfo, type GameInfoUpdate, type Score, RoomInfo } from "~/components/Types";
import { generateRandomString } from "~/components/helpers";
import { uniqueId } from "~/utils/helpers";
import { BoggleDice, rollAndShuffleDice } from "../diceManager";

const RedisObjects = {
    ActiveRoomsSet: 'ActiveRoomsSet',
    GamesPlayedSet: 'GamesPlayedSet',
    Dictionary: 'Dictionary'

}

export type LocalRedis = ReturnType<typeof createClient>;
export type BoggleRedisType = LocalRedis | VercelKV;

function getGameInfoKey(gameId: string) {
    return `game:${gameId}`;
}

function getRoomInfoKey(roomCode: string) {
    return `room:${roomCode}`;
}

export class RedisBoggleCommands {
    redis: VercelKV;

    constructor(redis: VercelKV) {//, redisKv?: VercelKV, redisLocal?: LocalRedis) {
        this.redis = redis;
    }

    async createGameInfo(gameId: string, roomCode: string) {
        const key = getGameInfoKey(gameId);
        const newBoard = rollAndShuffleDice(BoggleDice);
        const gameInfo = {
            state: {
                round: 0, turn: 0, phase: 0,
                phaseType: DragMode.DragNDrop, isGameFinished: false,
                board: newBoard,
            },
            scores: [],
            words: undefined,
            gameId: gameId,
            roomCode: roomCode,
        } satisfies GameInfo;
        const gameAdded = await this.redis.json.set(key, '$', gameInfo);
        if (!gameAdded) throw new Error(`Game ${gameId} failed to initialize`);
        return gameInfo;

    }

    async updateGameInfo(gameId: string, gameInfoUpdate: GameInfoUpdate) {
        const key = getGameInfoKey(gameId);
        const get = await this.fetchGameInfo(gameId);
        const info = {
            ...get,
            ...gameInfoUpdate
        } satisfies GameInfo;
        const set = await this.redis.json.set(key, '$', info);
        if (set == null) throw new Error(`gameInfo failed to set for gameId: ${gameId}`);
    }

    async fetchGameInfo(gameId: string) {
        const key = getGameInfoKey(gameId);
        const gameInfo = await this.redis.json.get(key) as GameInfo;
        if (gameInfo == null) throw new Error(`No game info found for gameId: ${gameId}`);
        return gameInfo;
    }

    async getGameId(roomCode: string) {
        // TODO: validate with zod instead of asserting
        const gameId = await this.redis.get(`roomCode:${roomCode}:gameId`) as string;
        if (gameId == null) throw new Error(`No gameId found for room code: ${roomCode}`);
        return gameId;
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

    async createRoomCode(gameId: string) {
        let roomCode: string | undefined;
        while (roomCode == undefined) {
            roomCode = generateRandomString(4);
            const roomCodeActive = await this.isRoomCodeActive(roomCode)
            if (roomCodeActive) continue;

            const roomCodeActiveAdded = await this.redis.sadd(RedisObjects.ActiveRoomsSet, roomCode);
            if (roomCodeActiveAdded == null) throw new Error('room code not added to ActiveRoomsSet')

            const roomCodeGameIdAdded = await this.redis.set(`roomCode:${roomCode}:gameId`, gameId);
            if (roomCodeGameIdAdded == null) throw new Error('room code not added to roomCode:${roomCode}:gameId');

        }
        return roomCode;
    }

    async createRoomInfo(roomCode: string, player: PlayerInfo) {
        // init players
        const key = getRoomInfoKey(roomCode);
        const players = [player];
        const roomInfo = {
            players: players,
            activeGameId: await this.getGameId(roomCode),
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

    async getPlayers(gameId: string) {
        const key = `game:${gameId}:players`;
        const playerInfos = await this.redis.json.get(key) as PlayerInfo[];
        if (playerInfos == null) throw new Error(`No player infos found for gameId: ${gameId}`);
        return playerInfos;
    }

    async initGameScore(gameId: string, playersOrdered: { userId: string, playerName: string }[]) {
        const key = `game:${gameId}:scores`;
        console.log(key)
        const initScores: Score[] = playersOrdered.map(p => {
            return { userId: p.userId, score: 0 };
        })
        const set = await this.redis.json.set(key, '$', JSON.stringify(initScores));
        if (set == null) throw new Error(`Initial scores for gameId ${gameId} failed to set`);
        return;
    }

    async getGameScore(gameId: string) {
        const key = `game:${gameId}:scores`;
        return JSON.parse(await this.redis.json.get(key) as string) as Score[];
    }

    async updateGameScore(gameId: string, userId: string, amount: number) {
        const key = `game:${gameId}:scores`;
        // const set = await this.redis.json.set(key, `$.*[?(@.userId==${userId})]`, scores);
        const scores = await this.redis.json.get(key) as Score[]; // TODO: this badly needs validation
        if (scores == null) throw new Error(`No scores found for gameId ${gameId}`);
        const score = scores.find(x => x.userId === userId);
        if (score != undefined) {
            score.score += amount;
            const set = await this.redis.json.set(key, '$', scores);
            if (set == null) throw new Error(`Score of ${amount} for userId ${userId} in gameId ${gameId} failed to set`);
            return scores;
        } else {
            throw new Error(`Can't find score for userId ${userId} in gameId ${gameId}`)
        }
    }

    async isRoomCodeActive(roomCode: string) {
        return await this.redis.sismember(RedisObjects.ActiveRoomsSet, roomCode);
    }
}


