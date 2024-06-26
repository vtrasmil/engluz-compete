import { NUM_ROUNDS_PER_GAME } from "~/components/Constants";
import { type GameSettings, type GameState } from "~/components/Types";


const SETTINGS: GameSettings = {
    numRounds: NUM_ROUNDS_PER_GAME,
}
export default function advanceGameState(gameState: GameState) {
    if (gameState.round + 1 < SETTINGS.numRounds) {
        gameState.round += 1;
    } else {
        gameState.isGameFinished = true;
    }
}