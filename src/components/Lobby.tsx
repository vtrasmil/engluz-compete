
import { api } from "~/utils/api";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";

// import { Button, TextField } from "@mui/material";


import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Icons } from "./ui/icons";
import { RulesDialog } from "./RulesDialog";
import { useRouter } from "next/router";
import { useSessionStorage } from "@react-hooks-library/core";
import { SessionInfo } from "./Types";


interface LobbyProps {
    userId: string,
    onSetSessionInfo: (playerName: string, isHost: boolean, roomCode: string) => void,
}

export default function Lobby({ userId, onSetSessionInfo }: LobbyProps) {
    const router = useRouter();
    const [sessionInfo, setSessionInfo] = useSessionStorage<SessionInfo | undefined>('sessionInfo', undefined);

    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [gameId, setGameId] = useState<string>();
    const [isHost, setIsHost] = useState<boolean>(false);
    // const [hostGameErrorMsg, setHostGameErrorMsg] = useState<string | undefined>();

    const hostGameMutation = api.lobby.hostGame.useMutation({
        onSuccess: (data) => {
            setSessionInfo({
                playerName: playerName,
                isHost: true,
                roomCode: data.roomCode
            });
        },
        onError: (e) => {
            // setHostGameErrorMsg(e.message);
        }
    });

    const joinGameMutation = api.lobby.joinGame.useMutation({
        onSuccess: (data) => {
            setSessionInfo({
                playerName: playerName,
                isHost: false,
                roomCode: data.roomCode
            });
            hostGameMutation.reset();
        }
    });

    useEffect(() => {
        if (sessionInfo?.roomCode != undefined) {
            void router.push(`/${sessionInfo.roomCode}`);
        }
    }, [sessionInfo, router])

    function handleJoinGame(e: FormEvent) {
        e.preventDefault();
        joinGameMutation.mutate({
            roomCode: roomCode.toUpperCase(),
            userId: userId,
            playerName: playerName,
        });
    }

    function handleHostGame(e: FormEvent) {
        e.preventDefault();
        hostGameMutation.mutate({
            userId: userId,
            playerName: playerName,
        });
        joinGameMutation.reset(); // clear any join game errors
    }

    function handleRoomCodeInputChange(e: ChangeEvent<HTMLInputElement>) {
        setRoomCode(e.target.value.toUpperCase());
    }

    function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
        setPlayerName(e.target.value);
    }

    function lobbyBody() {

        return (
            <div id="lobby" className="flex flex-col items-center m-3 space-y-6 w-80">
                <h1 className="text-2xl">Big Words</h1>
                {gameId == undefined &&
                    <>
                        <div>A mind-boggling, multiplayer word search.</div>
                        <RulesDialog />
                    </>
                }


                <>
                    {lobbyStart()}
                </>
            </div>
        )

    }

    function lobbyStart() {
        return (
            <div className="space-y-6 w-95">
                <Input className="w-full" onChange={handleNameChange} placeholder="Enter your name" maxLength={12} />
                <div>
                    <form className="w-full inline-flex gap-1" onSubmit={handleJoinGame}>
                        <Input className="w-5/12" onChange={handleRoomCodeInputChange} placeholder="room code" maxLength={4}
                                    /* inputProps={roomCodeInputProps} */ value={roomCode} /* helperText={joinGame.error?.message} */ />
                        <Button className="w-7/12" type="submit"
                            disabled={roomCode.length !== 4 || hostGameMutation.isLoading || playerName.length < 1}
                            variant="secondary">
                            Join Game
                            {joinGameMutation.isLoading && <Icons.spinner className="h-4 w-4 animate-spin ml-1" />}
                        </Button>
                    </form>
                    {joinGameMutation.isError &&
                        <div className="text-sm text-red-500">{joinGameMutation.error.message}</div>}
                </div>
                <div className="flex items-center space-x-2">
                    <hr className="flex-grow border-zinc-200" />
                    <span className="text-zinc-400 text-sm">OR</span>
                    <hr className="flex-grow border-zinc-200 dark:border-zinc-700" />
                </div>
                <Button className="w-full bg-green-500"
                    disabled={playerName.length < 1}
                    onClick={handleHostGame}>
                    Host a Game
                    {hostGameMutation.isLoading && <Icons.spinner className="h-4 w-4 animate-spin ml-1" />}
                </Button>
                <div className="text-sm text-red-500">{hostGameMutation.error?.message}</div>


            </div>
        );
    }

    return lobbyBody();
}


