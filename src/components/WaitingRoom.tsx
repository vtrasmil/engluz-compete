import { useState } from "react";
import { api } from "~/utils/api";
import { AblyMessageType, BoardConfiguration } from "./Board";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import GameManager from "./GameManager";
import { Button } from "./ui/button";
import { useChannel, usePresence } from "ably/react";
import { Checkbox } from "~/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { GameStartedMessageData } from "~/server/api/routers/gameplayRouter";
import { BasePlayerInfo, GamePlayerInfo, RoomPlayerInfo } from "./Types";


interface WaitingRoomProps {
    basePlayer: BasePlayerInfo,
    gameId: string,
    roomCode: string,
    onLeaveRoom: () => void;
}
export default function WaitingRoom({ basePlayer, gameId, roomCode, onLeaveRoom }: WaitingRoomProps) {
    const channelName = ablyChannelName(roomCode);
    const [initBoard, setInitBoard] = useState<BoardConfiguration | undefined>();
    const startGame = api.lobby.startGame.useMutation({});
    const [startingPlayers, setStartingPlayers] = useState<GamePlayerInfo[]>();
    const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

    function handleStartGame() {
        startGame.mutate({
            gameId: gameId,
            userId: basePlayer.userId,
            roomCode: roomCode,
        });
        // save players
        const startingPresencePlayers: GamePlayerInfo[] = presencePlayers.map(p => {
            return {
                userId: p.userId,
                playerName: p.playerName,
                isHost: p.isHost,
                readyStatus: p.readyStatus,
                score: 0,
            }
        });
        setStartingPlayers(startingPresencePlayers);
        setHasGameStarted(true);

    }

    useChannel(channelName, AblyMessageType.GameStarted, (message) => {
        const msgData = message.data as GameStartedMessageData;
        // if (msgData.userId == playerInfo.userId) return;
        setInitBoard(msgData.initBoard);
    });

    function handleReadyToggle(checked: CheckedState) {
        if (checked) {
            updateStatus(createPresenceObj(ReadyOptions.Ready));
        } else {
            updateStatus(createPresenceObj(ReadyOptions.NotReady));
        }
    }

    // basePlayerInfo.map(bpi => { return { ...bpi, readyStatus: ReadyOptions.NotReady } })

    function createPresenceObj(status: ReadyOptions): RoomPlayerInfo {
        return {
            userId: basePlayer.userId,
            playerName: basePlayer.playerName,
            isHost: basePlayer.isHost,
            readyStatus: status,
        }
    }
    const { presenceData, updateStatus } = usePresence(channelName, createPresenceObj(ReadyOptions.NotReady));
    const presencePlayers = presenceData.map((msg) => msg.data);
    const allPlayersReady = (() => {
        const notReady = presenceData.find(p => p.data.readyStatus === ReadyOptions.NotReady);
        if (notReady == undefined) return true;
        return false;
    })();

    function waitingOrGame() {
        if (roomCode !== '' && initBoard && gameId) {
            return (
                <>
                    <GameManager gameId={gameId} initBoard={initBoard} roomCode={roomCode}
                        roomPlayerInfos={presencePlayers}
                    />
                </>
            )
        } else {
            return (
                <>
                    <div>Waiting for players... </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ready-checkbox" onCheckedChange={handleReadyToggle} />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I&apos;m Ready
                        </label>
                    </div>

                    {basePlayer.isHost &&
                        <Button className="w-full bg-green-500"
                            disabled={!allPlayersReady}
                            onClick={handleStartGame}>
                            Start Game
                        </Button>
                    }
                    <div>
                        {!hasGameStarted && presencePlayers.map(p => (
                            <div key={p.userId}>
                                {p.playerName}: {p.readyStatus}
                            </div>
                        ))}
                    </div>
                </>
            )
        }
    }

    return (
        <>
            <Button onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
            {waitingOrGame()}
        </>
    )

}



export enum ReadyOptions {
    Ready = "Ready",
    NotReady = "Not Ready"
}

