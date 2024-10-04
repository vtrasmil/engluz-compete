import {dictionaryFilePath, dictionaryKey} from "~/server/wordListLoad.tsx";
import * as fs from "node:fs";
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

// to load dictionary into redis, uncomment below, run in dev, and hit the waiting room page.
// void loadDictIntoRedis();