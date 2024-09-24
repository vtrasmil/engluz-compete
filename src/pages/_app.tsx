import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import { type AppType } from "next/app";
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // or any other pipeline
import { useEffect, type CSSProperties } from "react";
import { DndProvider, usePreview } from 'react-dnd-multi-backend';
import type { DraggedLetter } from "~/components/LetterBlock";
import { type SessionInfo } from '~/components/Types';
import { useIsClient } from "~/components/hooks/useIsClient";
import { UserIdProvider } from "~/components/hooks/useUserIdContext";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import {uniqueId} from "~/utils/helpers";
import { useSessionStorage } from 'usehooks-ts';
import Layout from '~/components/Layout';
import AblyRealtimeProvider from "~/components/ably/ably-provider.tsx";



const MyDragPreview = () => {
  const preview = usePreview<DraggedLetter, HTMLDivElement>();
  if (!preview.display) {
    return null;
  }
  const { itemType, item, style, ref, monitor } = preview;
  const offset = monitor.getClientOffset();
  if (offset == null) return;
  const newStyle: CSSProperties = {
    ...style,
    width: '50px', height: '50px',
    WebkitTransform: `translateX(${offset.x - 50}px) translateY(${offset.y - 50}px)`,
    transform: `translateX(${offset.x - 50}px) translateY(${offset.y - 50}px)`,
    fontFamily: `Poppins, sans-serif`,
    fontWeight: 400,
    fontSize: `x-large`,
    zIndex: 20 // letterBlock is 10
  }
  return (
    <div className="item-list__item border border-gray-400" style={newStyle}>
      <div className={'w-full h-full flex justify-center items-center'}>{item.letters[0]}</div>
    </div>
  )
}

const MyApp: AppType = ({ Component, pageProps }) => {
  const [userId, setUserId] = useSessionStorage('userId', uniqueId('user'))
  const [sessionInfo, setSessionInfo] = useSessionStorage<SessionInfo | undefined>('sessionInfo', undefined)

  useEffect(() => {
    setUserId(userId); // must set for it to be stored in session
  }, [setUserId, userId])

  const isClient = useIsClient(); // to avoid sessionStorage-related hydration errors
  if (!isClient) {
    return null;
  }

  if (userId !== undefined)
    return (
      <AblyRealtimeProvider userId={userId}>
        <DndProvider options={HTML5toTouch}>
          <UserIdProvider userId={userId}>
            <CssBaseline>
              <MyDragPreview />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </CssBaseline>
          </UserIdProvider>
        </DndProvider>
      </AblyRealtimeProvider>
    )
};

export default api.withTRPC(MyApp);
