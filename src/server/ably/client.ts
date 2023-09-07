import { env } from "../../env.mjs";
import { configureAbly } from "@ably-labs/react-hooks";
import { Realtime } from "ably";
import Ably from "ably/promises";

const MAX_NUM_CONNECTION_RETRIES = 5;
export let realtime: Ably.Realtime;
let retries = 0;

export function getAblyClient() {
    if (realtime != undefined 
        // && (realtime.connection.state === 'connected' ||
        // realtime.connection.state === 'connecting' ||
        // realtime.connection.state === 'initialized')
    ) {
        console.log(`>>> getAblyClient: ${realtime.connection.state}`);
        return realtime;
    }
    console.log(`>>> getAblyClient: creating new connection`);
    realtime = new Ably.Realtime({
        key: env.ABLY_API_KEY,
    });
    
    realtime.connection.on((connectionState) => {
        const time = new Date().toLocaleString();
        let string = `[${time}] Ably connection ${realtime.connection.id} state change: ${connectionState.previous} --> ${connectionState.current}`;
        if (connectionState.reason != undefined) {
            string += `: reason: ${connectionState.reason}`
        }
        console.log(string);
    })

    return realtime;
}