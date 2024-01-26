import Board, { BoardConfiguration } from "./Board.tsx";
import { useUserIdContext } from "./hooks/useUserIdContext";
import { Button } from "./ui/button.tsx";

interface GameManagerProps {
    gameId: string,
    initBoard: BoardConfiguration,
    roomCode: string,
    onLeaveRoom: () => void,
}

export default function GameManager({gameId, initBoard, roomCode, onLeaveRoom} : GameManagerProps) {
    const userId = useUserIdContext();
    const duration = 10;

    return (
        <>
            {initBoard &&
                <>
                    <Button onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                    <Board initBoardConfig={initBoard} roomCode={roomCode} gameId={gameId} />
                </>
            }
        </>
    )


}