import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { UserIdProvider } from "~/components/useUserIdContext";
import { getUserIdFromSessionStorage, uniqueId } from "~/utils/helpers";
import { CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react"


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { useIsClient } from "~/components/customHooks";
import { Session } from "next-auth";



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }, }) => {
    
    
    return (
      <SessionProvider session={session}>
        <CssBaseline>
          <Component {...pageProps} />
        </CssBaseline>
      </SessionProvider>
    )
};

export default api.withTRPC(MyApp);
