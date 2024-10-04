import { type CheckedState } from "@radix-ui/react-checkbox";
import {usePresence, usePresenceListener} from "ably/react";
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ablyChannelName } from "~/server/ably/ablyHelpers";
import { api } from "~/utils/api";
import {
    type PlayerInfo,
    type RoomPlayerInfo,
} from "./Types";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";
import { RulesDialog } from "./RulesDialog";


interface WaitingRoomProps {
    basePlayer: PlayerInfo,
    roomCode: string,
    onLeaveRoom: () => void,
}
export default function WaitingRoom({ basePlayer, roomCode, onLeaveRoom }: WaitingRoomProps) {
    const channelName = ablyChannelName(roomCode);
    const [errorMsg, setErrorMsg] = useState<string | null>();

    const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);

    const startGameMutation = api.lobby.startGame.useMutation({
        onError: (e) => {
            setErrorMsg(e.message)
        },
    });

    function handleStartGame() {
        if (presencePlayers == undefined) {
            throw new Error('Player presence not found.')
        }
        startGameMutation.mutate({
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

    function handleReadyToggle(checked: CheckedState) {
        if (checked) {
            void updateStatus(createPresenceObj(ReadyOptions.Ready));
        } else {
            void updateStatus(createPresenceObj(ReadyOptions.NotReady));
        }
    }

    function createPresenceObj(status: ReadyOptions): RoomPlayerInfo {
        return {
            userId: basePlayer.userId,
            playerName: basePlayer.playerName,
            isHost: basePlayer.isHost,
            readyStatus: status,
        }
    }
    const { updateStatus } = usePresence(channelName, createPresenceObj(ReadyOptions.NotReady));
    const { presenceData } = usePresenceListener<RoomPlayerInfo>(channelName);
    const presencePlayers = presenceData.map((msg) => msg.data);
    const allPlayersReady = presenceData.length > 0 && presenceData.find(p => p.data.readyStatus === ReadyOptions.NotReady) == undefined;

    return (
        <div className="max-w-lg rounded-lg shadow-md bg-white p-6 space-y-6 border-gray-400 dark:border-gray-700">
            <div className="flex space-x-1 mb-6">
                <Button className="" onClick={onLeaveRoom} variant="secondary">Leave Room: {roomCode}</Button>
                <RulesDialog/>
            </div>
            <div className="space-y-6">
                <div className="flex items-center space-x-2 justify-center">
                    <Checkbox className="w-10 h-10"
                              id="ready-checkbox" onCheckedChange={handleReadyToggle}/>
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I&apos;m Ready
                    </label>
                </div>

                {basePlayer.isHost &&
                    <Button className="w-full bg-green-500"
                            disabled={!allPlayersReady || startGameMutation.isLoading}
                            onClick={handleStartGame}>
                        Start Game
                        {startGameMutation.isLoading && <Icons.spinner className="h-4 w-4 animate-spin ml-1"/>}
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
            {errorMsg != undefined &&
                <div className="text-sm text-red-500">{errorMsg}</div>
            }
        </div>
    )
}

export enum ReadyOptions {
    Ready = "Ready",
    NotReady = "Not Ready"
}

