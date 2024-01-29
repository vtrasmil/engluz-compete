import { useState } from "react";
import Board, { AblyMessageType, BoardConfiguration } from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { RoomPlayerInfo } from "./Types.tsx";
import { useChannel } from "ably/react";
import { ablyChannelName } from "~/server/ably/ablyHelpers.ts";
import { DiceSwappedMessageData, MessageData, WordSubmittedMessageData } from "~/server/api/routers/gameplayRouter.ts";
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
    const [boardConfig, setBoardConfig] = useState<BoardConfiguration>(initBoard);
    const [scores, setScores] = useState<Score[]>(
        roomPlayerInfos.map(p => ({ userId: p.userId, score: 0 }))
    );
    const channelName = ablyChannelName(roomCode);
    const [latestMsg, setLatestMsg] = useState<MessageData>();

    useChannel(channelName, AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        setLatestMsg(msgData);
        // sent to all clients
        setBoardConfig(msgData.newBoard);
        setScores(msgData.newScores);
    });

    useChannel(channelName, AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        setLatestMsg(msgData);
        if (msgData.userId == userId) return;
        setBoardConfig(msgData.newBoard);
    });

    function handleBoardChange(boardConfig: BoardConfiguration) {
        setBoardConfig(boardConfig);
    }

    return (
        <>
            {initBoard &&
                (
                    <>
                        <Board boardConfig={boardConfig} roomCode={roomCode}
                            gameId={gameId} latestMsg={latestMsg} onBoardChange={handleBoardChange} />
                        <Scoreboard playerInfos={roomPlayerInfos} scores={scores} />
                    </>
                )
            }
        </>
    )


}