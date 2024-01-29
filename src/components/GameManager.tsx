import { useState } from "react";
import Board, { AblyMessageType, BoardConfiguration } from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { GamePlayerInfo, RoomPlayerInfo } from "./Types.tsx";
import { useChannel } from "ably/react";
import { ablyChannelName } from "~/server/ably/ablyHelpers.ts";
import { ScoreUpdatedMessageData } from "~/server/api/routers/gameplayRouter.ts";
import { Score } from "./Types.tsx";

interface GameManagerProps {
    gameId: string,
    initBoard: BoardConfiguration,
    roomCode: string,
    roomPlayerInfos: RoomPlayerInfo[],

}

export default function GameManager({ gameId, initBoard, roomCode, roomPlayerInfos }: GameManagerProps) {
    const userId = useUserIdContext();
    const duration = 10;
    const [scores, setScores] = useState<Score[]>();
    const [gamePlayerInfo, setGamePlayerInfo] = useState<GamePlayerInfo[]>(
        roomPlayerInfos.map(rpi => { return { ...rpi, score: 0 } })
    );
    const channelName = ablyChannelName(roomCode);

    useChannel(channelName, AblyMessageType.ScoreUpdated, (message) => {
        const msgData = message.data as ScoreUpdatedMessageData;
        setScores(msgData.scores)
    });

    return (
        <>
            {initBoard &&
                (
                    <>
                        <Board initBoardConfig={initBoard} roomCode={roomCode} gameId={gameId} />
                        <Scoreboard playerInfos={gamePlayerInfo} />
                    </>
                )
            }
        </>
    )


}