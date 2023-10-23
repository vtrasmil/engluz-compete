
import { api } from "~/utils/api";

import { useState, FormEvent, ChangeEvent } from "react";

import { Button, TextField } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';
import GameManager from "~/components/GameManager";
import { HostGameButton, JoinGameButton } from "~/components/LobbyButtons";
import { BoardConfiguration } from "./Board";

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
    const hostGame = api.lobby.hostGame.useMutation({
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
            userId: userId
        });
    }, [storedRoomCode, userId, joinGame]) */

    function handleJoinGame(e: FormEvent) {
        e.preventDefault();
        // TODO: joinGame mutation gets called twice this way
        joinGame.mutate({
            roomCode: roomCode.toUpperCase(),
            userId: userId
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

    return (
        <>
            {storedRoomCode !== '' && initBoard && gameId ?
                <>
                    <Button onClick={handleLeaveRoom}>Leave Room: {storedRoomCode}</Button>
                    <GameManager gameId={gameId} initBoard={initBoard} roomCode={storedRoomCode}  />
                </>
                :
                <>
                    <form className="flex flex-row" onSubmit={handleHostGame}>
                        <HostGameButton/>
                    </form>
                    <form className="flex flex-row" onSubmit={handleJoinGame}>
                        <TextField className="flex-1" onChange={handleRoomCodeInputChange} placeholder="enter room code"
                            autoFocus={true} inputProps={roomCodeInputProps} value={roomCode} helperText={joinGame.error?.message} />
                        <JoinGameButton disabled={isJoinGameDisabled()} />
                    </form>
                </>
            }
        </>
    )
}


