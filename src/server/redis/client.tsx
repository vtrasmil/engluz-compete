
import { createClient } from 'redis';
import { kv } from '@vercel/kv';
import { BoggleRedisType } from './api';
import { env } from '~/env.mjs';



export function getRedisClient() {
    let client: BoggleRedisType;
    if (env.VERCEL_ENV === 'development') {
        client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        void client.connect(); // TODO: originally awaited. is there an issue with redis requests made before connection?
        return client;
    }
    return kv;
}

