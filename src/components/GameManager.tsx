import { useState } from "react";
import GameOverModal from "./GameOverModal";
import Board from "./board";
import { api } from "~/utils/api";
import { useUserIdContext } from "./useUserIdContext";

interface GameManagerProps {
    gameId: string,
    initBoard: string,
}

export default function GameManager({gameId, initBoard} : GameManagerProps) {
    const userId = useUserIdContext();
    const duration = 10;
    const [letters, setLetters] = useState(initBoard);
    // const gameState = api.example.getGameState.useQuery({'gameId': gameId})
    const submitWord = api.gameplay.submitWord.useMutation();
    

    

    return (
        <>
            
            {/* {initBoard} */}
            {letters &&
                <Board onSubmitWord={handleSubmitLetters} config={letters} />
            }
            
            {false && <GameOverModal />}
            
            
            
        </>
    )

    function handleSubmitLetters(letters: number[]) {
        if (letters == undefined || letters.length < 3) return;
        submitWord.mutate({
            userId: userId,
            gameId: gameId,
            letterBlocks: letters
        })
        
    }
}