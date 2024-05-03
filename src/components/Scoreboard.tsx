
import { isEqual } from 'lodash';
import { useState } from "react";
import type { SimplePlayerInfo, Score, WordSubmittedMessageData } from "./Types";
import { DragMode } from "./Types";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { GameState } from './Types';


interface ScoreboardProps {
    playersOrdered: SimplePlayerInfo[],
    scores: Score[],
    gameState: GameState,
    lastSubmittedWordMsg: WordSubmittedMessageData | undefined,
}
export default function Scoreboard({ playersOrdered, scores,
    gameState, lastSubmittedWordMsg }: ScoreboardProps) {
    const [prevGameState, setPrevGameState] = useState<GameState>(gameState);
    const userId = useUserIdContext();
    const lastSubmittedWordPlayerName = playersOrdered.find(p => p.userId === lastSubmittedWordMsg?.userId)?.playerName;

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
        const name = lastSubmittedWordMsg?.userId === userId ? 'You' : lastSubmittedWordPlayerName;
        const word = lastSubmittedWordMsg?.word;
        const isValid = lastSubmittedWordMsg?.isValid;
        let wordScore;
        if (isValid) {
            wordScore = lastSubmittedWordMsg?.score;
        }
        if (name && word && isValid != undefined) {
            const msg = `${name} played ${word}`;
            const emoji = isValid ? '✅' : '❌';
            const score = wordScore != undefined ? `(+${wordScore})` : '';
            return `${emoji} ${msg} ${score}`;
        }
    }

    function instructionMessage() {
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

