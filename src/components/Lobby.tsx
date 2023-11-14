
import { api } from "~/utils/api";

import { useState, FormEvent, ChangeEvent } from "react";

// import { Button, TextField } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';
import GameManager from "~/components/GameManager";
import { BoardConfiguration } from "./Board";


import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";


interface LobbyProps {
    userId: string,
}

export default function Lobby({userId}: LobbyProps) {

    const [roomCode, setRoomCode] = useState('');
    const [storedRoomCode, setStoredRoomCode] = useSessionStorage('roomCode', '');
    const [gameId, setGameId] = useState<string>();
    const [initBoard, setInitBoard] = useState<BoardConfiguration | undefined>();
    const joinGame = api.lobby.joinGame.useMutation({
        onSuccess: (data) => {
            setStoredRoomCode(data.roomCode);
            setGameId(data.gameId);
            setInitBoard(data.board);
            hostGame.reset();
        }
    });
    const hostGame = api.lobby.joinGame.useMutation({
        onSuccess: (data) => {
            setStoredRoomCode(data.roomCode);
            setGameId(data.gameId);
            setInitBoard(data.board);
            joinGame.reset();
        }
    })
    // auto-join a room you already joined
    /* useEffect(() => {
        if (storedRoomCode === '') return;
        joinGame.mutate({
            roomCode: storedRoomCode.toUpperCase(),
            newGame: false
        });
    }, [storedRoomCode, userId, joinGame]) */

    function handleJoinGame(e: FormEvent) {
        e.preventDefault();
        // TODO: joinGame mutation gets called twice this way
        joinGame.mutate({
            roomCode: roomCode.toUpperCase(),
            newGame: false
        });

    }

    function handleHostGame(e: FormEvent) {
        e.preventDefault();
        hostGame.mutate({
            newGame: true
        });
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
        if (storedRoomCode !== '' && initBoard && gameId) {
            return (
                <>
                    <Button onClick={handleLeaveRoom} variant="secondary">Leave Room: {storedRoomCode}</Button>
                    <GameManager gameId={gameId} initBoard={initBoard} roomCode={storedRoomCode} />
                </>
            )
        } else {
            return (
                <div className="flex flex-col items-center m-3 space-y-6">
                    <h1 className="text-3xl">WORDS WORDS WORDS</h1>
                    <div className="space-y-8">
                        <Button className="w-full bg-green-500" onClick={handleHostGame}>Start a Game</Button>
                        <div className="flex items-center space-x-2">
                            <hr className="flex-grow border-zinc-200" />
                            <span className="text-zinc-400 text-sm">OR</span>
                            <hr className="flex-grow border-zinc-200 dark:border-zinc-700" />
                        </div>
                        <div>
                            <form className="w-full flex flex-row gap-2" onSubmit={handleJoinGame}>
                                <Input className="basis-1/2 text-xs" onChange={handleRoomCodeInputChange} placeholder="enter room code" maxLength={4}
                                    /* inputProps={roomCodeInputProps} */ value={roomCode} /* helperText={joinGame.error?.message} */ />
                                <Button className="basis-1/2" type="submit" disabled={roomCode.length !== 4 || hostGame.isLoading} variant="outline">
                                    Join Game
                                </Button>
                            </form>
                            {joinGame.isError &&
                                <div className="text-sm text-red-500">{joinGame.error.message}</div>}
                        </div>
                    </div>
                </div>
            )
        }
    }

    return lobbyBody();
}


