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
