import {
    type EndOfRoundMessageData,
    type GameState,
    RoundState,
    type Score,
    type SimplePlayerInfo,
    type WordSubmissionResponse,
    WordSubmissionState
} from "./Types";
import {Button} from "~/components/ui/button.tsx";
import {CountDownTimer} from "~/components/ui.tsx";


interface ScoreboardProps {
    playersOrdered: SimplePlayerInfo[],
    scores: Score[],
    gameState: GameState,
    roundState: RoundState,
    latestWordSubmission: WordSubmissionResponse | undefined,
    latestEndOfRoundMessage: EndOfRoundMessageData | undefined,
    onConfirmWord: () => void,
    wordSubmissionState: WordSubmissionState,
    onNextRound: () => void,
}
export default function Scoreboard({ playersOrdered, scores,
    gameState, roundState, latestWordSubmission, latestEndOfRoundMessage, onConfirmWord, wordSubmissionState,
    onNextRound,
}: ScoreboardProps) {
    // const userId = useUserIdContext();

    function message() {
        return (
            <>
                <div>{latestSubmittedWordMessage()}</div>
                <div>{timerMessage()}</div>
                <div>{instructionMessage()}</div>
            </>
        );
    }

    function latestSubmittedWordMessage() {
        if (latestWordSubmission != undefined && (wordSubmissionState === WordSubmissionState.Submitted || wordSubmissionState === WordSubmissionState.SubmitFailed)) {
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
            if (wordSubmissionState == WordSubmissionState.NotSubmitted) {
                return 'Drag to select a word.';
            }
            else if (wordSubmissionState == WordSubmissionState.Submitted) {
                return <Button className="" variant="secondary" onClick={onConfirmWord}>Confirm</Button>;
            } else if (wordSubmissionState == WordSubmissionState.Confirmed) {
                return <div>Waiting for other players...</div>
            } else return;
        } else if (roundState == RoundState.EndOfRound) {
            if (latestEndOfRoundMessage != undefined) {
                return latestEndOfRoundMessage.words.map((word) => {
                    const player = playersOrdered.find(p => p.userId === word.userId);
                    return <div key={player?.userId}>{player?.playerName}: {word.word} (+{word.score})</div>
                });
            }
        }
        if (gameState.isGameFinished) return;

    }

    function timerMessage() {
        if (latestEndOfRoundMessage != undefined && roundState == RoundState.EndOfRound && !gameState.isGameFinished) {
            return <div>
                Starting new round in... <CountDownTimer startDateTime={latestEndOfRoundMessage.dateTimePublished}
                                                         durationSeconds={2} onTimeUp={onNextRound}/>
            </div>;
        }
    }

    function scoresDisplay() {
        return playersOrdered.map(p => {
            const score = scores.find(s => s.userId === p.userId);
            if (gameState.isGameFinished) {
                return (
                    <div key={p.userId} className="totalScores">
                        <span>{p.playerName}: {score?.score} point{score && score?.score > 1 && 's'}</span>
                    </div>
                )
            } else {
                return (
                    <div key={p.userId} className="turnOrder">
                        {p.playerName} {<span>: {score?.score}</span>}
                    </div>
                )
            }
        })
    }

    return (
        <>
            <div className="h-16">
                {!gameState.isGameFinished && message()}
            </div>

            <div id="scoreboard" className="relative">
                {gameState.isGameFinished && <h2>Final Score:</h2>}
                {scoresDisplay()}
            </div>
        </>
    );
}

