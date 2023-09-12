import type { createClient } from "redis";
import { generateRandomString } from "~/components/helpers";
import { uniqueId } from "~/utils/helpers";
import { boggleDice, rollAndShuffleDice, toStoredDiceRollString } from "../diceManager";
import type { VercelKV } from "@vercel/kv";
import RedisClient from "@redis/client/dist/lib/client";

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
        const newRoll = rollAndShuffleDice(boggleDice);
        const storedRollString = toStoredDiceRollString(newRoll);
        let boardAdded: string | null;
        if (this.redis instanceof RedisClient) {
            boardAdded = await this.redis.set(`game:${gameId}:board`, storedRollString);
        }
        else {
            boardAdded = await this.redis.set(`game:${gameId}:board`, storedRollString);
        }
        if (!boardAdded) throw new Error(`Board not added in game ${gameId}`);
        
        return newRoll;
    }
    
    async getDice(gameId: string) {
        let board: string | null;
        if (this.redis instanceof RedisClient) {
            board = await this.redis.get(`game:${gameId}:board`);  
        } else {
            board = await this.redis.get(`game:${gameId}:board`);
        }
        if (board == null) throw new Error(`No board found for gameId: ${gameId}`);   
        
        const rollString = board.split(',');
        return rollString;
    }

    async setDice(gameId: string, dice: string[]) {
        let set: string | null;
        if (this.redis instanceof RedisClient) {
            set = await this.redis.set(`game:${gameId}:board`, dice.join(','));
            
        } else {
            set = await this.redis.set(`game:${gameId}:board`, dice.join(','));
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

