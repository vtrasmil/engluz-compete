import Ably from "ably/promises";
import {getBaseUrl} from "~/utils/api.ts";

export function createAblyClient() {
    // const token = await getToken();
    console.log(`authUrl: ${getBaseUrl()}/api/createTokenRequest`)
    return new Ably.Rest({
        authUrl: `${getBaseUrl()}/api/createTokenRequest`,
    });
}

