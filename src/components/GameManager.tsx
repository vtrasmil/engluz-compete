import {useChannel} from "ably/react";
import {useState} from "react";
import {ablyChannelName} from "~/server/ably/ablyHelpers.ts";
import Board from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import {
    AblyMessageType,
    RoundScoreMessageData,
    GameEventMessageData,
    GameplayMessageData,
    GameState,
    RoundState,
    Score,
    SimplePlayerInfo,
    WordSubmissionState, WordSubmissionResponse
} from "./Types.tsx";
import {useUserIdContext} from "./hooks/useUserIdContext";
import {Button} from "./ui/button.tsx";
import {RulesDialog} from "./RulesDialog.tsx";
import {NUM_ROUNDS} from "./Constants.tsx";
import {api} from "~/utils/api.ts";

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
    const [latestWordSubmission, setLatestWordSubmission] = useState<WordSubmissionResponse>();
    const [gameState, setGameState] = useState<GameState>(gameStateProp);
    const [roundState, setRoundState] = useState<RoundState>(RoundState.WordSelection);
    const [latestRoundScoreMessage, setLatestRoundScoreMessage] = useState<RoundScoreMessageData>();

    const [submittedCellIds, setSubmittedCellIds] = useState<number[]>([]);
    const [isWordConfirmed, setIsWordConfirmed] = useState(false);
    const [wordSubmissionState, setWordSubmissionState] = useState<WordSubmissionState>(WordSubmissionState.NotSubmitted);

    const submitWordMutation = api.gameplay.submitWord.useMutation({
        onMutate: (data => {
            setWordSubmissionState(WordSubmissionState.Submitting)
        }),
        onSuccess: (data: WordSubmissionResponse) => {
            if (data.isValid) {
                setWordSubmissionState(WordSubmissionState.Submitted);
                setSubmittedCellIds(data.cellIds);
            } else {
                setWordSubmissionState(WordSubmissionState.SubmitFailed);
            }
            setLatestWordSubmission(data);
        },
        // onError: (err) => {
        //
        // },
    });

    const confirmWordMutation = api.gameplay.confirmWord.useMutation({
        onMutate: (data => {
            setWordSubmissionState(WordSubmissionState.Confirming)
        }),
        onSuccess: (data) => {
            setWordSubmissionState(WordSubmissionState.Confirmed);
        },
        onError: (err) => {
            setWordSubmissionState(WordSubmissionState.Submitted);
        },
    });

    useChannel(channelName, AblyMessageType.RoundScore, (message) => {
        const msgData = (message.data satisfies RoundScoreMessageData) as RoundScoreMessageData;
        setLatestRoundScoreMessage(msgData);
        setRoundState(RoundState.ScorePresentation);
    })

    function handleSubmitWord(cellIds: number[]) {
        if (wordSubmissionState === WordSubmissionState.NotSubmitted || wordSubmissionState === WordSubmissionState.SubmitFailed ) {
        submitWordMutation.mutate({
            userId: userId,
            gameId: gameId,
            roomCode: roomCode,
            cellIds: cellIds,
        })}
    }

    function handleReselecting() {
        setWordSubmissionState(WordSubmissionState.NotSubmitted);
    }

    function handleConfirmWord() {
        if (submittedCellIds.length > 0 && wordSubmissionState == WordSubmissionState.Submitted) {
            confirmWordMutation.mutate({
                userId: userId,
                gameId: gameId,
                roomCode: roomCode,
                cellIds: submittedCellIds,
            })
        }
    }

    /*const lastSubmittedWordMsg = latestMsg?.messageType === AblyMessageType.WordSubmitted ? latestMsg : undefined;
    const lastConfirmedWordMsg = latestMsg?.messageType === AblyMessageType.WordConfirmed ? latestMsg : undefined;
    const lastAllWordsConfirmedMsg = latestMsg?.messageType === AblyMessageType.AllWordsConfirmed ? latestMsg : undefined;*/


    return (
        <>
            <div className="flex space-x-1 mb-6">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog />
            </div>
            {gameState.isGameFinished ?
                <h2>Game Over!</h2> :
                <h2>Round {(gameState.round + 1).toString()}/{NUM_ROUNDS.toString()}</h2>
            }
            <Board boardConfig={gameState.board} roomCode={roomCode} onSubmitWord={handleSubmitWord}
               wordSubmissionState={wordSubmissionState} onReselecting={handleReselecting} />

            <Scoreboard playersOrdered={playersOrdered} scores={scores} gameState={gameState} roundState={roundState}
                        latestWordSubmission={latestWordSubmission} latestRoundScoreMessage={latestRoundScoreMessage}
                        onConfirmWord={handleConfirmWord} wordSubmissionState={wordSubmissionState} />
        </>
    )


}