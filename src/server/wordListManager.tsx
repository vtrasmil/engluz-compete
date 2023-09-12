import { BoggleRedisType, RedisBoggleCommands } from "./redis/api";
import RedisClient from "@redis/client/dist/lib/client";
import { promises as fs } from 'fs';




const dictionaryKey = 'dictionary';
const dictionaryFilePath = 'src/server/CSW2019.txt';

export async function isWordValid(str: string, redis: RedisBoggleCommands) {
    const cont = await isDictionaryInRedis(redis.redis);
    if (!cont) {
        await loadDictIntoRedis(redis.redis)
    }
    let valid: boolean | number;
    if (redis.redis instanceof RedisClient) {
        valid = await redis.redis.sIsMember(dictionaryKey, str.toUpperCase());
        
    } else {
        valid = await redis.redis.sismember(dictionaryKey, str.toUpperCase());
    }
    
    return valid;
    
    
}

async function isDictionaryInRedis(redis: BoggleRedisType) {
    return await redis.exists(dictionaryKey); 
}

async function loadDictIntoRedis(redis: BoggleRedisType) {
    let array: string[];
    try {
        const data = await fs.readFile(dictionaryFilePath, { encoding: 'utf8' });
        array = data.split('\r\n')
        if (redis instanceof RedisClient) {
            await redis.sAdd(dictionaryKey, array);
            
        } else {
            await redis.sadd(dictionaryKey, array);
        }
    } catch (err) {
        console.error(err);
    }
}

export function getWordFromBoard(blocks: number[], board: string[]) {
    return blocks.map((n) => board[n]?.substring(0,1)).join('');
    
}