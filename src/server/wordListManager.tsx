import { promises as fs } from 'fs';
import type { LetterDieSchema } from "./diceManager";

const dictionaryFilePath = `/public/CSW2019.txt`;
export let dictionary: Set<string>;

export async function isWordValid(str: string) {
    if (dictionary == undefined) {
        await loadDictIntoMem();
    }
    return dictionary.has(str);
}

/* async function isDictionaryInRedis(redis: BoggleRedisType) {
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
} */

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
    const word = blocks.map((n) => board[n]?.letters.substring(0, 1)).join('').replace('Q', 'QU');
    if (word.length < 3) throw new Error('Word submitted with length < 3')
    const score = getWordScore(word);

    return {
        word: word,
        score: score
    };
}

export function getWordScore(word: string) {
    const length = word.length;
    let score;

    if (length === 3 || length === 4) { score = 1 } else
        if (length === 5) { score = 2 } else
            if (length === 6) { score = 3 } else
                if (length === 7) { score = 5 } else
                    if (length >= 8) { score = 11 } else
                        score = 0;
    return score;
}