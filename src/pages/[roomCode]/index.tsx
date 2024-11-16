import { useSessionStorage } from "@react-hooks-library/core";
import {ChannelProvider, useChannel} from "ably/react";
import { useRouter } from "next/router";
import React, {useEffect, useState} from "react";
import { AblyMessageType, SessionInfo } from "~/components/Types";
import WaitingRoom from "~/components/WaitingRoom";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { api } from "~/utils/api";
import { uniqueId } from "~/utils/helpers";
import {Icons} from "~/components/ui/icons.tsx";
import WaitingRoomParent from "~/components/WaitingRoomParent.tsx";

export default function RoomPage() {
    // if session info exists
    //      if game has not started, show WaitingRoom
    //      if game has started and player is in game, show GameManager
    //      if game is finished, redirect to Lobby
    // if no session info
    //      redirect to Lobby

    const router = useRouter();
    const [roomCode, setRoomCode] = useState<string>('');
    const [isRoomInfoFetched, setIsRoomInfoFetched] = useState(false);
    useEffect(() => {
        if (!router.isReady) return;
        let roomCodeParam: string;
        switch (typeof router.query.roomCode) {
            case 'object':
                roomCodeParam = router.query.roomCode[0] ?? '';
                break;
            case 'string':
                roomCodeParam = router.query.roomCode;
                break;
            case 'undefined':
                roomCodeParam = '';
                break;
        }
        if (roomCodeParam !== roomCode) setRoomCode(roomCodeParam);
    }, [router, roomCode])
    const [userId, setUserId] = useSessionStorage('userId', uniqueId('user'))
    const [sessionInfo, setSessionInfo] = useSessionStorage<SessionInfo | undefined>('sessionInfo', undefined);
    const channelName = ablyChannelName(roomCode);
    const roomInfoQuery = api.lobby.fetchRoomInfo.useQuery(
        { roomCode: roomCode },
        {
            enabled: !isRoomInfoFetched && router.isReady && roomCode.length > 0,
            onSuccess: () => {
                console.log('fetchRoomInfo success');
                setIsRoomInfoFetched(true);
            },
            onError: () => void router.push('/')
        }
    );

    function handleLeaveRoom() {
        setSessionInfo(undefined);
        void router.push(`/`);
    }

    if (roomInfoQuery.isLoading) {
        return <Icons.spinner className="h-4 w-4 animate-spin ml-1" />;
    } else if (roomInfoQuery.isError) {
        return <div>Error</div>
    }
    const player = roomInfoQuery.data.players.find(p => p.userId === userId);
    if (player && roomCode.length > 0) { //TODO: roomCode should be undefined instead of empty string
        return (
            <ChannelProvider channelName={channelName}>
                <WaitingRoomParent roomCode={roomCode}>
                    <WaitingRoom basePlayer={player} roomCode={roomInfoQuery.data.roomCode} onLeaveRoom={handleLeaveRoom} />
                </WaitingRoomParent>
            </ChannelProvider>
        );
    }
}