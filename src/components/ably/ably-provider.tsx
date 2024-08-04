'use client';

import * as Ably from 'ably';
import {AblyProvider, ChannelProvider} from 'ably/react';
import {getBaseUrl} from "~/utils/api.ts";

interface AblyProviderProps {
    children: React.ReactNode;
    userId: string;
}

export default function AblyRealtimeProvider({ children, userId }: AblyProviderProps) {
    const client = new Ably.Realtime({
        authUrl: `${getBaseUrl()}/api/createTokenRequest`,
        authHeaders: {
            'userId': userId
        } });

    return <AblyProvider client={client} key='ably'>{children}</AblyProvider>;
}