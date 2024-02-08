
import { isEqual } from 'lodash';
import { useState } from "react";
import type { BasicPlayerInfo, Score, WordSubmittedMessageData } from "./Types";
import { DragMode } from "./Types";
import { useUserIdContext } from "./hooks/useUserIdContext";


interface ScoreboardProps {
    playersOrdered: BasicPlayerInfo[],
    scores: Score[],
    round: number,
    turn: number,
    isClientsTurn: boolean,
    gameState: GameState,
    lastSubmittedWordMsg: WordSubmittedMessageData | undefined,
}
export default function Scoreboard({ playersOrdered, scores,
    isClientsTurn, gameState, lastSubmittedWordMsg }: ScoreboardProps) {
    const [prevGameState, setPrevGameState] = useState<GameState>(gameState);
    // const currPlayer = playersOrdered[gameState.turn];
    const userId = useUserIdContext();
    const lastSubmittedWordPlayerName = playersOrdered.find(p => p.userId === lastSubmittedWordMsg?.userId)?.playerName;

    if (!isEqual(prevGameState, gameState)) {
        setPrevGameState(gameState);
    }

    function message() {
        if (isClientsTurn) {
            return (
                <>
                    <div>{lastSubmittedWordMessage()}</div>
                    <div>{instructionMessage()}</div>
                </>
            );
        } else {
            return (
                <div>{lastSubmittedWordMessage()}</div>
            );
        }
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
        if (gameState.phaseType === DragMode.DragNDrop) return 'Swap a pair of letters.';
        if (gameState.phaseType === DragMode.DragToSelect) return 'Select a word.';
    }


    function turnOrder() {
        return playersOrdered.map((p, i) => {
            const score = scores.find(s => s.userId === p.userId);
            if (gameState.gameFinished) {
                return (
                    <div key={p.userId} className="totalScores">
                        <span>{p.playerName}: {score?.score} point{score && score?.score > 1 && 's'}</span>
                    </div>
                )
            } else {
                return (
                    <div key={p.userId} className="turnOrder">
                        {gameState.turn === i && <span className="absolute left-[-70px]">►</span>}
                        {p.playerName}{gameState.gameFinished && <span>: {score?.score} point{score && score?.score > 1 && 's'}</span>}
                        {/* {p.playerName} {<span>: {score?.score}</span>} */}
                    </div>
                )
            }
        })
    }


    return (
        <>
            <div className="h-16">
                {message()}
            </div>
            <div id="scoreboard" className="relative">
                {gameState.gameFinished && <h2>Final Score:</h2>}
                {turnOrder()}
            </div>
        </>
    );
}

export type GameState = {
    round: number,
    turn: number,
    phase: number,
    phaseType: DragMode,
    gameFinished: boolean,
}