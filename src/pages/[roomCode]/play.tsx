import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import GameManager from "~/components/GameManager";
import {RoundState, type SessionInfo} from "~/components/Types";
import { api } from "~/utils/api";
import {useUserIdContext} from "~/components/hooks/useUserIdContext.tsx";
import 'console-polyfill';
import {getCurrentRoundState} from "~/components/helpers.tsx";

export default function GamePage() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState<string>('');
    const [sessionInfo, setSessionInfo] = useSessionStorage<SessionInfo | undefined>('sessionInfo', undefined);
    const [isRoomInfoFetched, setIsRoomInfoFetched] = useState(false);
    const [isGameInfoFetched, setIsGameInfoFetched] = useState(false);
    const userId = useUserIdContext();

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
    const roomInfoQuery = api.lobby.fetchRoomInfo.useQuery(
        { roomCode: roomCode },
        {
            enabled: sessionInfo != undefined && !isRoomInfoFetched && roomCode.length > 0,
            onSuccess: (e) => {
                setIsRoomInfoFetched(true);
            },
        }
    );
    const gameInfoQuery = api.lobby.fetchGameInfo.useQuery(
        { roomCode: roomCode, userId: userId },
        {
            enabled: sessionInfo != undefined && !isGameInfoFetched && roomCode.length > 0,
            onSuccess: (e) => {
                setIsGameInfoFetched(true);
            },
        }
    );



    function handleLeaveRoom() {
        setSessionInfo(undefined);
        void router.push(`/`);
    }
    if (gameInfoQuery.isLoading || roomInfoQuery.isLoading) {
        return <div>Loading...</div>
    } else if (gameInfoQuery.isError || roomInfoQuery.isError) {
        return <div>Error</div>
    }
    const gameInfo = gameInfoQuery.data;
    if (gameInfo && roomInfoQuery.data) {
        console.log('Play page re-render')
        const roundState = getCurrentRoundState(gameInfo.dateTimeStarted, gameInfo.timeLastRoundOver, gameInfo);
        console.log(`Round State: ${roundState}`);
        let currState;
        if (roundState == RoundState.Intermission && gameInfo.prevState != null) {
            currState = gameInfo.prevState;
        } else {
            currState = gameInfo.state;
        }
        return (
            <GameManager gameId={gameInfo.gameId}
                        roomCode={gameInfo.roomCode} playersOrdered={roomInfoQuery.data.players}
                        onLeaveRoom={handleLeaveRoom} initGameState={currState}
                        initRoundState={roundState}
                        gameTimeStarted={gameInfo.dateTimeStarted} initTimeLastRoundOver={gameInfo.timeLastRoundOver}
        />);


    }
}