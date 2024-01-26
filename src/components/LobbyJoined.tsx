import { useState } from "react";
import { api } from "~/utils/api";
import { BoardConfiguration } from "./Board";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import GameManager from "./GameManager";
import { Button } from "./ui/button";
import { usePresence } from "ably/react";

interface LobbyJoinedProps {
    gameId: string,
    roomCode: string,
    onLeaveRoom: () => void;
}
export default function LobbyJoined({ gameId, roomCode, onLeaveRoom }: LobbyJoinedProps) {
    const channelName = ablyChannelName(roomCode);


    const { presenceData, updateStatus } = usePresence(
        channelName, "initial state");
    const [initBoard, setInitBoard] = useState<BoardConfiguration | undefined>();

    const startGame = api.lobby.startGame.useMutation({
        onSuccess: (data) => {
            setInitBoard(data.board);
        }
    });

    const peers = presenceData.map((msg, index) => <li key={index}>{msg.clientId}: {msg.data}</li>);

    if (roomCode !== '' && initBoard && gameId) {
        return (
            <>
                <Button onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <GameManager gameId={gameId} initBoard={initBoard} roomCode={roomCode} />
            </>
        )
    } else {
        return (
            <>
                <div>Waiting for players. {roomCode} {gameId}</div>


                {peers}
            </>
        )
    }

}