
import { DragMode } from "./Board";
import { BasicPlayerInfo, Score } from "./Types";


interface ScoreboardProps {
    playerInfos: BasicPlayerInfo[],
    scores: Score[],
    round: number,
    turn: number,
    isClientsTurn: boolean,
    gameState: GameState
}
export default function Scoreboard({ playerInfos, scores, round, turn,
    isClientsTurn, gameState }: ScoreboardProps) {

    const currPlayer = playerInfos[turn];

    return (
        <>
            <div className="h-16">
                {gameState.gameFinished &&
                    <h1>Game Over!</h1>
                }
                {!gameState.gameFinished && currPlayer && !isClientsTurn &&
                    <h1>Current Turn: {currPlayer.playerName}</h1>
                }
                {!gameState.gameFinished && isClientsTurn &&
                    <div>
                        <h1>Your Turn!</h1>
                        <div>
                            {gameState.phaseType === DragMode.DragNDrop && 'Swap a pair of letters'}
                            {gameState.phaseType === DragMode.DragToSelect && 'Select a word'}
                        </div>
                    </div>
                }
            </div>
            <div id="scoreboard" className="relative">
                {playerInfos.map((p, i) => {
                    const score = scores.find(s => s.userId === p.userId);
                    return (
                        <div key={p.userId} className="">
                            {turn === i && !gameState.gameFinished && <span className="absolute left-[70px]">►</span>}
                            {p.playerName} {gameState.gameFinished && <span>: {score?.score}</span>}
                            {/* {p.playerName} {<span>: {score?.score}</span>} */}
                        </div>
                    )
                })}
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