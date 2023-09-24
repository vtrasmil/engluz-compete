import type { createClient } from "redis";
import { generateRandomString } from "~/components/helpers";
import { uniqueId } from "~/utils/helpers";
import type { VercelKV } from "@vercel/kv";
import RedisClient from "@redis/client/dist/lib/client";
import { BoggleDice, LetterDieSchema, rollAndShuffleDice } from "../diceManager";

const RedisObjects = {
    ActiveRoomsSet: 'ActiveRoomsSet',
    GamesPlayedSet: 'GamesPlayedSet',
    Dictionary: 'Dictionary'

}

export type LocalRedis = ReturnType<typeof createClient>;
export type BoggleRedisType = LocalRedis | VercelKV;

export class RedisBoggleCommands {
    redisKv? : VercelKV;
    redisLocal? : LocalRedis;
    redis: BoggleRedisType;


    constructor(redis: BoggleRedisType) {//, redisKv?: VercelKV, redisLocal?: LocalRedis) {
        this.redis = redis;
    }



    async createDice(gameId: string) {
        const newRoll = rollAndShuffleDice(BoggleDice);
        const key = `game:${gameId}:board`;
        let boardAdded: "OK" | null;
        if (this.redis instanceof RedisClient) {
            boardAdded = await this.redis.json.set(key, '.', newRoll);
        }
        else {
            boardAdded = await this.redis.json.set(key, '.', newRoll);
        }
        if (!boardAdded) throw new Error(`Board not added in game ${gameId}`);

        return newRoll;
    }

    async getDice(gameId: string) {
        let board: any;
        const key = `game:${gameId}:board`;
        if (this.redis instanceof RedisClient) {
            board = await this.redis.json.get(key);
        } else {
            // this returns Promise<any>
            board = await this.redis.json.get(key);
        }
        if (board == null) throw new Error(`No board found for gameId: ${gameId}`);

        // typescript can't verify the type we get from redis.
        // we can only check in runtime whether get is returning what we want.
        // but we can verify that our data is what we want, and then return it with that type.

        // only return the data if it matches the type
        // I was playing with the idea of verifying this data, but this is not a good time.
        // Let the game logic do this.
        return board;
        // throw new Error(`Redis error: ${key} does not match correct type. ${board}`);

    }

    async setDice(gameId: string, dice: LetterDieSchema[]) {
        const key = `game:${gameId}:board`;
        let set: "OK" | null;
        if (this.redis instanceof RedisClient) {
            set = await this.redis.json.set(key, '.', dice);

        } else {
            set = await this.redis.json.set(key, '.', dice);
        }
        if (set !== "OK") throw new Error(`Board not set for gameId: ${gameId}`);
        return true;
    }

    async getGameId(roomCode: string) {
        let gameId: string | null;
        if (this.redis instanceof RedisClient) {
            gameId = await this.redis.get(`roomCode:${roomCode}:gameId`);

        } else {
            gameId = await this.redis.get(`roomCode:${roomCode}:gameId`);
        }
        if (gameId == null) throw new Error(`No gameId found for room code: ${roomCode}`);
        return gameId;
    }

    async createGameId() {
        let gameId: string | undefined;
        while (gameId == undefined) {
            const newGameId = uniqueId();
            let gameAdded;

            if (this.redis instanceof RedisClient) {
                gameAdded = await this.redis.sAdd(RedisObjects.GamesPlayedSet, newGameId);

            } else {
                gameAdded = await this.redis.sadd(RedisObjects.GamesPlayedSet, newGameId);
            }
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


            let roomCodeActiveAdded: number | null;
            if (this.redis instanceof RedisClient) {
                roomCodeActiveAdded = await this.redis.sAdd(RedisObjects.ActiveRoomsSet, roomCode);

            } else {
                roomCodeActiveAdded = await this.redis.sadd(RedisObjects.ActiveRoomsSet, roomCode);
            }
            if (!roomCodeActiveAdded) throw new Error('room code not added to ActiveRoomsSet')


            let roomCodeGameIdAdded: string | null;
            if (this.redis instanceof RedisClient) {
                roomCodeGameIdAdded = await this.redis.set(`roomCode:${roomCode}:gameId`, gameId);

            } else {
                roomCodeGameIdAdded = await this.redis.set(`roomCode:${roomCode}:gameId`, gameId);
            }
            if (!roomCodeGameIdAdded) throw new Error('room code not added to roomCode:${roomCode}:gameId');

        }
        return roomCode;
    }

    async isRoomCodeActive(roomCode: string) {
        let roomCodeActive: number | boolean;
        if (this.redis instanceof RedisClient) {
            roomCodeActive = await this.redis.sIsMember(RedisObjects.ActiveRoomsSet, roomCode);

        } else {
            roomCodeActive = await this.redis.sismember(RedisObjects.ActiveRoomsSet, roomCode);
        }
        return roomCodeActive;
    }
}

