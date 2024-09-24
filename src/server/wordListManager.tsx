import {type BoardConfiguration} from '~/components/Types';
import {MIN_WORD_LENGTH} from "~/components/Constants.tsx";
import {dictionary, dictionaryFilePath, dictionaryKey} from "~/server/wordListLoad.tsx";
import {BoggleRedisType, RedisBoggleCommands} from "~/server/redis/api.tsx";
import * as fs from "node:fs";
import RedisClient from "@redis/client/dist/lib/client";
import {kv} from "@vercel/kv";

/*export function isWordValid(str: string) {
    if (dictionary == undefined) {
        console.error('No dictionary has been set')
    }
    return dictionary.has(str);
}*/

/* async function isDictionaryInRedis(redis: BoggleRedisType) {
    return await redis.exists(dictionaryKey);
}*/

// this destroyed my hobby plan limits
async function loadDictIntoRedis() {
    console.log('loading dict into redis')
    let array: string[];
    try {
        const data = fs.readFileSync(process.cwd() + dictionaryFilePath, 'utf8');
        array = data.split('\r\n')

        await addItemsToSetInBatches(dictionaryKey, array);

        console.log('loading dict done')
    } catch (err) {
        console.error(err);
    }
}

async function addItemsToSet(setKey: string, items: string[]) {
    const pipeline = kv.pipeline();

    items.forEach(item => {
        pipeline.sadd(setKey, item);
    });

    await pipeline.exec();
}

async function addItemsToSetInBatches(setKey: string, items: string[], batchSize = 10000) {
    const totalItems = items.length;
    for (let i = 200000; i < totalItems; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await addItemsToSet(setKey, batch);
        console.log(`sent pipeline ${i}`)
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

// to load dictionary into redis, uncomment below, run in dev, and hit the waiting room page.
// void loadDictIntoRedis();