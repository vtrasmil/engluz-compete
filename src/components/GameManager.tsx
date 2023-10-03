import { LetterDieSchema } from "~/server/diceManager";
import Board from "./Board.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";

interface GameManagerProps {
    gameId: string,
    initBoard: LetterDieSchema[],
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