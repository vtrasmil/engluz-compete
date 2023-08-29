import { createClient } from "redis";
import { generateRandomString } from "~/components/helpers";
import { uniqueId } from "~/utils/helpers";
import { boggleDice, rollAndShuffleDice, toStoredDiceRollString } from "../diceManager";

const RedisObjects = {
    ActiveRoomsSet: 'ActiveRoomsSet',
    GamesPlayedSet: 'GamesPlayedSet',
    Dictionary: 'Dictionary'

}

export class RedisBoggleCommands {
    redis;

    constructor(redis: ReturnType<typeof createClient>) {
        this.redis = redis;
    }

    async createDice(gameId: string) {
        const newRoll = rollAndShuffleDice(boggleDice);
        const storedRollString = toStoredDiceRollString(newRoll);

        const boardAdded = await this.redis.set(`game:${gameId}:board`, storedRollString);
        if (!boardAdded) throw new Error(`Board not added in game ${gameId}`);
        
        return newRoll;
    }
    
    async getDice(gameId: string) {
        const board = await this.redis.get(`game:${gameId}:board`);
        if (board == null) throw new Error(`No board found for gameId: ${gameId}`);   
        
        const rollString = board.split(',');
        return rollString;
    }

    async setDice(gameId: string, dice: string[]) {
        const set = await this.redis.set(`game:${gameId}:board`, dice.join(','));
        if (set !== "OK") throw new Error(`Board not set for gameId: ${gameId}`); 
        return true;
    }

    async getGameId(roomCode: string) {
        const gameId = await this.redis.get(`roomCode:${roomCode}:gameId`);
        if (gameId == null) throw new Error(`No gameId found for room code: ${roomCode}`);
        return gameId;
    }

    async createGameId() {
        let gameId: string | undefined;
        while (gameId == undefined) {
            const newGameId = uniqueId();
            const gameAdded = await this.redis.sAdd(RedisObjects.GamesPlayedSet, newGameId);
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
            
            const roomCodeActiveAdded = await this.redis.sAdd(RedisObjects.ActiveRoomsSet, roomCode);
            if (!roomCodeActiveAdded) throw new Error('room code not added to ActiveRoomsSet')

            const roomCodeGameIdAdded = await this.redis.set(`roomCode:${roomCode}:gameId`, gameId);
            if (!roomCodeGameIdAdded) throw new Error('room code not added to roomCode:${roomCode}:gameId');

        }
        return roomCode;
    }

    async isRoomCodeActive(roomCode: string) {
        const roomCodeActive = await this.redis.sIsMember(RedisObjects.ActiveRoomsSet, roomCode);
        return roomCodeActive;
    }
}

