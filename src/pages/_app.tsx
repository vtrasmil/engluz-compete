import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import { useSessionStorage } from '@react-hooks-library/core';
import * as Ably from "ably";
import { AblyProvider } from "ably/react";
import { type AppType } from "next/app";
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // or any other pipeline
import type { CSSProperties } from "react";
import { DndProvider, usePreview } from 'react-dnd-multi-backend';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import ErrorPage from '~/components/ErrorPage';
import GameManager from '~/components/GameManager';
import type { DraggedLetter } from "~/components/LetterBlock";
import { GameInfo, RoomInfo, SessionInfo } from '~/components/Types';
import WaitingRoom from '~/components/WaitingRoom';
import { useIsClient } from "~/components/hooks/useIsClient";
import { UserIdProvider } from "~/components/hooks/useUserIdContext";
import "~/styles/globals.css";
import { api, getBaseUrl } from "~/utils/api";
import { uniqueId } from "~/utils/helpers";
import Home from '.';

const MyDragPreview = () => {
  const preview = usePreview<DraggedLetter, HTMLDivElement>();
  if (!preview.display) {
    return null;
  }
  const { itemType, item, style } = preview;
  const newStyle: CSSProperties = { ...style, width: '50px', height: '50px' }
  return (
    <div className="item-list__item border border-gray-400" style={newStyle}>
      <div className={'w-full h-full flex justify-center items-center'}>{item.letters[0]}</div>
    </div>
  )
}

const MyApp: AppType = ({ Component, pageProps }) => {
  const [userId, setUserId] = useSessionStorage('userId', uniqueId('user'))
  const [sessionInfo, setSessionInfo] = useSessionStorage<SessionInfo | undefined>('sessionInfo', undefined)
  const gameInfoQuery = api.lobby.fetchGameInfo.useQuery(
    { gameId: sessionInfo?.gameId },
    { enabled: sessionInfo != undefined }
  ); // get from redis
  const roomInfoQuery = api.lobby.fetchRoomInfo.useQuery(
    { roomCode: sessionInfo?.roomCode },
    { enabled: sessionInfo != undefined }
  )

  const isClient = useIsClient(); // to avoid sessionStorage-related hydration errors
  if (!isClient) {
    return null;
  }

  const client = new Ably.Realtime.Promise({
    authUrl: `${getBaseUrl()}/api/createTokenRequest`,
    authHeaders: {
      'userId': userId
    }
  });

  function handleLeaveRoom() {
    setSessionInfo(undefined);
  }

  function handleSetSessionInfo(playerName: string, isHost: boolean, gameId: string, roomCode: string) {
    setSessionInfo({
      playerName: playerName,
      isHost: isHost,
      gameId: gameId,
      roomCode: roomCode
    });
  }

  function getRoomCodeRoute(session: SessionInfo | undefined, game: GameInfo | undefined, room: RoomInfo | undefined) {
    if (session != undefined) {
      if (gameInfoQuery.isSuccess && game && room) {
        return <GameManager gameId={game.gameId} initBoard={game.state.board}
          roomCode={game.roomCode} playersOrdered={room.players} onLeaveRoom={handleLeaveRoom} />
      } else {
        return <WaitingRoom
          basePlayer={{ userId: userId, playerName: session.playerName, isHost: session.isHost }}
          gameId={session.gameId} roomCode={session.roomCode} onLeaveRoom={handleLeaveRoom} />
      }
    } else {
      return <Navigate to={'/'} />;
    }
  }



  const router = createBrowserRouter([
    {
      path: "/",
      // element: <Component {...pageProps} />,
      element: <Home onSetSessionInfo={handleSetSessionInfo} />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/:roomCode",
      element: getRoomCodeRoute(sessionInfo, gameInfoQuery.data, roomInfoQuery.data),

    },
  ]);


  if (userId !== undefined)
    return (
      <AblyProvider client={client}>
        <DndProvider options={HTML5toTouch}>
          <UserIdProvider userId={userId}>
            <CssBaseline>
              {<MyDragPreview />}
              <RouterProvider router={router} />
            </CssBaseline>
          </UserIdProvider>
        </DndProvider>
      </AblyProvider>
    )
};

export default api.withTRPC(MyApp);
