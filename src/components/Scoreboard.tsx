import {isEqual} from 'lodash';
import {useState} from "react";
import {
    AblyMessageType, GameEventMessageData,
    GameplayMessageData,
    GameState,
    Score,
    SimplePlayerInfo, WordConfirmedMessageData,
    WordSubmittedMessageData
} from "./Types";
import {useUserIdContext} from "./hooks/useUserIdContext";
import {Button} from "~/components/ui/button.tsx";


interface ScoreboardProps {
    playersOrdered: SimplePlayerInfo[],
    scores: Score[],
    gameState: GameState,
    latestMsg: GameplayMessageData | GameEventMessageData | undefined,
    onConfirmWord: () => void,
}
export default function Scoreboard({ playersOrdered, scores,
    gameState, latestMsg }: ScoreboardProps) {
    const [prevGameState, setPrevGameState] = useState<GameState>(gameState);
    const userId = useUserIdContext();

    if (!isEqual(prevGameState, gameState)) {
        setPrevGameState(gameState);
    }

    function message() {
        return (
            <>
                <div>{lastSubmittedWordMessage()}</div>
                <div>{instructionMessage()}</div>
            </>
        );
    }

    function lastSubmittedWordMessage() {
        // const name = latestMsg?.userId === userId ? 'You' : lastSubmittedWordPlayerName;
        if (latestMsg == undefined) return 'Starting';
        if (latestMsg.messageType === AblyMessageType.WordSubmitted) {
            const word = latestMsg.word;
            const isValid = latestMsg.isValid;
            let wordScore, msg, emoji;
            if (isValid) {
                wordScore = latestMsg?.score;
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
        if (latestMsg?.messageType === AblyMessageType.WordSubmitted && latestMsg.isValid) {
            return <div><Button>Confirm</Button></div>;
        } else if (latestMsg?.messageType === AblyMessageType.WordConfirmed) {
            <div>Waiting for other players...</div>
        } else if (latestMsg?.messageType === AblyMessageType.AllWordsConfirmed) {
            <div>All players have confirmed their words.</div>
        }
        if (gameState.isGameFinished) return;
        return 'Select a word.';
    }

    function turnOrder() {
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
                {turnOrder()}
            </div>
        </>
    );
}

