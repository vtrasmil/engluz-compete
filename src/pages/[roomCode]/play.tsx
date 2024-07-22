import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import GameManager from "~/components/GameManager";
import {RoundState, type SessionInfo} from "~/components/Types";
import { api } from "~/utils/api";
import {useUserIdContext} from "~/components/hooks/useUserIdContext.tsx";
import {INTERMISSION_DURATION, NUM_ROUNDS_PER_GAME, ROUND_DURATION} from "~/components/Constants.tsx";
import 'console-polyfill';

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

    function getCurrentRoundStateFromStartTime(gameTimeStarted: number) {
        const totalRoundDuration = ROUND_DURATION + INTERMISSION_DURATION;
        const gameElapsed = Date.now() - gameTimeStarted;
        const currRound = Math.floor(gameElapsed / totalRoundDuration);
        const roundElapsed = gameElapsed - currRound * totalRoundDuration;
        let roundState, roundSegmentStartTime;
        if (currRound >= NUM_ROUNDS_PER_GAME) {
            roundState = RoundState.GameFinished;
        }
        else if (roundElapsed < ROUND_DURATION) {
            roundState = RoundState.WordSelection;
            roundSegmentStartTime = gameTimeStarted + (currRound * totalRoundDuration);

        } else {
            roundState = RoundState.Intermission;
            roundSegmentStartTime = gameTimeStarted + (currRound * totalRoundDuration) - INTERMISSION_DURATION;
        }
        console.log(roundState, roundSegmentStartTime);
        return {roundState, currRound, roundSegmentStartTime};
    }

    if (gameInfoQuery.data && roomInfoQuery.data) {

        const {roundState, currRound, roundSegmentStartTime} = getCurrentRoundStateFromStartTime(gameInfoQuery.data.dateTimeStarted);
        // console.log(roundState, currRound, roundSegmentStartTime);
        return <GameManager gameId={gameInfoQuery.data.gameId}
            roomCode={gameInfoQuery.data.roomCode} playersOrdered={roomInfoQuery.data.players}
            onLeaveRoom={handleLeaveRoom} initGameState={gameInfoQuery.data.state}
            roundSegmentStartTime={roundSegmentStartTime} initRoundState={roundState} initCurrRound={currRound} />


    }
}