import { useEffect, useState } from "react";
import GameOverModal from "./GameOverModal";
import Board from "./board";
import { exampleRouter } from "~/server/api/routers/example";
import { api } from "~/utils/api";


interface GameManagerProps {
    gameId: string,
    initBoard: string
}
export default function GameManager({gameId, initBoard} : GameManagerProps) {
    const duration = 10;
    const [letters, setLetters] = useState<string | undefined>();
    // const gameState = api.example.getGameState.useQuery({'gameId': gameId})


    useEffect(() => {
        
    }, []);

    return (
        <>
            
            {initBoard}
            {letters &&
                <Board letters={letters} />
            }
            
            {false && <GameOverModal />}
            
            
            
        </>
    )
}