import {
    GameState,
    RoundScoreMessageData,
    RoundState,
    Score,
    SimplePlayerInfo,
    WordSubmissionResponse,
    WordSubmissionState
} from "./Types";
import {useUserIdContext} from "./hooks/useUserIdContext";
import {Button} from "~/components/ui/button.tsx";


interface ScoreboardProps {
    playersOrdered: SimplePlayerInfo[],
    scores: Score[],
    gameState: GameState,
    roundState: RoundState,
    latestWordSubmission: WordSubmissionResponse | undefined,
    latestRoundScoreMessage: RoundScoreMessageData | undefined,
    onConfirmWord: () => void,
    wordSubmissionState: WordSubmissionState,
}
export default function Scoreboard({ playersOrdered, scores,
    gameState, latestWordSubmission, latestRoundScoreMessage, onConfirmWord, wordSubmissionState }: ScoreboardProps) {
    const userId = useUserIdContext();

    function message() {
        return (
            <>
                <div>{latestSubmittedWordMessage()}</div>
                <div>{instructionMessage()}</div>
            </>
        );
    }

    function latestSubmittedWordMessage() {
        // const name = latestMsg?.userId === userId ? 'You' : lastSubmittedWordPlayerName;
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
        if (wordSubmissionState == WordSubmissionState.Submitted) {
            return <Button className="" variant="secondary" onClick={onConfirmWord}>Confirm</Button>;
        } else if (wordSubmissionState == WordSubmissionState.Confirmed) {
            return <div>Waiting for other players...</div>
        } else if (latestRoundScoreMessage != undefined) {
            return <div>All players have confirmed their words.</div>
        }
        if (gameState.isGameFinished) return;
        return 'Select a word.';
    }

    function scoresDisplay() {
        return playersOrdered.map((p, i) => {
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

