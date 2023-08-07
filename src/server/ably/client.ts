import { env } from "../../env.mjs";
import { configureAbly } from "@ably-labs/react-hooks";
import Ably from "ably/promises";



export default function getAblyClient() {
    configureAbly({ key: env.ABLY_API_KEY });
    const realtime = new Ably.Realtime(env.ABLY_API_KEY);
    return realtime;
}

