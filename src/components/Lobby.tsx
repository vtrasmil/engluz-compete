
import { api } from "~/utils/api";

import { useState, FormEvent, ChangeEvent } from "react";

import { Button, TextField } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';
import GameManager from "~/components/GameManager";
import { BoardConfiguration } from "./Board";
import { LoadingButton } from "@mui/lab";

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
        }
    });
    const hostGame = api.lobby.joinGame.useMutation({
        onSuccess: (data) => {
            setStoredRoomCode(data.roomCode);
            setInitBoard(data.board);
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
        joinGame.mutate({
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

    return (
        <>
            {storedRoomCode !== '' && initBoard && gameId ?
                <>
                    <Button onClick={handleLeaveRoom}>Leave Room: {storedRoomCode}</Button>
                    <GameManager gameId={gameId} initBoard={initBoard} roomCode={storedRoomCode}  />
                </>
                :
                <div className="flex flex-col items-center m-3">
                    <h1 className="text-3xl mb-10">WORDS WORDS WORDS</h1>
                    <form className="" onSubmit={handleHostGame}>
                        <LoadingButton loading={joinGame.isLoading} variant="contained" type="submit">Host Game</LoadingButton>
                    </form>
                    <p className="my-10">－ OR －</p>
                    <form className="flex flex-col w-44" onSubmit={handleJoinGame}>
                        <TextField className="flex-1" onChange={handleRoomCodeInputChange} placeholder="enter room code"
                            autoFocus={true} inputProps={roomCodeInputProps} value={roomCode} helperText={joinGame.error?.message} />
                        <LoadingButton loading={joinGame.isLoading} variant="contained" type="submit" className="flex-1" disabled={isJoinGameDisabled()}>Join Game</LoadingButton>
                    </form>
                </div>

            }
        </>
    )
}


