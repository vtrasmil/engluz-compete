import { useState } from "react";
import Board, { AblyMessageType, BoardConfiguration, DragMode } from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { BasicPlayerInfo, GameSettings, SubmittedWordInfo } from "./Types.tsx";
import { useChannel } from "ably/react";
import { ablyChannelName } from "~/server/ably/ablyHelpers.ts";
import { DiceSwappedMessageData, MessageData, WordSubmittedMessageData } from "~/server/api/routers/gameplayRouter.ts";
import { Score } from "./Types.tsx";

interface GameManagerProps {
    gameId: string,
    initBoard: BoardConfiguration,
    roomCode: string,
    playersOrdered: BasicPlayerInfo[],
}

const settings: GameSettings = {
    turnPhases: [DragMode.DragNDrop, DragMode.DragToSelect],
    numRounds: 5,
}

export default function GameManager({ gameId, initBoard, roomCode, playersOrdered }: GameManagerProps) {
    const userId = useUserIdContext();
    const duration = 10;
    const [boardConfig, setBoardConfig] = useState<BoardConfiguration>(initBoard);
    const [scores, setScores] = useState<Score[]>(
        playersOrdered.map(p => ({ userId: p.userId, score: 0 }))
    );
    const channelName = ablyChannelName(roomCode);
    const [latestMsg, setLatestMsg] = useState<MessageData>();
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState(0);
    const [phase, setPhase] = useState(0);
    const [gameFinished, setGameFinished] = useState<boolean>(false);
    const [lastSubmittedWordInfo, setLastSubmittedWordInfo] = useState<SubmittedWordInfo>();

    useChannel(channelName, AblyMessageType.WordSubmitted, (message) => {
        const msgData = message.data as WordSubmittedMessageData;
        setLatestMsg(msgData);
        setLastSubmittedWordInfo({
            userId: msgData.userId,
            cellIds: msgData.sourceCellIds,
            word: msgData.wordSubmitted,
            isValid: msgData.isWordValid
        });
        if (msgData.isWordValid) {
            setBoardConfig(msgData.newBoard);
            setScores(msgData.newScores);
            advanceGameState();
        }
        else {

        }

    });

    useChannel(channelName, AblyMessageType.DiceSwapped, (message) => {
        const msgData = message.data as DiceSwappedMessageData;
        setLatestMsg(msgData);
        // if (msgData.userId == userId) return;
        setBoardConfig(msgData.newBoard);
        advanceGameState();
    });

    function handleBoardChange(boardConfig: BoardConfiguration) {
        setBoardConfig(boardConfig);
    }

    const currTurnPhase = settings.turnPhases[phase];
    if (currTurnPhase == undefined) throw new Error('Turn phase is undefined');
    const gameState = {
        round: round, turn: turn, phase: phase,
        phaseType: currTurnPhase, gameFinished: gameFinished
    };
    function advanceGameState() {
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
    }

    const clientTurn = playersOrdered.findIndex(p => p.userId === userId);
    const isClientsTurn = turn === clientTurn && !gameFinished;

    return (
        <>
            {gameFinished ?
                <h2>Game Over!</h2> :
                <h2>Round {(round + 1).toString()}/{settings.numRounds.toString()}</h2>
            }
            <Board boardConfig={boardConfig} roomCode={roomCode}
                gameId={gameId} latestMsg={latestMsg} onBoardChange={handleBoardChange}
                isClientsTurn={isClientsTurn} dragMode={currTurnPhase} />
            <Scoreboard playersOrdered={playersOrdered} scores={scores}
                round={round} turn={turn} isClientsTurn={isClientsTurn}
                gameState={gameState} lastSubmittedWordInfo={lastSubmittedWordInfo} />
        </>
    )


}