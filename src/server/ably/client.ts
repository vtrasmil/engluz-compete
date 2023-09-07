import { env } from "../../env.mjs";
import { configureAbly } from "@ably-labs/react-hooks";
import { Realtime } from "ably";
import Ably from "ably/promises";




// const realtime1 = new Ably.Realtime({
//     key: env.ABLY_API_KEY,
// });

// export const realtime = realtime1;

// realtime.connection.on('connected', () => {
//     console.log(`Connected to Ably with connection.id ${realtime.connection.id}`);
// });

// realtime.connection.on('disconnected', () => {
//     console.log(`Disconnected from Ably with connection.id ${realtime.connection.id}`);
// });

const MAX_NUM_CONNECTION_RETRIES = 5;
export let realtime: Ably.Realtime;
let retries = 0;

export function createAblyClient() {
    if (realtime != undefined 
        // && (realtime.connection.state === 'connected' ||
        // realtime.connection.state === 'connecting' ||
        // realtime.connection.state === 'initialized')
    ) {
        console.log(`>>> createAblyClient: ${realtime.connection.state}`);
        return;
    }
    console.log(`>>> createAblyClient: creating new connection`);
    realtime = new Ably.Realtime({
        key: env.ABLY_API_KEY,
    });
    
    // realtime.connection.on('connected', () => {
    //     console.log(`Connected to Ably with connection.id ${realtime.connection.id}`);
    // });
    

    // realtime.connection.on('disconnected', () => {
    //     console.log(`Disconnected from Ably with connection.id ${realtime.connection.id}`);
    // });

    realtime.connection.on((connectionState) => {
        const time = new Date().toLocaleString();
        let string = `[${time}] Ably connection ${realtime.connection.id} state change: ${connectionState.previous} --> ${connectionState.current}`;
        if (connectionState.reason != undefined) {
            string += `: reason: ${connectionState.reason}`
        }
        console.log(string);
    })

    // return realtime;
}

// function checkForConnection() {
    
//     if (retries >= 0) {
//         // try again
//         setTimeout(checkForConnection, 1000)
//     } else if (retries > 4) {
//         // give up
//         retries = 0;
//     }

// }

// export function getAblyClient() : Ably.Realtime | undefined {
//     if (realtime == undefined) {
//         return createAblyClient();
//     } 
//     if (realtime.connection.state !== 'connected') {
//         // wait before creating new connection
//         retries += 1;
//         if (retries >= 0) {
//             // try again
//             console.log(`Waiting for Ably to connect: ${retries + '/' + MAX_NUM_CONNECTION_RETRIES} `)
//             setTimeout(getAblyClient, 1000, retries);
//         } else if (retries > MAX_NUM_CONNECTION_RETRIES) {
//             // give up
//             retries = 0;
//             return createAblyClient();
//         }
//     } else {
//         return realtime;
//     }
// }

    


export async function getAblyClientStringified() {
    // configureAbly({ key: env.ABLY_API_KEY });
    // console.log('running getAblyClient()');
    const storage = require('node-persist');
    await storage.init( /* options ... */ );
    const value = await storage.getItem('ablyConnection');

    if (value == undefined) {
        const realtime = new Ably.Realtime({
            key: env.ABLY_API_KEY,
        });

        realtime.connection.on('connected', async () => {
            console.log(`Connected to Ably with connection.id ${realtime.connection.id}`);
        });
        
        realtime.connection.on('disconnected', () => {
            console.log(`Disconnected from Ably with connection.id ${realtime.connection.id}`);
        });
        
        const util = require('util');
        const string = JSON.stringify(util.inspect(realtime));
        await storage.setItem('ablyConnection', string);
        return realtime;
    };
    
    const parsed = JSON.parse(value);
    console.log(`Retrieved ablyConnection: ${parsed}`);
    return parsed as Ably.Realtime;
}

// export async function ablyTest() {
//     const ably = getAblyClient();
    
//     // get the channel to subscribe to
//     const channel = ably.channels.get('quickstart');
//     await channel.subscribe('greeting', (message) => {
//         if (typeof message.data === 'string') {
//             console.log('Received a greeting message in realtime: ' + message.data)
//         }
//     });
//     await channel.publish('greeting', 'hello!');
// }