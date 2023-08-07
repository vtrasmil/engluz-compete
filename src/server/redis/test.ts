import getAblyClient from '../ably/client.js'


export async function ablyTest() {
    const ably = getAblyClient();
    
    // get the channel to subscribe to
    const channel = ably.channels.get('quickstart');
    await channel.subscribe('greeting', (message) => {
        if (typeof message.data === 'string') {
            console.log('Received a greeting message in realtime: ' + message.data)
        }
    });
    await channel.publish('greeting', 'hello!');
}

