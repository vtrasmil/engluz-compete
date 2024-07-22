import { NUM_ROUNDS_PER_GAME } from "~/components/Constants";
import {type GameState } from "~/components/Types";

export default function advanceGameState(gameState: GameState) {
    if (gameState.round + 1 < NUM_ROUNDS_PER_GAME) {
        gameState.round += 1;
    } else {
        gameState.isGameFinished = true;
    }
}