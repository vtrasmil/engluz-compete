import { cloneDeep } from "lodash";
import { NUM_ROUNDS } from "~/components/Constants";
import { DragMode, GameSettings, GameState, PlayerInfo } from "~/components/Types";


const SETTINGS: GameSettings = {
    numRounds: NUM_ROUNDS,
}
export default function advanceGameState(gameState: GameState) {
    if (gameState.round + 1 < SETTINGS.numRounds) {
        gameState.round += 1;
    } else {
        gameState.isGameFinished = true;
    }
}