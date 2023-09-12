import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { getRandomIntInclusive } from "~/utils/helpers";
import { BoggleRedisType, RedisBoggleCommands } from "./redis/api";
import { VercelKV } from "@vercel/kv";
import RedisClient from "@redis/client/dist/lib/client";



const dictionaryKey = 'dictionary';
const dictionaryFilePath = 'src/server/CSW2019.txt';

export async function isWordValid(str: string, redis: RedisBoggleCommands) {
    const cont = await isDictionaryInRedis(redis.redis);
    if (!cont) {
        loadDictIntoRedis(redis.redis)
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
    const fs = require('fs/promises');
    let array: string[];
    try {
        const data = await fs.readFile(dictionaryFilePath, { encoding: 'utf8' });
        // const data = fs.readFileSync(dictionaryFilePath, 'utf8') as string;
        array = data.split('\r\n')
        if (redis instanceof RedisClient) {
            redis.sAdd(dictionaryKey, array);
            
        } else {
            redis.sadd(dictionaryKey, array);
        }
    } catch (err) {
        console.error(err);
    }
}

export function getWordFromBoard(blocks: number[], board: string[]) {
    return blocks.map((n) => board[n]?.substring(0,1)).join('');
    
}