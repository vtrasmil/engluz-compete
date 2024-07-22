import {useChannel} from "ably/react";
import {useState} from "react";
import {ablyChannelName} from "~/server/ably/ablyHelpers.ts";
import Board from "./Board.tsx";
import Scoreboard from "./Scoreboard.tsx";
import {
    AblyMessageType,
    type BeginIntermissionMessageData, beginIntermissionMsgDataSchema,
    type GameState,
    RoundState,
    type Score,
    type SimplePlayerInfo,
    type WordSubmissionResponse,
    WordSubmissionState
} from "./Types.tsx";
import {useUserIdContext} from "./hooks/useUserIdContext";
import {Button} from "./ui/button.tsx";
import {RulesDialog} from "./RulesDialog.tsx";
import {NUM_ROUNDS_PER_GAME} from "./Constants.tsx";
import {api} from "~/utils/api.ts";
import {Types} from "ably";
import {validateSchema} from "~/utils/validator.tsx";

interface GameManagerProps {
    gameId: string,
    roomCode: string,
    playersOrdered: SimplePlayerInfo[],
    onLeaveRoom: () => void,
    initGameState: GameState,
    initRoundState: RoundState,
    initCurrRound: number,
    roundSegmentStartTime: number | undefined,
}

export default function GameManager({ gameId, roomCode, playersOrdered,
                                        onLeaveRoom, initGameState, initRoundState, initCurrRound, roundSegmentStartTime }: GameManagerProps) {
    const userId = useUserIdContext();
    const [scores, setScores] = useState<Score[]>(
        playersOrdered.map(p => ({ userId: p.userId, score: 0 }))
    );
    const channelName = ablyChannelName(roomCode);
    const [latestWordSubmission, setLatestWordSubmission] = useState<WordSubmissionResponse>();
    const [gameState, setGameState] = useState<GameState>(initGameState);
    const [roundState, setRoundState] = useState<RoundState>(initRoundState);
    const [latestEndOfRoundMessage, setLatestBeginIntermissionMessage] = useState<BeginIntermissionMessageData>();

    const [submittedCellIds, setSubmittedCellIds] = useState<number[]>([]);
    const [wordSubmissionState, setWordSubmissionState] = useState<WordSubmissionState>(WordSubmissionState.NotSubmitted);

    const submitWordMutation = api.gameplay.submitWord.useMutation({
        onMutate: () => {
            setWordSubmissionState(WordSubmissionState.Submitting)
        },
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
        onMutate: () => {
            setWordSubmissionState(WordSubmissionState.Confirming)
        },
        onSuccess: (data) => {
            setWordSubmissionState(WordSubmissionState.Confirmed);
            if (data) {
                triggerEndOfRoundAndPublishResultsMutation.mutate({
                    roomCode: roomCode,
                    userId: userId
                })
            }
        },
        onError: () => {
            setWordSubmissionState(WordSubmissionState.Submitted);
        },
    });

    const triggerEndOfRoundAndPublishResultsMutation = api.gameplay.triggerEndOfRoundAndPublishResults.useMutation();

    const gameInfoQuery = api.lobby.fetchGameInfo.useQuery({ roomCode: roomCode, userId: userId}); // TODO: I imagine this is being called way too often

    useChannel(channelName, AblyMessageType.BeginIntermission, (message) => {
        const result = validateSchema({dto: message.data, schemaName: 'beginIntermissionMsgDataSchema', schema: beginIntermissionMsgDataSchema});
        setLatestBeginIntermissionMessage(result);
        setRoundState(RoundState.Intermission);
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

    function handleEndOfRoundTimeUp() {
        triggerEndOfRoundAndPublishResultsMutation.mutate({
            roomCode: roomCode,
            userId: userId,
        })
    }

    // when timer finishes
    function handleNextRound() {
        let gameInfo;
        if (latestEndOfRoundMessage != undefined && gameInfoQuery.dataUpdatedAt < latestEndOfRoundMessage.dateTimePublished) {
            gameInfo = latestEndOfRoundMessage.game;
        } else if (gameInfoQuery.data != undefined) {
            gameInfo = gameInfoQuery.data;
        }
        if (gameInfo) {
            setGameState(gameInfo.state);
            setScores(gameInfo.scores);
            if (gameInfo.state.isGameFinished) {
                setRoundState(RoundState.GameFinished);
            }
            else {
                setWordSubmissionState(WordSubmissionState.NotSubmitted);
                setRoundState(RoundState.WordSelection);
            }
            setLatestBeginIntermissionMessage(undefined);
        }
    }

    return (
        <>
            <div className="flex space-x-1 mb-6">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog />
            </div>
            {gameState.isGameFinished ?
                <h2>Game Over!</h2> :
                <h2>{`Round ${gameState.round + 1}/${NUM_ROUNDS_PER_GAME}`}</h2>
            }
            {!gameState.isGameFinished &&
                <Board boardConfig={gameState.board} roomCode={roomCode} onSubmitWord={handleSubmitWord}
                   wordSubmissionState={wordSubmissionState} onReselecting={handleReselecting} roundState={roundState} />
            }

            <Scoreboard playersOrdered={playersOrdered} scores={scores} gameState={gameState} roundState={roundState}
                        latestWordSubmission={latestWordSubmission} latestEndOfRoundMessage={latestEndOfRoundMessage}
                        onConfirmWord={handleConfirmWord} wordSubmissionState={wordSubmissionState}
                        onNextRound={handleNextRound} onEndOfRoundTimeUp={handleEndOfRoundTimeUp}
                        roundSegmentStartTime={roundSegmentStartTime}
            />

        </>
    )


}