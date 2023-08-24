
import { api } from "~/utils/api";

import { useContext, PropsWithChildren, useEffect, useState, FormEvent, ChangeEvent, ChangeEventHandler, ReactNode, useSyncExternalStore } from "react";

import { Input, Button } from "@mui/material";
import { useSessionStorage } from "usehooks-ts";
import { useIsClient } from "~/components/customHooks";
import GameManager from "~/components/GameManager";
import { HostGameButton, JoinGameButton } from "~/components/LobbyButtons";

export default function Lobby() {
    const isClient = useIsClient(); // to avoid sessionStorage-related hydration errors
    const [roomCode, setRoomCode] = useState('');
    const [storedRoomCode, setStoredRoomCode] = useSessionStorage('roomCode', '');
    const [initBoard, setInitBoard] = useState<string | undefined>();
    const joinGame = api.example.joinGame.useMutation({
        onSuccess: async (data) => {
            setStoredRoomCode(roomCode);
            setInitBoard(data.board);
        }
    });

    const hostGame = api.example.hostGame.useMutation({
        onSuccess: async (data) => {
            setStoredRoomCode(data.roomCode);
            setInitBoard(data.board);
        }
    })

    useEffect(() => {
        // if (storedRoomCode === '') return;
        joinGame.mutate({
            // roomCode: storedRoomCode.toUpperCase(),
            roomCode: 'GTWE'
        });
    }, [])

    if (!isClient) {
        return null;
    }

    // const isCorrectRoomCodeSaved =
    //   (typeof savedRoomCode === 'string' && validRoomCodes.includes(savedRoomCode)) ? true : false;

    function handleJoinGame(e: FormEvent) {
        e.preventDefault();
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



    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setRoomCode(e.target.value);
    }

    return (
        <>
            {storedRoomCode &&
                <>
                    <Button onClick={handleLeaveRoom}>Leave Room: {storedRoomCode}</Button>
                </>
            }
            
            {storedRoomCode !== '' && initBoard ? 
                <GameManager gameId={'1234'} initBoard={initBoard} />
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


