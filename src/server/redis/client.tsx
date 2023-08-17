
import { createClient } from 'redis';



export function getLocalRedisClient() {  
    const client = createClient();
    client.on('error', err => console.log('Redis Client Error', err));
    client.connect(); // TODO: this was originally awaited
    return client;
}
