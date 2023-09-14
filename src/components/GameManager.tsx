import { useState } from "react";
import GameOverModal from "./GameOverModal";
import Board from "./board";
import { api } from "~/utils/api";
import { useUserIdContext } from "./useUserIdContext";

interface GameManagerProps {
    gameId: string,
    initBoard: string,
    roomCode: string
}

export default function GameManager({gameId, initBoard, roomCode} : GameManagerProps) {
    const userId = useUserIdContext();
    const duration = 10;

    // const gameState = api.example.getGameState.useQuery({'gameId': gameId})



    return (
        <>
            {initBoard &&
                <Board config={initBoard} roomCode={roomCode} gameId={gameId} />
            }

            {/* {false && <GameOverModal />} */}



        </>
    )


}