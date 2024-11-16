import {
    type BeginIntermissionMessageData,
    type GameState,
    RoundState,
    type Score,
    type SimplePlayerInfo, type WordSubmissionResponse,
    WordSubmissionState
} from "./Types";
import {Button} from "~/components/ui/button.tsx";
import {VisualTimer} from "~/components/VisualTimer.tsx";
import {useState} from "react";
import {INTERMISSION_DURATION, ROUND_DURATION} from "~/components/Constants.tsx";
import {WordSelectionBox} from "~/components/WordSelection.tsx";


interface ScoreboardProps {
    playersOrdered: SimplePlayerInfo[],
    scores: Score[],
    gameState: GameState,
    roundState: RoundState,
    latestWordSubmission: WordSubmissionResponse | null | undefined,
    latestBeginIntermissionMessage: BeginIntermissionMessageData | null | undefined,
    onConfirmWord: () => void,
    wordSubmissionState: WordSubmissionState,
    timeLastRoundOver: number | null,
    gameTimeStarted: number,
    onBeginWordSelection: () => void,
    onEndOfRoundTimeUp: () => void,
    wordSelectionSoFar: string,
}
export default function Scoreboard({ playersOrdered, scores,
    gameState, roundState, latestWordSubmission, latestBeginIntermissionMessage, onConfirmWord, wordSubmissionState,
    timeLastRoundOver, gameTimeStarted, onBeginWordSelection, onEndOfRoundTimeUp, wordSelectionSoFar
}: ScoreboardProps) {
    // const userId = useUserIdContext();
    const [prevRoundState, setPrevRoundState] = useState<RoundState>();

    function message() {
        return (
            <>
                {roundState === RoundState.WordSelection &&
                    <WordSelectionBox wordSoFar={wordSelectionSoFar} latestWordSubmission={latestWordSubmission} wordSubmissionState={wordSubmissionState}  />
                }
                <div>{instructionMessage()}</div>
            </>
        );
    }

    function latestSubmittedWordMessage() {
        if (latestWordSubmission != undefined) {
            const word = latestWordSubmission.wordSubmitted;
            const isValid = latestWordSubmission.isValid;
            let wordScore, msg, emoji;
            if (isValid) {
                wordScore = latestWordSubmission.score;
                msg = `You found ${word}!`;
                emoji = '✅';
            } else {
                msg = `${word} is not a word.`
                emoji = '❌';
            }
            const score = wordScore != undefined ? `(${wordScore} points)` : '';
            return `${emoji} ${msg} ${score}`;
        }
    }

    function instructionMessage() {
        if (roundState == RoundState.WordSelection) {
            if (wordSubmissionState == WordSubmissionState.NotSubmitted && wordSelectionSoFar === '') {
                return 'Drag to select a word.';
            }
            else if (wordSubmissionState == WordSubmissionState.Submitted) {
                return <Button className="mt-1 bg-green-500 border" onClick={onConfirmWord}>Confirm?</Button>;
            } else if (wordSubmissionState == WordSubmissionState.Confirmed) {
                return <div>Waiting for other players...</div>
            } else return;
        } else if (roundState == RoundState.Intermission) {
            if (latestBeginIntermissionMessage == undefined) return;
            if (latestBeginIntermissionMessage.words.length > 0) {
                return latestBeginIntermissionMessage.words.map((word) => {
                    const player = playersOrdered.find(p => p.userId === word.userId);
                    return <div key={player?.userId}>{player?.playerName}: {word.word} (+{word.score})</div>
                })
            } else {
                return 'No player confirmed a word.'
            }
        }

        if (gameState.isGameFinished) return;

    }

    function scoresDisplay() {
        return playersOrdered.map(p => {
            const score = scores.find(s => s.userId === p.userId);
            if (gameState.isGameFinished) {
                return (
                    <div key={p.userId} className="totalScores">
                        <span>{p.playerName}: {score?.score} point{score && (score?.score > 1 || score?.score == 0) && 's'}</span>
                    </div>
                )
            }
        })
    }

    // set timer when round state changes
    if (prevRoundState != roundState) {
        setPrevRoundState(roundState);
    }

    return (
        <>
            {!gameState.isGameFinished &&
                <div className="h-28">
                     {message()}
                </div>
            }

            <div id="scoreboard" className="relative">
                {gameState.isGameFinished && <h2>Final Score:</h2>}
                {scoresDisplay()}
            </div>
            {roundState == RoundState.WordSelection &&
                <VisualTimer durationMs={ROUND_DURATION} onTimeUp={onEndOfRoundTimeUp} initStartTime={timeLastRoundOver == null ? gameTimeStarted : timeLastRoundOver + INTERMISSION_DURATION}  /> //TODO: last prop
            }
            {roundState == RoundState.Intermission && timeLastRoundOver !== null &&
                <VisualTimer durationMs={INTERMISSION_DURATION} onTimeUp={onBeginWordSelection} initStartTime={timeLastRoundOver}  /> //TODO: last prop
            }
        </>
    );
}

