
import { CreateClient } from '@trpc/react-query/shared';
import { create } from 'domain';
import { createClient } from 'redis';
import { env } from '~/env.mjs';
import { VercelKV, kv } from '@vercel/kv';
import { BoggleRedisType } from './api';



export function getRedisClient() {
    let client: BoggleRedisType;
    if (process.env.USE_LOCAL_REDIS === 'True') {
        client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        client.connect(); // TODO: this was originally awaited
        return client;
    }
    
    return kv;
}

    