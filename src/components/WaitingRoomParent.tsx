import React, {type ReactNode} from "react";
import {useChannel} from "ably/react";
import {ablyChannelName} from "~/server/ably/ablyHelpers.ts";
import {AblyMessageType} from "~/components/Types.tsx";
import {useRouter} from "next/router";

interface WaitingRoomParentProps {
    children: ReactNode;
    roomCode: string;
}

export default function WaitingRoomParent({ children, roomCode }: WaitingRoomParentProps) {
    const router = useRouter();
    const channelName = ablyChannelName(roomCode);
    useChannel(channelName, AblyMessageType.GameStarted, () => {
        void router.push(`${roomCode}/play`);
    });

    return <div className={"waiting-room-parent"}>{children}</div>;
}