import { useChannel } from "ably/react";
import { useState } from "react";
import { ablyChannelName } from "~/server/ably/ablyHelpers.ts";
import Board from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import type {
    SimplePlayerInfo, DiceSwappedMessageData, GameplayMessageData, Score, WordSubmittedMessageData
} from "./Types.tsx";
import { AblyMessageType, GameState } from "./Types.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { Button } from "./ui/button.tsx";
import { RulesDialog } from "./RulesDialog.tsx";
import { NUM_ROUNDS } from "./Constants.tsx";

interface GameManagerProps {
    gameId: string,
    roomCode: string,
    playersOrdered: SimplePlayerInfo[],
    onLeaveRoom: () => void,
    gameStateProp: GameState,
}

export default function GameManager({ gameId, roomCode, playersOrdered, onLeaveRoom, gameStateProp }: GameManagerProps) {
    const userId = useUserIdContext();
    const [scores, setScores] = useState<Score[]>(
        playersOrdered.map(p => ({ userId: p.userId, score: 0 }))
    );
    const channelName = ablyChannelName(roomCode);
    const [latestMsg, setLatestMsg] = useState<GameplayMessageData>();
    const [gameState, setGameState] = useState<GameState>(gameStateProp);

    useChannel(channelName, AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        setLatestMsg(msgData);
        if (msgData.isValid) {
            setGameState(msgData.game.state);
            setScores(msgData.newScores);
        }
    });

    useChannel(channelName, AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        // if (msgData.userId === userId) return; // client receives msg from API
        setLatestMsg(msgData);
        setGameState(msgData.game.state);
    });

    const clientTurn = playersOrdered.findIndex(p => p.userId === userId);
    const isClientsTurn = gameState.turn === clientTurn && !gameState.isGameFinished;
    const lastSubmittedWordMsg = latestMsg?.messageType === AblyMessageType.WordSubmitted ? latestMsg : undefined;

    return (
        <>
            <div className="flex space-x-1">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog />
            </div>
            {gameState.isGameFinished ?
                <h2>Game Over!</h2> :
                <h2>Round {(gameState.round + 1).toString()}/{NUM_ROUNDS.toString()}</h2>
            }
            <Board boardConfig={gameState.board} roomCode={roomCode}
                gameId={gameId} latestMsg={latestMsg}
                isClientsTurn={isClientsTurn} dragMode={gameState.phaseType} />
            <Scoreboard playersOrdered={playersOrdered} scores={scores}
                isClientsTurn={isClientsTurn} gameState={gameState}
                lastSubmittedWordMsg={lastSubmittedWordMsg} />
        </>
    )


}