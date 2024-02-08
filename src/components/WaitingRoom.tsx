import { CheckedState } from "@radix-ui/react-checkbox";
import { useChannel, usePresence } from "ably/react";
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { GameStartedMessageData } from "./Types";
import { api } from "~/utils/api";
import GameManager from "./GameManager";
import { AblyMessageType, BasePlayerInfo, BasicPlayerInfo, BoardConfiguration, RoomPlayerInfo } from "./Types";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";
import { RulesDialog } from "./RulesDialog";


interface WaitingRoomProps {
    basePlayer: BasePlayerInfo,
    gameId: string,
    roomCode: string,
    onLeaveRoom: () => void;
}
export default function WaitingRoom({ basePlayer, gameId, roomCode, onLeaveRoom }: WaitingRoomProps) {
    const channelName = ablyChannelName(roomCode);
    const [initBoard, setInitBoard] = useState<BoardConfiguration | undefined>();
    const startGameMutation = api.lobby.startGame.useMutation({});
    const [playersOrdered, setPlayersOrdered] = useState<BasicPlayerInfo[]>();
    const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

    function handleStartGame() {
        if (presencePlayers == undefined) {
            throw new Error('Player presence not found.')
        }
        startGameMutation.mutate({
            gameId: gameId,
            userId: basePlayer.userId,
            roomCode: roomCode,
            players: presencePlayers.map(p => {
                return {
                    userId: p.userId,
                    playerName: p.playerName,
                }
            }),
        });




    }

    useChannel(channelName, AblyMessageType.GameStarted, (message) => {
        const msgData = message.data as GameStartedMessageData;
        // if (msgData.userId == playerInfo.userId) return;
        setInitBoard(msgData.initBoard);
        setHasGameStarted(true);
        setPlayersOrdered(msgData.players);
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
        if (roomCode !== '' && initBoard && gameId && playersOrdered) {
            return (
                <GameManager gameId={gameId} initBoard={initBoard} roomCode={roomCode}
                    playersOrdered={playersOrdered}
                />
            )
        } else {
            return (
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 justify-center">
                        <Checkbox className="w-10 h-10"
                            id="ready-checkbox" onCheckedChange={handleReadyToggle} />
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
                            {startGameMutation.isLoading && <Icons.spinner className="h-4 w-4 animate-spin ml-1" />}
                        </Button>
                    }

                    {!hasGameStarted &&
                        <>
                            {allPlayersReady ?
                                <div>Waiting for host to start... </div> :
                                <div>Waiting for players... </div>}
                            {presencePlayers.map(p => (
                                <div key={p.userId}>
                                    {p.playerName}: {p.readyStatus}
                                </div>
                            ))}
                        </>
                    }
                </div>
            )
        }
    }

    return (
        <>
            <div className="flex space-x-1">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog />
            </div>
            {waitingOrGame()}
        </>
    )

}



export enum ReadyOptions {
    Ready = "Ready",
    NotReady = "Not Ready"
}

