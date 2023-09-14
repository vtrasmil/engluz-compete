
import { api } from "~/utils/api";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

import { Input, Button } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';
import GameManager from "~/components/GameManager";
import { HostGameButton, JoinGameButton } from "~/components/LobbyButtons";

interface LobbyProps {
    userId: string,
}

export default function Lobby({userId}: LobbyProps) {
    
    const [roomCode, setRoomCode] = useState('');
    // TODO: storedRoomCode not being retrieved on reload
    const [storedRoomCode, setStoredRoomCode] = useSessionStorage('roomCode', '');
    const [gameId, setGameId] = useState<string>();
    const [initBoard, setInitBoard] = useState<string | undefined>();
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

    useEffect(() => {
        if (storedRoomCode === '') return;
        joinGame.mutate({
            roomCode: storedRoomCode.toUpperCase(),
            userId: userId
        });
    }, [storedRoomCode])

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



    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setRoomCode(e.target.value);
    }

    return (
        <>
            {storedRoomCode !== '' && initBoard && gameId ? 
            {storedRoomCode !== '' && initBoard && gameId ?
                <>
                    <Button onClick={handleLeaveRoom}>Leave Room: {storedRoomCode}</Button>
                    <GameManager gameId={gameId} initBoard={initBoard} />
                    <GameManager gameId={gameId} initBoard={initBoard} roomCode={storedRoomCode}  />
                </>
                :
                <>
                    <form className="flex flex-row" onSubmit={handleHostGame}>
                        <HostGameButton/>
                    </form>
                    <form className="flex flex-row" onSubmit={handleJoinGame}>
                        <Input className="flex-1" onChange={handleChange} placeholder="enter room code" autoFocus={true} />
                        <JoinGameButton disabled={isJoinGameDisabled()} />
                    </form>
                    {joinGame.error && <div>Something went wrong! {joinGame.error.message}</div>}
                </>
            }
        </>
    )
}


