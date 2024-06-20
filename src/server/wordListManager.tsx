import { promises as fs } from 'fs';
import { BoardConfiguration } from '~/components/Types';
import {MIN_WORD_LENGTH} from "~/components/Constants.tsx";

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

export function getWordFromBoard(cellIds: number[], board: BoardConfiguration) {
    let word = cellIds.reduce((str, cellId) =>
        str.concat(board.find(l => l.cellId === cellId)?.letterBlock.letters[0] ?? ''),
        '');
    word = word.replace('Q', 'QU');
    if (word.length < MIN_WORD_LENGTH) throw new Error(`Word submitted with length < ${MIN_WORD_LENGTH}`)
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