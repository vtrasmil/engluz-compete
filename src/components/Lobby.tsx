
import { api } from "~/utils/api";

import { useState, FormEvent, ChangeEvent } from "react";

// import { Button, TextField } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';


import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import LobbyJoined from "./LobbyJoined";


interface LobbyProps {
    userId: string,
}

export default function Lobby({ userId }: LobbyProps) {

    const [roomCode, setRoomCode] = useState('');
    const [storedRoomCode, setStoredRoomCode] = useSessionStorage('roomCode', '');
    const [gameId, setGameId] = useState<string>();

    const hostGame = api.lobby.hostGame.useMutation({
        onSuccess: (data) => {
            setStoredRoomCode(data.roomCode);
            setGameId(data.gameId);
        }
    });


    const joinGame = api.lobby.joinGame.useMutation({
        onSuccess: (data) => {
            setStoredRoomCode(data.roomCode);
            setGameId(data.gameId);
            hostGame.reset(); // TODO: is this useful anymore?
        }
    });

    function handleJoinGame(e: FormEvent) {
        e.preventDefault();
        // TODO: joinGame mutation gets called twice this way
        joinGame.mutate({
            roomCode: roomCode.toUpperCase(),
        });

    }

    function handleHostGame(e: FormEvent) {
        e.preventDefault();
        hostGame.mutate();
    }

    function handleLeaveRoom() {
        setStoredRoomCode('');
    }

    const isJoinGameDisabled = () => {
        return roomCode.length !== 4;
    };

    function handleRoomCodeInputChange(e: ChangeEvent<HTMLInputElement>) {
        setRoomCode(e.target.value.toUpperCase());
    }

    const roomCodeInputProps = {
        maxLength: 4,
        // onchange: handleRoomCodeInputChange,
    }

    function lobbyBody() {

        return (
            <div className="flex flex-col items-center m-3 space-y-6">
                <h1 className="text-2xl">WORDS WORDS WORDS</h1>
                <div className="space-y-8">
                    {gameId == undefined ?
                        lobbyStart() :
                        <LobbyJoined
                            gameId={gameId}
                            roomCode={storedRoomCode}
                            onLeaveRoom={handleLeaveRoom}
                        />}
                </div>
            </div>
        )

    }

    function lobbyStart() {
        return (
            <>
                <Button className="w-full bg-green-500" onClick={handleHostGame}>Host a Game</Button>
                <div className="flex items-center space-x-2">
                    <hr className="flex-grow border-zinc-200" />
                    <span className="text-zinc-400 text-sm">OR</span>
                    <hr className="flex-grow border-zinc-200 dark:border-zinc-700" />
                </div>
                <div>
                    <form className="w-full inline-flex gap-1" onSubmit={handleJoinGame}>
                        <Input className="w-[42%]" onChange={handleRoomCodeInputChange} placeholder="room code" maxLength={4}
                                    /* inputProps={roomCodeInputProps} */ value={roomCode} /* helperText={joinGame.error?.message} */ />
                        <Button className="w-[58%]" type="submit" disabled={roomCode.length !== 4 || hostGame.isLoading} variant="secondary">
                            Join Game
                        </Button>
                    </form>
                    {joinGame.isError &&
                        <div className="text-sm text-red-500">{joinGame.error.message}</div>}
                </div>
            </>
        );
    }

    return lobbyBody();
}


