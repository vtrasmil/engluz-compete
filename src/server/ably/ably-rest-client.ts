import * as Ably from 'ably';
import {getBaseUrl} from "~/utils/helpers.ts";

export function createAblyClient() {
    return new Ably.Rest({
        authUrl: `${getBaseUrl()}/api/createTokenRequest`,
    });
}

