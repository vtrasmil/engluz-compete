import { env } from "../../env.mjs";
import Ably from "ably/promises";

let realtime: Ably.Realtime;

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
        let string = `[${time}] Ably connection ${realtime.connection.id || 'undefined'} state change: ${connectionState.previous} --> ${connectionState.current}`;
        if (connectionState.reason != undefined) {
            string += `: reason: ${connectionState.reason.name}: ${connectionState.reason.message}}`
        }
        console.log(string);
    })

    return realtime;
}