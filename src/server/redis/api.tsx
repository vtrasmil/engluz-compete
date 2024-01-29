import type { createClient } from "redis";
import { generateRandomString } from "~/components/helpers";
import { uniqueId } from "~/utils/helpers";
import type { VercelKV } from "@vercel/kv";
import { BoggleDice, LetterDieSchema, rollAndShuffleDice } from "../diceManager";

const RedisObjects = {
    ActiveRoomsSet: 'ActiveRoomsSet',
    GamesPlayedSet: 'GamesPlayedSet',
    Dictionary: 'Dictionary'

}

export type LocalRedis = ReturnType<typeof createClient>;
export type BoggleRedisType = LocalRedis | VercelKV;

export class RedisBoggleCommands {
    redis: VercelKV;

    constructor(redis: VercelKV) {//, redisKv?: VercelKV, redisLocal?: LocalRedis) {
        this.redis = redis;
    }

    async createDice(gameId: string) {
        const newRoll = rollAndShuffleDice(BoggleDice);
        const key = `game:${gameId}:board`;
        const boardAdded = await this.redis.json.set(key, '$', newRoll);
        if (!boardAdded) throw new Error(`Board not added in game ${gameId}`);
        return newRoll;
    }

    async getDice(gameId: string) {
        // let board: ReturnType<typeof this.redis.json.get>;
        const key = `game:${gameId}:board`;
        // TODO: validate with zod instead of asserting
        const board = await this.redis.json.get(key) as LetterDieSchema[];
        if (board == null) throw new Error(`No board found for gameId: ${gameId}`);
        return board;
    }

    async setDice(gameId: string, dice: LetterDieSchema[]) {
        const key = `game:${gameId}:board`;
        const set = await this.redis.json.set(key, '$', dice);
        if (set !== "OK") throw new Error(`Board not set for gameId: ${gameId}`);
        return true;
    }

    async getGameId(roomCode: string) {
        try {
            // TODO: validate with zod instead of asserting
            const gameId = await this.redis.get(`roomCode:${roomCode}:gameId`) as string;
            if (gameId == null) throw new Error(`No gameId found for room code: ${roomCode}`);
            return gameId;
        } catch (error) {
            console.error(error);
        }


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

    /* async createPlayer(playerInfo: PlayerInfo, gameId: string) {
        const key = `game:${gameId}:players`;
        const obj: PlayerInfo = {
            userId: playerInfo.userId,
            playerName: playerInfo.playerName,
            isHost: playerInfo.isHost,
        };
        const errorStr = `Player ${playerInfo.userId} (${playerInfo.playerName}) not added to gameId: ${gameId}`;

        // JSON.SET array $ []
        // JSON.ARRAPPEND array $ '{"player1": "michael"}'
        // JSON.ARRAPPEND array $ '{"player2": "santos"}'
        // JSON.GET array $

        if (playerInfo.isHost) {
            const initPlayerInfo = await this.redis.json.set(key, '$', '[]');
            if (initPlayerInfo == null) throw new Error(errorStr);
        }
        const setPlayerInfo = await this.redis.json.arrappend(key, '$', JSON.stringify(obj));
        if (setPlayerInfo == null) throw new Error(errorStr);
        return true;
    }

    async getPlayers(gameId: string) {
        const key = `game:${gameId}:players`;
        const playerInfos = await this.redis.json.get(key, '$') as PlayerInfo[];
        if (playerInfos == null) throw new Error(`No player infos found for gameId: ${gameId}`);
        return playerInfos;
    } */

    async isRoomCodeActive(roomCode: string) {
        return await this.redis.sismember(RedisObjects.ActiveRoomsSet, roomCode);
    }
}


