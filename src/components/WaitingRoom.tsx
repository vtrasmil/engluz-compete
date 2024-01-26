import { useState } from "react";
import { api } from "~/utils/api";
import { AblyMessageType, BoardConfiguration } from "./Board";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import GameManager from "./GameManager";
import { Button } from "./ui/button";
import { useChannel, usePresence } from "ably/react";
import { PlayerInfo } from "~/server/redis/api";
import { Checkbox } from "~/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { GameStartedMessageData } from "~/server/api/routers/gameplayRouter";


interface WaitingRoomProps {
    gameId: string,
    roomCode: string,
    playerInfo: PlayerInfo,
    onLeaveRoom: () => void;
}
export default function WaitingRoom({ gameId, roomCode, playerInfo, onLeaveRoom }: WaitingRoomProps) {
    const channelName = ablyChannelName(roomCode);

    const presenceObj = (status: string) => {
        return {
            readyStatus: status,
            playerName: playerInfo.playerName,
            userId: playerInfo.userId
        }
    }

    const { presenceData, updateStatus } = usePresence(channelName, presenceObj(ReadyOptions.NotReady));
    const [initBoard, setInitBoard] = useState<BoardConfiguration | undefined>();

    const startGame = api.lobby.startGame.useMutation({});

    function handleStartGame() {
        startGame.mutate({
            gameId: gameId,
            userId: playerInfo.userId,
            roomCode: roomCode,
        });
    }

    useChannel(channelName, AblyMessageType.GameStarted, (message) => {
        const msgData = message.data as GameStartedMessageData;
        // if (msgData.userId == playerInfo.userId) return;
        setInitBoard(msgData.initBoard);
    });

    function handleReadyToggle(checked: CheckedState) {
        if (checked) {
            updateStatus(presenceObj(ReadyOptions.Ready));
        } else {
            updateStatus(presenceObj(ReadyOptions.NotReady));
        }
    }

    const peers = presenceData.map((msg, index) => <li key={index}>{msg.data.playerName}: {msg.data.readyStatus}</li>);
    const allPlayersReady = (() => {
        const notReady = presenceData.find(p => p.data.readyStatus === ReadyOptions.NotReady);
        if (notReady == undefined) return true;
        return false;
    })();

    if (roomCode !== '' && initBoard && gameId) {
        return (
            <>
                <GameManager gameId={gameId} initBoard={initBoard} roomCode={roomCode}
                    onLeaveRoom={onLeaveRoom}
                />
            </>
        )
    } else {
        return (
            <>
                <div>Waiting for players. {roomCode} {gameId}</div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="ready-checkbox" onCheckedChange={handleReadyToggle} />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I&apos;m Ready
                    </label>
                </div>
                {peers}
                {playerInfo.isHost &&
                    <Button className="w-full bg-green-500"
                        disabled={!allPlayersReady}
                        onClick={handleStartGame}>
                        Start Game
                    </Button>
                }
                <Button className="w-full" variant="secondary"
                    onClick={onLeaveRoom}>
                    Leave Room
                </Button>

            </>
        )
    }

}

enum ReadyOptions {
    Ready = "Ready",
    NotReady = "Not Ready"
}