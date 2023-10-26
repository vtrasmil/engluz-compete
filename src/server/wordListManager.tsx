import { BoggleRedisType, RedisBoggleCommands } from "./redis/api";
import RedisClient from "@redis/client/dist/lib/client";
import { promises as fs } from 'fs';
import { LetterDieSchema } from "./diceManager";

const dictionaryKey = 'dictionary';
const dictionaryFilePath = `/public/CSW2019.txt`;
export let dictionary: Set<string>;

export async function isWordValid(str: string, redis?: RedisBoggleCommands) {
    if (dictionary == undefined) {
        await loadDictIntoMem();
    }
    return dictionary.has(str);
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

async function loadDictIntoMem() {
    try {
        const data = await fs.readFile(process.cwd() + dictionaryFilePath, { encoding: 'utf8' });
        const array = data.split('\r\n')
        dictionary = new Set(array);
    } catch (err) {
        console.error(err);
    }
}

export function getWordFromBoard(blocks: number[], board: LetterDieSchema[]) {
    return blocks.map((n) => board[n]?.letters.substring(0,1)).join('');
}