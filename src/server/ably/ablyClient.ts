import { env } from "../../env.mjs";
import Ably from "ably/promises";

let realtime: Ably.Realtime;

export function getAblyClient() {
    if (realtime != undefined
        // && (realtime.connection.state === 'connected' ||
        // realtime.connection.state === 'connecting' ||
        // realtime.connection.state === 'initialized')
    ) {
        return realtime;
    }
    realtime = new Ably.Realtime({
        key: env.ABLY_API_KEY,
    });

    realtime.connection.on((connectionState) => {
        const time = new Date().toLocaleString();
        let string = `[${time} | ${connectionState.current}] Ably connection ${realtime.connection.id || 'undefined'}`;
        if (connectionState.reason != undefined) {
            string += `: reason: ${connectionState.reason.name}: ${connectionState.reason.message}}`
        }
    })

    return realtime;
}