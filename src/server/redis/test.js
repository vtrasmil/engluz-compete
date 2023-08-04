

import { redis } from './client.js'
import getAblyClient from '../ably/client.js'

export default async function redisTest() {
    const client = await redis;
    await client.set('key', 'value');
    const value = await client.get('key');

    await client.hSet('user-session:123', {
        name: 'John',
        surname: 'Smith',
        company: 'Redis',
        age: 29
    })

    let userSession = await client.hGetAll('user-session:123');
    console.log(JSON.stringify(userSession, null, 2));
}



export async function ablyTest() {
    const ably = await getAblyClient();
    // get the channel to subscribe to
    const channel = ably.channels.get('quickstart');
    await channel.subscribe('greeting', (message) => {
        console.log('Received a greeting message in realtime: ' + message.data)
    });
    await channel.publish('greeting', 'hello!');
    

}