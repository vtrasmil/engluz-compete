import { useChannel } from "ably/react";
import { useState } from "react";
import { ablyChannelName } from "~/server/ably/ablyHelpers.ts";
import Board from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import type {
    SimplePlayerInfo, BoardConfiguration, DiceSwappedMessageData, GameSettings,
    GameplayMessageData, Score, WordSubmittedMessageData, GameState
} from "./Types.tsx";
import { AblyMessageType, DragMode } from "./Types.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { Button } from "./ui/button.tsx";
import { RulesDialog } from "./RulesDialog.tsx";

interface GameManagerProps {
    gameId: string,
    initBoard: BoardConfiguration,
    roomCode: string,
    playersOrdered: SimplePlayerInfo[],
    onLeaveRoom: () => void,
}

const settings: GameSettings = {
    turnPhases: [DragMode.DragNDrop, DragMode.DragToSelect],
    numRounds: 5,
}

export default function GameManager({ gameId, initBoard, roomCode, playersOrdered, onLeaveRoom }: GameManagerProps) {
    const userId = useUserIdContext();
    const [boardConfig, setBoardConfig] = useState<BoardConfiguration>(initBoard);
    const [scores, setScores] = useState<Score[]>(
        playersOrdered.map(p => ({ userId: p.userId, score: 0 }))
    );
    const channelName = ablyChannelName(roomCode);
    const [latestMsg, setLatestMsg] = useState<GameplayMessageData>();
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState(0);
    const [phase, setPhase] = useState(0);
    const [gameFinished, setGameFinished] = useState<boolean>(false);

    useChannel(channelName, AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        setLatestMsg(msgData);
        if (msgData.isValid) {
            setBoardConfig(msgData.newBoard);
            setScores(msgData.newScores);
            handleAdvanceGameState();
        }
    });

    useChannel(channelName, AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        if (msgData.userId === userId) return; // client receives msg from API
        setLatestMsg(msgData);
        setBoardConfig(msgData.newBoard);
        handleAdvanceGameState();
    });

    function handleBoardChange(boardConfig: BoardConfiguration) {
        setBoardConfig(boardConfig);
    }

    const currTurnPhase = settings.turnPhases[phase];
    if (currTurnPhase == undefined) throw new Error('Turn phase is undefined');
    const gameState = {
        round: round, turn: turn, phase: phase,
        phaseType: currTurnPhase, isGameFinished: gameFinished,
        board: boardConfig
    } satisfies GameState;
    function handleAdvanceGameState() {
        if (phase + 1 < settings.turnPhases.length) {
            setPhase(prev => prev + 1);
        } else {
            setPhase(0);
            if (turn + 1 < playersOrdered.length) {
                setTurn(prev => prev + 1);
            } else {
                setTurn(0)
                if (round + 1 < settings.numRounds) {
                    setRound(prev => prev + 1);
                } else {
                    setGameFinished(true);
                }
            }
        }
        console.log(`${round} ${turn} ${phase}`)
    }

    const clientTurn = playersOrdered.findIndex(p => p.userId === userId);
    const isClientsTurn = turn === clientTurn && !gameFinished;
    const lastSubmittedWordMsg = latestMsg?.messageType === AblyMessageType.WordSubmitted ? latestMsg : undefined;

    return (
        <>
            <div className="flex space-x-1">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog />
            </div>
            {gameFinished ?
                <h2>Game Over!</h2> :
                <h2>Round {(round + 1).toString()}/{settings.numRounds.toString()}</h2>
            }
            <Board boardConfig={boardConfig} roomCode={roomCode}
                gameId={gameId} latestMsg={latestMsg} onBoardChange={handleBoardChange}
                isClientsTurn={isClientsTurn} dragMode={currTurnPhase} onAdvanceGameState={handleAdvanceGameState} />
            <Scoreboard playersOrdered={playersOrdered} scores={scores}
                isClientsTurn={isClientsTurn} gameState={gameState}
                lastSubmittedWordMsg={lastSubmittedWordMsg} />
        </>
    )


}