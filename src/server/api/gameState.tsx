import { cloneDeep } from "lodash";
import { NUM_ROUNDS } from "~/components/Constants";
import { DragMode, GameSettings, GameState, PlayerInfo } from "~/components/Types";


const SETTINGS: GameSettings = {
    turnPhases: [DragMode.DragNDrop, DragMode.DragToSelect],
    numRounds: NUM_ROUNDS,
}
export default function advanceGameState(gameState: GameState, playersOrdered: PlayerInfo[]) {
    // const newGameState = cloneDeep(gameState);
    if (gameState.phase + 1 < SETTINGS.turnPhases.length) {
        gameState.phase += 1;
    } else {
        gameState.phase = 0;
        if (gameState.turn + 1 < playersOrdered.length) {
            gameState.turn += 1;
        } else {
            gameState.turn = 0;
            if (gameState.round + 1 < SETTINGS.numRounds) {
                gameState.round += 1;
            } else {
                gameState.isGameFinished = true;
            }
        }
    }
    const currTurnPhase = SETTINGS.turnPhases[gameState.phase];
    if (currTurnPhase != undefined) {
        gameState.phaseType = currTurnPhase;
    } else throw new Error('currTurnPhase is undefined');
}